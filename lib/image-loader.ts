/**
 * Helper to inject Cloudinary optimization parameters (f_auto, q_auto, resizing)
 * into image URLs to drastically reduce payload sizes and load times.
 */
export function optimizeCloudinaryUrl(
  url?: string | null,
  options?: { width?: number; quality?: string }
): string {
  if (!url) return "";
  
  // Only transform Cloudinary URLs that contain /upload/
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  // Avoid double-injecting transformations if already present
  if (url.includes("/upload/f_auto") || url.includes("/upload/c_")) {
    return url;
  }

  const width = options?.width ?? 500;
  const quality = options?.quality ?? "auto";
  const transformation = `f_auto,q_${quality},w_${width},c_limit`;

  return url.replace("/upload/", `/upload/${transformation}/`);
}

/**
 * Preload an array of image URLs using browser Image elements
 * so they are pre-cached in memory before being revealed.
 */
export async function preloadImages(urls: string[]): Promise<void> {
  if (typeof window === "undefined" || !urls.length) return;

  const validUrls = urls.filter((u) => Boolean(u && !u.endsWith(".svg")));

  const loadPromises = validUrls.map((url) => {
    return new Promise<void>((resolve) => {
      const img = new window.Image();
      img.src = url;

      if (img.complete) {
        resolve();
        return;
      }

      img.onload = () => {
        if ("decode" in img) {
          img.decode().then(resolve).catch(resolve);
        } else {
          resolve();
        }
      };

      img.onerror = () => resolve(); // Resolve on error so we never hang
    });
  });

  await Promise.allSettled(loadPromises);
}
