import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminLayoutClient from "./admin-layout-client"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  if (session.user.role !== "ADMIN") {
    // Eğer müşteri girişi yapmışsa client paneline yönlendir
    if (session.user.role === "CUSTOMER") {
        redirect("/client")
    }
    // Değilse (örn: yetkisiz bir rol) ana sayfaya veya signin'e
    redirect("/auth/signin")
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
