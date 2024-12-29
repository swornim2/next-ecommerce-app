import { AdminNavbar } from "./_components/AdminNavbar"

export const dynamic = "force-dynamic"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="max-w-[2000px] mx-auto">
        <main className="p-6 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
