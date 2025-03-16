import * as FileSystem from 'expo-file-system';
import { AppDirectories, downloadFile, ensureAppDirectories } from './fileSystemUtils';

/**
 * Downloads an image from a URL and saves it to local storage
 * @param {string} imageUrl - The URL of the image to download
 * @param {string} [customFilename] - Optional custom filename (defaults to using the original filename from URL)
 * @returns {Promise<string>} - The local URI of the saved image
 */
export async function downloadImageToLocalStorage(imageUrl: string, customFilename?: string) {
  try {
    // Ensure app directories exist
    await ensureAppDirectories();
    
    // Use the downloadFile utility from fileSystemUtils
    return await downloadFile(imageUrl, AppDirectories.IMAGES, customFilename);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}