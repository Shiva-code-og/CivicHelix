/**
 * Image Preprocessing Pipeline for Document & Stamp Paper OCR
 * Cleans colored background noise, security watermarks, and optimizes contrast
 * before feeding into Tesseract.js
 */

export interface PreprocessingResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Preprocesses a document image using an HTML5 offscreen canvas:
 * 1. Rescales to optimal OCR DPI (width ~1800-2200px)
 * 2. Neutralizes color tint bands (pink/cyan/amber stamp paper backgrounds)
 * 3. Applies adaptive contrast enhancement & binarization to isolate printed ink
 */
export async function preprocessDocumentImage(
  imageSource: File | Blob | string
): Promise<PreprocessingResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrlToRevoke: string | null = null;
    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      objectUrlToRevoke = URL.createObjectURL(imageSource);
      img.src = objectUrlToRevoke;
    }

    img.onload = () => {
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);

      try {
        // Optimal width for OCR clarity
        const targetWidth = Math.min(2200, Math.max(1600, img.width));
        const scale = targetWidth / img.width;
        const targetHeight = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          throw new Error('Canvas 2D context could not be initialized');
        }

        // 1. Draw scaled image
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // 2. Extract raw pixel buffer
        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imgData.data;

        // Compute average luminance to gauge lighting conditions
        let totalLuminance = 0;
        const totalPixels = targetWidth * targetHeight;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Standard Rec. 601 Luma
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          totalLuminance += luma;
        }

        const avgLuma = totalLuminance / totalPixels;
        // Dynamic thresholding: ink is significantly darker than page average
        const binarizeThreshold = Math.max(90, Math.min(150, avgLuma * 0.72));

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Compute color saturation: background stamp paper patterns are colored
          const maxChannel = Math.max(r, g, b);
          const minChannel = Math.min(r, g, b);
          const colorDiff = maxChannel - minChannel;

          const luma = 0.299 * r + 0.587 * g + 0.114 * b;

          // If the pixel has strong color tint (e.g. pink, blue, yellow watermark)
          // or is lighter than the threshold, bleach to white
          if (colorDiff > 28 || luma > binarizeThreshold) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
          } else {
            // Dark printed text -> enhance to solid black
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
          }
        }

        ctx.putImageData(imgData, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create preprocessed image blob'));
              return;
            }
            const dataUrl = canvas.toDataURL('image/png');
            resolve({
              blob,
              dataUrl,
              width: targetWidth,
              height: targetHeight,
            });
          },
          'image/png'
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => {
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
      reject(err);
    };
  });
}
