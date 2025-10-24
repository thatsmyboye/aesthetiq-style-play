import html2canvas from 'html2canvas';

/**
 * Render a DOM element to a PNG blob
 */
export async function renderToPNG(element: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2, // Higher quality
    logging: false,
    useCORS: true,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy blob to clipboard (works on modern browsers)
 */
export async function copyBlobToClipboard(blob: Blob) {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Export a DOM node to PNG and download it
 */
export async function exportNodeToPng(node: HTMLElement, filename = "aesthetiq-wrapped.png") {
  const canvas = await html2canvas(node, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
  const dataUrl = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
  return dataUrl;
}

/**
 * Copy a DOM node as PNG to clipboard
 */
export async function copyPng(node: HTMLElement) {
  const canvas = await html2canvas(node, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    } catch { /* clipboard not available */ }
  }, "image/png");
}

/**
 * Share a DOM node as PNG using native share API
 */
export async function sharePng(node: HTMLElement, filename = "aesthetiq-wrapped.png") {
  const canvas = await html2canvas(node, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
  const blob: Blob | null = await new Promise(res => canvas.toBlob(b => res(b), "image/png"));
  if (!blob) return false;
  const file = new File([blob], filename, { type: "image/png" });
  // Native share (mobile)
  if ((navigator as any).canShare?.({ files: [file] })) {
    await (navigator as any).share({ files: [file], title: "My AesthetIQ Wrapped", text: "My 2025 vibe." });
    return true;
  }
  return false;
}
