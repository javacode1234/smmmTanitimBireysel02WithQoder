import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion } from "@/components/ui/accordion"
import { 
  GeneralInfoSection, 
  ContactInfoSection, 
  PartnersSection, 
  CapitalSection, 
  BranchesSection, 
  ActivitiesSection, 
  ChambersSection, 
  AuthorizedPersonsSection, 
  DeclarationsSection, 
  DocumentsSection, 
  FeesSection, 
  TransactionsSection, 
  ConstitutionSection,
  PasswordsSection
} from "@/components/client/company-profile/profile-sections"

export default async function CompanyProfilePage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Find customer by session ID (which is customer.id for logged in customers)
  const customer = await prisma.customer.findUnique({
    where: {
      id: session.user.id
    },
    include: {
      taxOffice: true,
      accountingperiod: {
        orderBy: { year: 'desc' },
        take: 1
      }
    }
  })

  if (!customer) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Şirket Profili Bulunamadı</CardTitle>
            <CardDescription>
              Bu hesaba bağlı bir şirket profili bulunamadı. Lütfen mali müşavirinizle iletişime geçin.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Parse JSON fields safely
  const parseJson = (jsonString: string | null) => {
    if (!jsonString) return []
    try {
      const parsed = JSON.parse(jsonString)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const parseJsonObject = (jsonString: string | null) => {
    if (!jsonString) return null
    try {
      return JSON.parse(jsonString)
    } catch {
      return null
    }
  }

  const partners = parseJson(customer.partners)
  const branches = parseJson(customer.branches)
  const activities = parseJson(customer.activities)
  const chambers = parseJson(customer.chambers)
  const authorizedPersons = parseJson(customer.authorizedPersons)
  const documents = parseJson(customer.documents)
  const passwords = parseJsonObject(customer.passwords)
  const capitalInfo = parseJsonObject(customer.capitals)
  const transactions = parseJson(customer.transactions)
  
  // Calculate running balance for transactions
  let runningBalance = 0
  const transactionsWithBalance = transactions.map((t: any) => {
    const debit = Number(t.debit || 0)
    const credit = Number(t.credit || 0)
    runningBalance += debit - credit
    return { ...t, balance: runningBalance }
  }).reverse() // Show newest first

  // Fetch activity code details if exists
  let activityCodeData = null
  if (customer.mainActivityCode) {
    activityCodeData = await prisma.activitycode.findFirst({
      where: {
        OR: [
          { id: customer.mainActivityCode },
          { code: customer.mainActivityCode }
        ]
      }
    })
  }

  // Fetch branch activity codes
  const branchActivityIds = branches
    .map((b: any) => b.activityCode)
    .filter((id: any) => typeof id === 'string' && id.length > 0)
  
  let branchActivityCodes: any[] = []
  if (branchActivityIds.length > 0) {
    branchActivityCodes = await prisma.activitycode.findMany({
      where: {
        id: { in: branchActivityIds }
      },
      select: {
        id: true,
        code: true,
        name: true
      }
    })
  }

  // Fetch additional activity codes for the activities section
  const activityIds = activities
    .map((a: any) => a.activityCode)
    .filter((id: any) => typeof id === 'string' && id.length > 0)
  
  let additionalActivityCodes: any[] = []
  if (activityIds.length > 0) {
    additionalActivityCodes = await prisma.activitycode.findMany({
      where: {
        id: { in: activityIds }
      },
      select: {
        id: true,
        code: true,
        name: true
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Şirket Profili</h1>
        <p className="text-muted-foreground mt-2">
          Şirketinizin tüm resmi bilgileri ve evrakları
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="general">
        
        <GeneralInfoSection customer={customer} activityCodeData={activityCodeData} />
        
        <ContactInfoSection customer={customer} />
        
        <PartnersSection partners={partners} />
        
        <CapitalSection capitalInfo={capitalInfo} partners={partners} />
        
        <BranchesSection branches={branches} activityCodes={branchActivityCodes} />
        
        <ActivitiesSection 
          activities={activities} 
          mainActivityCode={customer.mainActivityCode} 
          mainActivityData={activityCodeData}
          additionalActivityCodes={additionalActivityCodes}
        />
        
        <ChambersSection chambers={chambers} />
        
        <AuthorizedPersonsSection authorizedPersons={authorizedPersons} customer={customer} partners={partners} />
        
        <DeclarationsSection />
        
        <DocumentsSection documents={documents} />

        <PasswordsSection passwords={passwords} />
        
        <FeesSection customer={customer} />
        
        <TransactionsSection transactionsWithBalance={transactionsWithBalance} />
        
        <ConstitutionSection constitution={customer.constitution} />

      </Accordion>
    </div>
  )
}
