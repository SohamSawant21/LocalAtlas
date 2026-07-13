import { toPng } from 'html-to-image';

export interface ExportOptions {
  fileName: string;
  pixelRatio?: number;
}

export async function exportComponentAsPNG(element: HTMLElement, options: ExportOptions) {
  try {
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: options.pixelRatio || 2,
      useCORS: true,
      backgroundColor: 'transparent',
    });

    const link = document.createElement('a');
    link.download = `${options.fileName}.png`;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (error) {
    console.error('Error exporting image:', error);
    throw error;
  }
}
