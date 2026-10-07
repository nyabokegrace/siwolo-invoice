import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

export interface GeneratePdfOptions {
  elementId?: string;
  fileName?: string;
}

export async function generatePdf({
  elementId = "invoice-document",
  fileName = "Siwolo_Invoice.pdf",
}: GeneratePdfOptions = {}): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found for PDF export.`);
  }

  // Find any transformed parent elements and temporarily reset them for exact 1:1 render
  const parentTransformEl = element.parentElement;
  const originalParentTransform = parentTransformEl?.style.transform || "";
  if (parentTransformEl) {
    parentTransformEl.style.transform = "none";
  }

  try {
    const imgData = await toJpeg(element, {
      quality: 0.98,
      pixelRatio: 2, // 2x retina scale for ultra-crisp vector-like printing
      backgroundColor: "#ffffff",
      width: 794,
    });

    // Standard A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgWidth = pdfWidth;

    // Load image to get precise dimensions
    const img = new Image();
    img.src = imgData;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const imgHeight = (img.height * pdfWidth) / img.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= pdfHeight;

    // Subsequent pages if content overflows A4 height
    while (heightLeft > 5) {
      position = position - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pdfHeight;
    }

    pdf.save(fileName);
  } finally {
    // Restore parent transform
    if (parentTransformEl) {
      parentTransformEl.style.transform = originalParentTransform;
    }
  }
}

export function triggerPrint(): void {
  window.print();
}
