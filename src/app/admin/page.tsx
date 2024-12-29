import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { db } from "@/lib/prisma"
import { formatCurrency, formatNumber } from "@/lib/formatters"

async function getSalesData() {
  const data = await db.order.aggregate({
    _sum: {
      price: true
    },
    _count: {
      _all: true
    }
  })

  console.log('Sales Data:', data);

  const result = {
    amount: data._sum.price ?? 0,
    numberOfSales: data._count._all,
  }

  console.log('Formatted Sales Data:', result);
  return result;
}

async function getUserData() {
  const [userCount, orderData] = await Promise.all([
    db.user.count(),
    db.order.aggregate({
      _sum: {
        price: true
      }
    }),
  ])

  console.log('User Count:', userCount);
  console.log('Order Data:', orderData);

  const result = {
    userCount,
    averageValuePerUser: userCount === 0 ? 0 : (orderData._sum.price ?? 0) / userCount,
  }

  console.log('Formatted User Data:', result);
  return result;
}

async function getProductData() {
  const [activeCount, inactiveCount] = await Promise.all([
    db.product.count({ where: { isAvailableForPurchase: true } }),
    db.product.count({ where: { isAvailableForPurchase: false } }),
  ])

  return { activeCount, inactiveCount }
}

export default async function AdminDashboard() {
  const [salesData, userData, productData] = await Promise.all([
    getSalesData(),
    getUserData(),
    getProductData(),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Total Sales"
          subtitle="Lifetime revenue"
          body={formatCurrency(salesData.amount)}
        />
        <DashboardCard
          title="Number of Sales"
          subtitle="Total orders processed"
          body={formatNumber(salesData.numberOfSales)}
        />
        <DashboardCard
          title="Average Value Per User"
          subtitle="Revenue per customer"
          body={formatCurrency(userData.averageValuePerUser)}
        />
        <DashboardCard
          title="Number of Users"
          subtitle="Registered customers"
          body={formatNumber(userData.userCount)}
        />
        <DashboardCard
          title="Active Products"
          subtitle="Currently purchasable items"
          body={formatNumber(productData.activeCount)}
        />
        <DashboardCard
          title="Inactive Products"
          subtitle="Items not available"
          body={formatNumber(productData.inactiveCount)}
        />
      </div>
    </div>
  )
}

interface DashboardCardProps {
  title: string
  subtitle: string
  body: string
}

function DashboardCard({ title, subtitle, body }: DashboardCardProps) {
  return (
    <Card className="bg-white hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold tracking-tight">{title}</CardTitle>
        <CardDescription className="text-sm text-gray-500">{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{body}</div>
      </CardContent>
    </Card>
  )
}
