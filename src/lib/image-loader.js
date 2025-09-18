
// src/lib/image-loader.js

// This is a custom loader for `next/image` that is compatible with `next export`.
// It simply returns the original `src` without any optimization.
// This is necessary because the default loader requires a server.

export default function customImageLoader({ src, width, quality }) {
  // In a real project, you might connect this to a service like Cloudinary or Imgix.
  // For now, we'll just return the original image source.
  return src;
}
