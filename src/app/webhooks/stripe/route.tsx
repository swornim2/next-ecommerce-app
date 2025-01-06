import db from "@/db/db"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { Resend } from "resend"
import PurchaseReceiptEmail from "@/email/PurchaseReceipt"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' // Specify the version to avoid runtime errors
})

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Missing required Stripe environment variables')
      return new NextResponse('Configuration Error', { status: 500 })
    }

    const event = await stripe.webhooks.constructEvent(
      await req.text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )

    if (event.type === "charge.succeeded") {
      const charge = event.data.object
      const productId = charge.metadata.productId
      const email = charge.billing_details.email
      const pricePaidInCents = charge.amount

      const product = await db.product.findUnique({ where: { id: productId } })
      if (product == null || email == null) {
        return new NextResponse("Bad Request", { status: 400 })
      }

      // First, ensure the user exists
      const user = await db.user.upsert({
        where: { email },
        create: { email },
        update: {},
      })

      // Then create the order
      const order = await db.order.create({
        data: {
          userId: user.id,
          productId,
          price: pricePaidInCents,
        },
      })

      const downloadVerification = await db.downloadVerification.create({
        data: {
          productId,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      })

      // Only attempt to send email if Resend is configured
      if (resend) {
        try {
          await resend.emails.send({
            from: `Support <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: "Order Confirmation",
            react: (
              <PurchaseReceiptEmail
                order={order}
                product={product}
                downloadVerificationId={downloadVerification.id}
              />
            ),
          })
        } catch (emailError) {
          console.error('Failed to send email:', emailError)
          // Continue processing even if email fails
        }
      }
    }

    return new NextResponse()
  } catch (error) {
    console.error('Webhook error:', error)
    return new NextResponse(
      'Webhook handler failed. View logs.',
      { status: 500 }
    )
  }
}
