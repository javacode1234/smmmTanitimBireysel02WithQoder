
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { DeclarationsClientPage } from "./client-page"

export default async function ClientDeclarationsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  // Get the customer linked to this user
  const customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { authorizedEmail: session.user.email },
        { username: session.user.email }
      ]
    }
  })

  if (!customer) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Hata</h1>
        <p className="mt-2 text-gray-600">Kullanıcı hesabınızla ilişkili bir müşteri kaydı bulunamadı.</p>
      </div>
    )
  }

  // Parse filters
  // Default to current year if not specified
  const currentYear = new Date().getFullYear().toString()
  const selectedYear = typeof searchParams.year === 'string' ? searchParams.year : currentYear

  // Build where clause
  const whereClause: any = {
    customerId: customer.id
  }

  if (selectedYear !== 'all') {
    whereClause.year = parseInt(selectedYear)
  }

  // Fetch filtered tax returns
  const taxReturns = await prisma.taxreturn.findMany({
    where: whereClause,
    orderBy: {
      dueDate: 'desc'
    },
    take: 1000 // Reasonable limit for a single client
  })

  // Get available years for filter
  const yearData = await prisma.taxreturn.findMany({
    where: { customerId: customer.id },
    select: { year: true },
    distinct: ['year'],
    orderBy: { year: 'desc' }
  })
  const years = yearData.map(y => y.year)

  // Ensure current year is in the list
  const currentYearInt = new Date().getFullYear()
  if (!years.includes(currentYearInt)) {
    years.unshift(currentYearInt)
    years.sort((a, b) => b - a)
  }

  // Calculate stats based on FILTERED data
  const totalDeclarations = taxReturns.length
  const submittedDeclarations = taxReturns.filter(t => t.isSubmitted).length
  const pendingDeclarations = taxReturns.filter(t => !t.isSubmitted).length
  
  // Calculate upcoming due dates (next 7 days)
  // Only relevant if they are in the filtered set
  const today = new Date()
  const nextWeek = new Date()
  nextWeek.setDate(today.getDate() + 7)
  
  const upcomingDeclarations = taxReturns.filter(t => 
    !t.isSubmitted && 
    new Date(t.dueDate) >= today && 
    new Date(t.dueDate) <= nextWeek
  ).length

  // Serialize dates for client component
  const serializedData = taxReturns.map(t => ({
    ...t,
    dueDate: t.dueDate.toISOString(),
    submittedDate: t.submittedDate ? t.submittedDate.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }))

  return (
    <DeclarationsClientPage 
      data={serializedData}
      stats={{
        total: totalDeclarations,
        submitted: submittedDeclarations,
        pending: pendingDeclarations,
        upcoming: upcomingDeclarations
      }}
      years={years}
      selectedYear={selectedYear}
    />
  )
}
