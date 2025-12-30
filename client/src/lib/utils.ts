import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to get full image URL
export function getImageUrl(imagePath: string | undefined): string {
  if (!imagePath) return '';
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Normalize path separators (Windows uses backslashes)
  let normalizedPath = imagePath.replace(/\\/g, '/');
  
  // Remove any leading slashes to avoid double slashes
  normalizedPath = normalizedPath.replace(/^\/+/, '');
  
  // Base URL without /api
  const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
  // Construct full URL - ensure single leading slash
  return `${baseUrl}/${normalizedPath}`;
}
