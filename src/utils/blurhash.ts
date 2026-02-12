import { encode } from 'blurhash';

/**
 * Generate a blurhash string from an image file
 * @param file - The image file
 * @returns Promise<string> - The blurhash string
 */
export async function generateBlurhash(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            // Use small dimensions for blurhash generation (faster)
            const width = 32;
            const height = 32;

            canvas.width = width;
            canvas.height = height;

            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);
            const imageData = ctx.getImageData(0, 0, width, height);

            try {
                // Generate blurhash with 4x3 components (good balance)
                const hash = encode(
                    imageData.data,
                    imageData.width,
                    imageData.height,
                    4,
                    3
                );
                resolve(hash);
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = URL.createObjectURL(file);
    });
}
