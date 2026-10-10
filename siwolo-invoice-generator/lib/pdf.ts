import { toJpeg } from "html-to-image";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export interface GeneratePdfOptions {
  elementId?: string;
  fileName?: string;
}

export interface PdfResult {
  pdf: jsPDF;
  blob: Blob;
  fileName: string;
}

/**
 * Renders the DOM element to a high-resolution jsPDF instance.
 * Automatically tries html-to-image first, falling back to html2canvas if needed.
 */
export async function createPdfInstance(
  elementId: string = "invoice-document"
): Promise<{ pdf: jsPDF; blob: Blob }> {
  if (typeof document === "undefined") {
    throw new Error("PDF generation requires a browser DOM environment.");
  }

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found for PDF export.`);
  }

  // Ensure all fonts are loaded
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }

  // Find transformed parent and temporarily reset transform for exact 1:1 render
  const parentTransformEl = element.parentElement;
  const originalParentTransform = parentTransformEl?.style.transform || "";
  if (parentTransformEl) {
    parentTransformEl.style.transform = "none";
  }

  let imgData: string | null = null;

  try {
    // Attempt 1: html-to-image
    try {
      imgData = await toJpeg(element, {
        quality: 0.98,
        pixelRatio: 2, // 2x retina scale for ultra-crisp output
        backgroundColor: "#ffffff",
        width: 794,
        cacheBust: true,
      });
    } catch (primaryErr) {
      console.warn("html-to-image failed, falling back to html2canvas:", primaryErr);
    }

    // Attempt 2: html2canvas fallback
    if (!imgData) {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 794,
      });
      imgData = canvas.toDataURL("image/jpeg", 0.98);
    }

    if (!imgData) {
      throw new Error("Failed to render invoice visual to image data.");
    }

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

    // Load image to compute aspect ratio
    const img = new Image();
    img.src = imgData;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load intermediate invoice image."));
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

    const blob = pdf.output("blob");
    return { pdf, blob };
  } finally {
    // Restore parent transform
    if (parentTransformEl) {
      parentTransformEl.style.transform = originalParentTransform;
    }
  }
}

/**
 * Generates and downloads the PDF directly into the user's Downloads folder.
 */
export async function generatePdf({
  elementId = "invoice-document",
  fileName = "Siwolo_Invoice.pdf",
}: GeneratePdfOptions = {}): Promise<PdfResult> {
  const { pdf, blob } = await createPdfInstance(elementId);

  // Trigger browser download directly to files
  pdf.save(fileName);

  return { pdf, blob, fileName };
}

/**
 * Triggers native system print dialog.
 */
export function triggerPrint(): void {
  if (typeof window !== "undefined") {
    window.print();
  }
}

/**
 * Checks if native Web Share with files is supported.
 */
export function canShareFiles(): boolean {
  if (typeof navigator === "undefined" || !navigator.share || !navigator.canShare) {
    return false;
  }
  try {
    const testFile = new File(["test"], "test.pdf", { type: "application/pdf" });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

/**
 * Shares the PDF using navigator.share if available.
 */
export async function sharePdfFile({
  blob,
  fileName,
  title,
  text,
}: {
  blob: Blob;
  fileName: string;
  title: string;
  text: string;
}): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) {
    return false;
  }

  const file = new File([blob], fileName, { type: "application/pdf" });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title,
      text,
      files: [file],
    });
    return true;
  } else {
    // Share text and url
    await navigator.share({
      title,
      text,
    });
    return true;
  }
}
