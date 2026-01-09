"use client"

import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface PdfExportButtonProps {
  type: "account" | "constitution"
  data: any
  fileName?: string
  title?: string
}

export function PdfExportButton({ type, data, fileName = "belge", title }: PdfExportButtonProps) {
  
  const handleExport = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const doc = new jsPDF()
    
    // Set font to handle Turkish characters somewhat better (basic support)
    doc.setFont("helvetica")
    doc.setFontSize(16)
    doc.text(title || (type === "account" ? "Cari Hesap Hareketleri" : "Ana Sozlesme"), 14, 15)
    
    doc.setFontSize(10)

    if (type === "account") {
      const tableData = Array.isArray(data) ? data.map((row: any) => [
        row.date ? new Date(row.date).toLocaleDateString('tr-TR') : "-",
        row.description || "-",
        row.debit ? `${row.debit} TL` : "-",
        row.credit ? `${row.credit} TL` : "-",
        row.balance ? `${row.balance} TL` : "-"
      ]) : []

      autoTable(doc, {
        head: [['Tarih', 'Aciklama', 'Borc', 'Alacak', 'Bakiye']],
        body: tableData,
        startY: 25,
        theme: 'grid',
        styles: { fontSize: 8, font: "helvetica" },
        headStyles: { fillColor: [41, 128, 185] }
      })
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
