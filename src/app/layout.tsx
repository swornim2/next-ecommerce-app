import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bestbuy Store",
  description: "Your one-stop shop for home and kitchen appliances",
};

function Loading() {
  return <div>Loading...</div>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col m-0 p-0`}>
        <ClientLayout>
          <main className="flex-1 m-0 p-0">
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </main>
        </ClientLayout>
      </body>
    </html>
  );
}
