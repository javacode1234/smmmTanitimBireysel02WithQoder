"use client"

import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { loadTurkishFont } from "@/lib/pdf-utils"

interface PdfExportButtonProps {
  type: "account" | "constitution" | "profile"
  data?: any
  profileData?: any
  fileName?: string
  title?: string
  customerName?: string
  dateRange?: string
  openingBalance?: number
  finalBalance?: number
}

export function PdfExportButton({ 
  type, 
  data,
  profileData,
  fileName = "belge", 
  title,
  customerName,
  dateRange,
  openingBalance,
  finalBalance
}: PdfExportButtonProps) {
  
  const handleExport = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const doc = new jsPDF()
    
    // Load Turkish font
    await loadTurkishFont(doc)
    
    // Helper for profile export
    const addSectionTitle = (text: string, y: number) => {
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.setFont("Roboto", "bold")
        doc.text(text, 14, y)
        doc.setFont("Roboto", "normal")
        doc.setFontSize(10)
        return y + 6
    }

    if (type === "profile" && profileData) {
        doc.setFontSize(18)
        doc.text(title || "Şirket Profili", 14, 15)
        
        doc.setFontSize(10)
        doc.text(`Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 22)
        
        let currentY = 30
        const { customer, partners, branches, activities, chambers, authorizedPersons, documents, capitalInfo, activityCodeData } = profileData

        // 1. Genel Bilgiler
        currentY = addSectionTitle("Genel Bilgiler", currentY)
        
        const generalInfo = [
            ["Ünvan", customer.name || "-"],
            ["Vergi Dairesi", customer.taxOffice?.name || "-"],
            ["Vergi No", customer.taxNumber || "-"],
            ["TCKN", customer.tckn || "-"],
            ["Kuruluş Tarihi", customer.establishmentDate ? new Date(customer.establishmentDate).toLocaleDateString('tr-TR') : "-"],
            ["Mersis No", customer.mersisNo || "-"],
            ["Ticaret Sicil No", customer.tradeRegistryNo || "-"],
            ["Web Sitesi", customer.website || "-"],
            ["Telefon", customer.phone || "-"],
            ["E-posta", customer.email || "-"],
            ["Adres", customer.address || "-"]
        ]

        autoTable(doc, {
            body: generalInfo,
            startY: currentY,
            theme: 'plain',
            styles: { fontSize: 10, font: "Roboto", cellPadding: 1.5 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
            margin: { left: 14 }
        })
        
        currentY = (doc as any).lastAutoTable.finalY + 10

        // 2. Ortaklar
        if (partners && partners.length > 0) {
            currentY = addSectionTitle("Ortaklar", currentY)
            const partnerRows = partners.map((p: any) => [
                p.fullName || p.name || "-",
                p.tckn || "-",
                p.shareAmount ? `${p.shareAmount} TL` : "-",
                p.shareRatio ? `%${p.shareRatio}` : "-",
                p.isManager ? "Müdür" : "Ortak"
            ])

            autoTable(doc, {
                head: [['Ad Soyad', 'TCKN', 'Pay Tutarı', 'Pay Oranı', 'Ünvan']],
                body: partnerRows,
                startY: currentY,
                theme: 'grid',
                styles: { fontSize: 9, font: "Roboto" },
                headStyles: { fillColor: [41, 128, 185] }
            })
            currentY = (doc as any).lastAutoTable.finalY + 10
        }

        // 3. Sermaye Bilgileri
        if (capitalInfo) {
             currentY = addSectionTitle("Sermaye Bilgileri", currentY)
             // Simple summary if capitalInfo is object, or list if array
             const capitals = Array.isArray(capitalInfo) ? capitalInfo : [capitalInfo]
             const activeCapitals = capitals.filter((c: any) => c.status === 'active' || !c.status)
             
             if (activeCapitals.length > 0) {
                 const capitalRows = activeCapitals.map((c: any) => [
                     c.totalCapital ? `${c.totalCapital} TL` : "-",
                     c.paidCapital ? `${c.paidCapital} TL` : "-",
                     c.unpaidCapital ? `${c.unpaidCapital} TL` : "-"
                 ])
                 
                 autoTable(doc, {
                    head: [['Toplam Sermaye', 'Ödenmiş Sermaye', 'Ödenmemiş Sermaye']],
                    body: capitalRows,
                    startY: currentY,
                    theme: 'grid',
                    styles: { fontSize: 9, font: "Roboto" },
                    headStyles: { fillColor: [41, 128, 185] }
                 })
                 currentY = (doc as any).lastAutoTable.finalY + 10
             }
        }

        // 4. Şubeler
        if (branches && branches.length > 0) {
            currentY = addSectionTitle("Şubeler", currentY)
            const branchRows = branches.map((b: any) => [
                b.name || "-",
                b.address || "-",
                b.isCentral ? "Merkez" : "Şube"
            ])
            
            autoTable(doc, {
                head: [['Şube Adı', 'Adres', 'Tip']],
                body: branchRows,
                startY: currentY,
                theme: 'grid',
                styles: { fontSize: 9, font: "Roboto" },
                headStyles: { fillColor: [41, 128, 185] }
            })
            currentY = (doc as any).lastAutoTable.finalY + 10
        }

        // 5. Faaliyetler
        if (activities && activities.length > 0) {
             currentY = addSectionTitle("Faaliyet Bilgileri", currentY)
             
             // Ana Faaliyet
             if (activityCodeData) {
                 doc.setFontSize(9)
                 doc.text(`Ana Faaliyet: ${activityCodeData.code} - ${activityCodeData.name}`, 14, currentY)
                 currentY += 6
             }

             const activityRows = activities.map((a: any) => [
                 a.code || a.activityCode || "-",
                 a.description || "-",
                 a.startDate ? new Date(a.startDate).toLocaleDateString('tr-TR') : "-",
                 a.status === 'PASSIVE' ? 'Pasif' : 'Aktif'
             ])
             
             autoTable(doc, {
                head: [['Kod', 'Açıklama', 'Başlangıç', 'Durum']],
                body: activityRows,
                startY: currentY,
                theme: 'grid',
                styles: { fontSize: 9, font: "Roboto" },
                headStyles: { fillColor: [41, 128, 185] }
             })
             currentY = (doc as any).lastAutoTable.finalY + 10
        }

        // 6. Odalar
        if (chambers && chambers.length > 0) {
            currentY = addSectionTitle("Oda Bilgileri", currentY)
            const chamberRows = chambers.map((c: any) => [
                c.chamberName || c.chamber || "-",
                c.registryNo || "-",
                c.chamberRegistryNo || "-",
                c.registerDate ? new Date(c.registerDate).toLocaleDateString('tr-TR') : "-"
            ])
            
            autoTable(doc, {
                head: [['Oda Adı', 'Ticaret Sicil No', 'Oda Sicil No', 'Kayıt Tarihi']],
                body: chamberRows,
                startY: currentY,
                theme: 'grid',
                styles: { fontSize: 9, font: "Roboto" },
                headStyles: { fillColor: [41, 128, 185] }
            })
            currentY = (doc as any).lastAutoTable.finalY + 10
        }

        // 7. Yetkililer
        if (authorizedPersons && authorizedPersons.length > 0) {
             currentY = addSectionTitle("Yetkili Kişiler", currentY)
             const authRows = authorizedPersons.map((p: any) => [
                 p.name || "-",
                 p.title || "-",
                 p.authorizationEndDate ? new Date(p.authorizationEndDate).toLocaleDateString('tr-TR') : (p.authorizationDuration ? `${p.authorizationDuration} Yıl` : "-")
             ])
             
             autoTable(doc, {
                head: [['Ad Soyad', 'Ünvan', 'Yetki Süresi']],
                body: authRows,
                startY: currentY,
                theme: 'grid',
                styles: { fontSize: 9, font: "Roboto" },
                headStyles: { fillColor: [41, 128, 185] }
             })
             currentY = (doc as any).lastAutoTable.finalY + 10
        }
        
        doc.save(`${fileName}.pdf`)
        return
    }

    doc.setFontSize(16)
    doc.text(title || (type === "account" ? "Cari Hesap Hareketleri" : "Ana Sözleşme"), 14, 15)
    
    doc.setFontSize(10)
    
    // Add Metadata (Customer Name, Date Range)
    let startY = 25
    if (customerName) {
      doc.text(`Firma: ${customerName}`, 14, startY)
      startY += 6
    }
    if (dateRange) {
      doc.text(`Tarih Aralığı: ${dateRange}`, 14, startY)
      startY += 6
    }
    
    // Add extra spacing before table
    startY += 4

    if (type === "account") {
      const tableData = Array.isArray(data) ? data.map((row: any) => [
        row.date ? new Date(row.date).toLocaleDateString('tr-TR') : "-",
        row.description || "-",
        row.debit ? `${Number(row.debit).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL` : "-",
        row.credit ? `${Number(row.credit).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL` : "-",
        row.balance ? `${Number(row.balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL` : "-"
      ]) : []

      // Add Opening Balance Row if exists
      if (openingBalance !== undefined) {
        tableData.unshift([
          "-",
          "Dönem Başı Devreden Bakiye",
          "-",
          "-",
          `${openingBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`
        ])
      }

      // Add Final Balance Row if exists
      if (finalBalance !== undefined) {
        tableData.push([
          "-",
          "Dönem Sonu Bakiye",
          "-",
          "-",
          `${finalBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`
        ])
      }

      autoTable(doc, {
        head: [['Tarih', 'Açıklama', 'Borç', 'Alacak', 'Bakiye']],
        body: tableData,
        startY: startY,
        theme: 'grid',
        styles: { fontSize: 8, font: "Roboto" },
        headStyles: { fillColor: [41, 128, 185], font: "Roboto" },
        bodyStyles: { font: "Roboto" },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 35, halign: 'right' }
        }
      })
      
      // Add Final Balance Summary at bottom right if requested (Optional, since we added it to table)
      // But user asked for: "liste sonunda da son bakiye yazsın" which we did in the table.
      
    } else if (type === "constitution") {
      // Handle text content
      let text = ""
      if (typeof data === 'string') {
        // Strip HTML tags if present
        text = data.replace(/<[^>]*>?/gm, '')
      } else {
        text = JSON.stringify(data, null, 2)
      }
      
      const splitText = doc.splitTextToSize(text, 180)
      doc.text(splitText, 14, 25)
    }

    doc.save(`${fileName}.pdf`)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <FileDown className="h-4 w-4 mr-2" />
      PDF İndir
    </Button>
  )
}
