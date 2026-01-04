import { jsPDF } from "jspdf"

export const loadTurkishFont = async (doc: jsPDF) => {
  try {
    const fontRes = await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf')
    if (fontRes.ok) {
        const fontBlob = await fontRes.blob()
        const reader = new FileReader()
        await new Promise<void>((resolve) => {
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1]
                doc.addFileToVFS("Roboto-Regular.ttf", base64)
                doc.addFont("Roboto-Regular.ttf", "Roboto", "normal")
                doc.setFont("Roboto")
                resolve()
            }
            reader.readAsDataURL(fontBlob)
        })
        return true
    } else {
        console.warn("Font fetch failed, using default font")
        return false
    }
  } catch (e) {
    console.error("Font loading failed", e)
    return false
  }
}
