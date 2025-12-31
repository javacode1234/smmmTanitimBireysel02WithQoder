// PDF Export Utilities using jsPDF
import jsPDF from 'jspdf'

type ContactMessage = {
  id: string
  createdAt: string | number | Date
  status: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

type JobApplication = {
  id: string
  createdAt: string | number | Date
  status: string
  name: string
  email: string
  phone: string
  position: string
  experience: string
  education: string
  coverLetter?: string
  cvFileName?: string
}

type QuoteRequest = {
  id: string
  createdAt: string | number | Date
  status: string
  name: string
  email: string
  phone: string
  company?: string
  serviceType: string
  message: string
}

export const exportContactMessageToPDF = (message: ContactMessage) => {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(16)
  doc.text('ILETISIM MESAJI DETAYLARI', 20, 20)
  
  // Line separator
  doc.setLineWidth(0.5)
  doc.line(20, 25, 190, 25)
  
  // Basic Info
  doc.setFontSize(10)
  let y = 35
  doc.text(`ID: ${message.id}`, 20, y)
  y += 7
  doc.text(`Tarih: ${new Date(message.createdAt).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 20, y)
  y += 7
  doc.text(`Durum: ${getStatusLabel(message.status)}`, 20, y)
  
  // Contact Info Section
  y += 15
  doc.setFontSize(12)
  doc.text('ILETISIM BILGILERI', 20, y)
  y += 7
  doc.setFontSize(10)
  doc.text(`Ad Soyad: ${message.name}`, 20, y)
  y += 7
  doc.text(`E-posta: ${message.email}`, 20, y)
  y += 7
  doc.text(`Telefon: ${message.phone}`, 20, y)
  y += 7
  doc.text(`Konu: ${message.subject}`, 20, y)
  
  // Message Section
  y += 15
  doc.setFontSize(12)
  doc.text('MESAJ ICERIGI', 20, y)
  y += 7
  doc.setFontSize(10)
  const splitMessage = doc.splitTextToSize(message.message, 170)
  doc.text(splitMessage, 20, y)
  
  // Footer
  y += splitMessage.length * 7 + 15
  if (y > 270) {
    doc.addPage()
    y = 20
  }
  doc.setFontSize(8)
  doc.text(`Bu belge ${new Date().toLocaleDateString('tr-TR')} tarihinde olusturulmustur.`, 20, y)
  
  // Save
  doc.save(`mesaj_${message.id}.pdf`)
}

export const exportJobApplicationToPDF = (application: JobApplication) => {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(16)
  doc.text('IS BASVURUSU DETAYLARI', 20, 20)
  
  // Line separator
  doc.setLineWidth(0.5)
  doc.line(20, 25, 190, 25)
  
  // Basic Info
  doc.setFontSize(10)
  let y = 35
  doc.text(`ID: ${application.id}`, 20, y)
  y += 7
  doc.text(`Tarih: ${new Date(application.createdAt).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 20, y)
  y += 7
  doc.text(`Durum: ${getJobStatusLabel(application.status)}`, 20, y)
  
  // Applicant Info Section
  y += 15
  doc.setFontSize(12)
  doc.text('BASVURAN BILGILERI', 20, y)
  y += 7
  doc.setFontSize(10)
  doc.text(`Ad Soyad: ${application.name}`, 20, y)
  y += 7
  doc.text(`E-posta: ${application.email}`, 20, y)
  y += 7
  doc.text(`Telefon: ${application.phone}`, 20, y)
  y += 7
  doc.text(`Pozisyon: ${application.position}`, 20, y)
  y += 7
  doc.text(`Deneyim: ${application.experience}`, 20, y)
  y += 7
  doc.text(`Egitim: ${application.education}`, 20, y)
  
  // Cover Letter Section
  y += 15
  doc.setFontSize(12)
  doc.text('ON YAZI', 20, y)
  y += 7
  doc.setFontSize(10)
  const splitCoverLetter = doc.splitTextToSize(application.coverLetter || "", 170)
  doc.text(splitCoverLetter, 20, y)
  
  // CV File Info
  y += splitCoverLetter.length * 7 + 15
  if (y > 250) {
    doc.addPage()
    y = 20
  }
  doc.setFontSize(12)
  doc.text('CV DOSYASI', 20, y)
  y += 7
  doc.setFontSize(10)
  doc.text(`Dosya Adi: ${application.cvFileName}`, 20, y)
  
  // Footer
  y += 15
  if (y > 270) {
    doc.addPage()
    y = 20
  }
  doc.setFontSize(8)
  doc.text(`Bu belge ${new Date().toLocaleDateString('tr-TR')} tarihinde olusturulmustur.`, 20, y)
  
  // Save
  doc.save(`basvuru_${application.id}.pdf`)
}

export const exportQuoteRequestToPDF = (request: QuoteRequest) => {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(16)
  doc.text('TEKLIF TALEBI DETAYLARI', 20, 20)
  
  // Line separator
  doc.setLineWidth(0.5)
  doc.line(20, 25, 190, 25)
  
  // Basic Info
  doc.setFontSize(10)
  let y = 35
  doc.text(`ID: ${request.id}`, 20, y)
  y += 7
  doc.text(`Tarih: ${new Date(request.createdAt).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 20, y)
  y += 7
  doc.text(`Durum: ${getQuoteStatusLabel(request.status)}`, 20, y)
  
  // Contact Info Section
  y += 15
  doc.setFontSize(12)
  doc.text('ILETISIM BILGILERI', 20, y)
  y += 7
  doc.setFontSize(10)
  doc.text(`Ad Soyad: ${request.name}`, 20, y)
  y += 7
  doc.text(`Sirket: ${request.company}`, 20, y)
  y += 7
  doc.text(`E-posta: ${request.email}`, 20, y)
  y += 7
  doc.text(`Telefon: ${request.phone}`, 20, y)
  y += 7
  doc.text(`Hizmet Turu: ${request.serviceType}`, 20, y)
  
  // Request Message Section
  y += 15
  doc.setFontSize(12)
  doc.text('TALEP MESAJI', 20, y)
  y += 7
  doc.setFontSize(10)
  const splitMessage = doc.splitTextToSize(request.message, 170)
  doc.text(splitMessage, 20, y)
  
  // Footer
  y += splitMessage.length * 7 + 15
  if (y > 270) {
    doc.addPage()
    y = 20
  }
  doc.setFontSize(8)
  doc.text(`Bu belge ${new Date().toLocaleDateString('tr-TR')} tarihinde olusturulmustur.`, 20, y)
  
  // Save
  doc.save(`teklif_${request.id}.pdf`)
}

export const exportAccountSummaryToPDF = (summary: { customerName: string; year: number; rows: Array<{ id: string; description: string; amount: number; dueDate: string; isPaid?: boolean; paymentDate?: string | null }>; total: number; paid: number; carryForward: number }) => {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('HESAP OZETI', 20, 20)
  doc.setLineWidth(0.5)
  doc.line(20, 25, 190, 25)
  doc.setFontSize(10)
  let y = 35
  doc.text(`Müşteri: ${summary.customerName}`, 20, y); y += 7
  doc.text(`Yıl: ${summary.year}`, 20, y); y += 12
  doc.setFontSize(12)
  doc.text('TAHAKKUKLAR', 20, y); y += 7
  doc.setFontSize(10)
  summary.rows.forEach((r) => {
    if (y > 270) { doc.addPage(); y = 20 }
    const paidText = r.isPaid ? ` (Ödendi ${r.paymentDate ? new Date(r.paymentDate).toLocaleDateString('tr-TR') : ''})` : ''
    doc.text(`- ${r.description} | ${new Date(r.dueDate).toLocaleDateString('tr-TR')} | ${r.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}${paidText}`, 20, y)
    y += 6
  })
  y += 10
  if (y > 270) { doc.addPage(); y = 20 }
  doc.setFontSize(12)
  doc.text('OZET', 20, y); y += 7
  doc.setFontSize(10)
  doc.text(`Toplam Borç: ${summary.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}`, 20, y); y += 6
  doc.text(`Toplam Ödeme: ${summary.paid.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}`, 20, y); y += 6
  doc.text(`Devreden Bakiye: ${summary.carryForward.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}`, 20, y); y += 12
  doc.setFontSize(8)
  doc.text(`Bu belge ${new Date().toLocaleDateString('tr-TR')} tarihinde olusturulmustur.`, 20, y)
  doc.save(`hesap_ozeti_${summary.customerName}_${summary.year}.pdf`)
}



// Status label helpers
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    NEW: 'Yeni',
    PENDING: 'Beklemede',
    REPLIED: 'Yanıtlandı',
    RESOLVED: 'Çözüldü',
  }
  return labels[status] || status
}

const getJobStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    NEW: 'Yeni',
    REVIEWING: 'İnceleniyor',
    INTERVIEWED: 'Görüşme Yapıldı',
    REJECTED: 'Reddedildi',
    ACCEPTED: 'Kabul Edildi',
  }
  return labels[status] || status
}

const getQuoteStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PENDING: 'Beklemede',
    REVIEWED: 'İncelendi',
    CONTACTED: 'İletişime Geçildi',
    COMPLETED: 'Tamamlandı',
  }
  return labels[status] || status
}
