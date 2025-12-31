
export interface DeclarationLogicInput {
  companyType: "PERSONAL" | "CAPITAL"
  ledgerType?: string | null
  hasEmployees: boolean
}

export interface DeclarationConfigSuggestion {
  type: string
  frequency: "MONTHLY" | "QUARTERLY" | "YEARLY"
  dueDay?: number
  dueHour?: number
  dueMinute?: number
  dueMonth?: number // For Yearly
  quarterOffset?: number // For Quarterly
  yearlyCount?: number
  skipQuarter?: boolean // For avoiding 4th quarter provisional tax
  quarters?: number[] // [1,2,3,4]
}

export const DECLARATION_TYPES = {
  KDV: "KDV",
  MUHTASAR: "Muhtasar",
  MUHTASAR_SGK: "Muhtasar ve Prim Hizmet",
  GECICI_KURUM: "Kurum Geçici Vergi",
  GECICI_GELIR: "Gelir Geçici Vergi",
  KURUMLAR: "Kurumlar Vergisi",
  GELIR: "Yıllık Gelir Vergisi",
}

export function determineApplicableDeclarations(input: DeclarationLogicInput): DeclarationConfigSuggestion[] {
  const suggestions: DeclarationConfigSuggestion[] = []
  
  // 1. KDV (Always Monthly)
  // Usually due on the 28th of the following month
  suggestions.push({
    type: DECLARATION_TYPES.KDV,
    frequency: "MONTHLY",
    dueDay: 28,
    dueHour: 23,
    dueMinute: 59
  })

  // 2. Muhtasar / Muhtasar SGK
  // If has employees -> Monthly "Muhtasar ve Prim Hizmet"
  // If no employees -> Quarterly "Muhtasar" (Jan-Mar -> Apr 26)
  if (input.hasEmployees) {
    suggestions.push({
      type: DECLARATION_TYPES.MUHTASAR_SGK,
      frequency: "MONTHLY",
      dueDay: 26,
      dueHour: 23,
      dueMinute: 59
    })
  } else {
    // Quarterly Muhtasar
    // Periods: Jan-Mar (due Apr), Apr-Jun (due Jul), Jul-Sep (due Oct), Oct-Dec (due Jan)
    suggestions.push({
      type: DECLARATION_TYPES.MUHTASAR,
      frequency: "QUARTERLY",
      quarterOffset: 1, // Due in the month following the quarter
      dueDay: 26,
      dueHour: 23,
      dueMinute: 59,
      quarters: [1, 2, 3, 4]
    })
  }

  // 3. Geçici Vergi (Provisional Tax)
  // Due on 17th of the 2nd month following the quarter (May, Aug, Nov)
  // 4th quarter is usually skipped or handled differently (user scenarios only list 3 terms for all cases)
  // For Income Tax Payers (Personal), 4th term is abolished.
  // For Corporate Tax Payers (Capital), user scenario also implies only 3 terms (May, Aug, Nov).
  
  const provisionalTaxType = input.companyType === "CAPITAL" 
    ? DECLARATION_TYPES.GECICI_KURUM 
    : DECLARATION_TYPES.GECICI_GELIR

  suggestions.push({
    type: provisionalTaxType,
    frequency: "QUARTERLY",
    quarterOffset: 2, // Due in the 2nd month after quarter end (e.g., Q1 end Mar -> May)
    dueDay: 17,
    dueHour: 23,
    dueMinute: 59,
    quarters: [1, 2, 3], // Only first 3 quarters
    skipQuarter: true // Explicitly skip 4th quarter logic if any
  })

  // 4. Annual Tax (Gelir / Kurumlar)
  if (input.companyType === "CAPITAL") {
    // Kurumlar Vergisi -> Next Year April 30
    suggestions.push({
      type: DECLARATION_TYPES.KURUMLAR,
      frequency: "YEARLY",
      dueMonth: 4, // April
      dueDay: 30,
      dueHour: 23,
      dueMinute: 59
    })
  } else {
    // Gelir Vergisi -> Next Year March 31
    suggestions.push({
      type: DECLARATION_TYPES.GELIR,
      frequency: "YEARLY",
      dueMonth: 3, // March
      dueDay: 31,
      dueHour: 23,
      dueMinute: 59
    })
  }

  return suggestions
}
