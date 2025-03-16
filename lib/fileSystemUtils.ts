import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';

/**
 * App directory structure configuration
 */
export const AppDirectories = {
  // Root directory for app data (using documentDirectory as our base)
  ROOT: `${FileSystem.documentDirectory}app_data/`,
  
  // Subdirectories for different types of content
  get IMAGES() { return `${this.ROOT}images/`; },
  get DOCUMENTS() { return `${this.ROOT}documents/`; },
  get CACHE() { return `${this.ROOT}cache/`; },
  get TEMP() { return `${this.ROOT}temp/`; },
  
  // Add more directories as needed
  // get AUDIO() { return `${this.ROOT}audio/`; },
  // get VIDEO() { return `${this.ROOT}video/`; },
};

/**
 * Ensures all app directories exist
 * @returns {Promise<void>}
 */
export async function ensureAppDirectories(): Promise<void> {
  try {
    // Create each directory in the structure
    for (const dirPath of Object.values(AppDirectories)) {
      const dirInfo = await FileSystem.getInfoAsync(dirPath);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
        console.log(`Created directory: ${dirPath}`);
      }
    }
    console.log('App directory structure is ready');
  } catch (error) {
    console.error('Error creating app directories:', error);
    throw error;
  }
}

/**
 * Gets a file path within a specific app directory
 * @param {string} directory - The directory to use (from AppDirectories)
 * @param {string} filename - The filename to append
 * @returns {string} - The complete file path
 */
export function getFilePath(directory: string, filename: string): string {
  return `${directory}${filename}`;
}

/**
 * Saves data to a file in the specified directory
 * @param {string} directory - The directory to save to (from AppDirectories)
 * @param {string} filename - The filename to save as
 * @param {string} content - The content to save
 * @returns {Promise<string>} - The path to the saved file
 */
export async function saveFile(directory: string, filename: string, content: string): Promise<string> {
  const filePath = getFilePath(directory, filename);
  
  try {
    await FileSystem.writeAsStringAsync(filePath, content);
    console.log(`File saved to ${filePath}`);
    return filePath;
  } catch (error) {
    console.error(`Error saving file to ${filePath}:`, error);
    throw error;
  }
}

/**
 * Reads a file from the specified directory
 * @param {string} directory - The directory to read from (from AppDirectories)
 * @param {string} filename - The filename to read
 * @returns {Promise<string>} - The content of the file
 */
export async function readFile(directory: string, filename: string): Promise<string> {
  const filePath = getFilePath(directory, filename);
  
  try {
    return await FileSystem.readAsStringAsync(filePath);
  } catch (error) {
    console.error(`Error reading file from ${filePath}:`, error);
    throw error;
  }
}

/**
 * Deletes a file from the specified directory
 * @param {string} directory - The directory containing the file (from AppDirectories)
 * @param {string} filename - The filename to delete
 * @returns {Promise<void>}
 */
export async function deleteFile(directory: string, filename: string): Promise<void> {
  const filePath = getFilePath(directory, filename);
  
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(filePath);
      console.log(`File deleted: ${filePath}`);
    } else {
      console.log(`File does not exist: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Lists all files in a directory
 * @param {string} directory - The directory to list files from (from AppDirectories)
 * @returns {Promise<string[]>} - Array of filenames
 */
export async function listFiles(directory: string): Promise<string[]> {
  try {
    return await FileSystem.readDirectoryAsync(directory);
  } catch (error) {
    console.error(`Error listing files in ${directory}:`, error);
    throw error;
  }
}

/**
 * Checks if a file exists
 * @param {string} directory - The directory to check in (from AppDirectories)
 * @param {string} filename - The filename to check
 * @returns {Promise<boolean>} - Whether the file exists
 */
export async function fileExists(directory: string, filename: string): Promise<boolean> {
  const filePath = getFilePath(directory, filename);
  
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    return fileInfo.exists;
  } catch (error) {
    console.error(`Error checking if file exists ${filePath}:`, error);
    throw error;
  }
}

/**
 * Moves a file from one location to another
 * @param {string} sourceDir - Source directory (from AppDirectories)
 * @param {string} sourceFilename - Source filename
 * @param {string} destDir - Destination directory (from AppDirectories)
 * @param {string} destFilename - Destination filename
 * @returns {Promise<string>} - The path to the destination file
 */
export async function moveFile(
  sourceDir: string, 
  sourceFilename: string, 
  destDir: string, 
  destFilename: string
): Promise<string> {
  const sourcePath = getFilePath(sourceDir, sourceFilename);
  const destPath = getFilePath(destDir, destFilename);
  
  try {
    await FileSystem.moveAsync({
      from: sourcePath,
      to: destPath
    });
    console.log(`File moved from ${sourcePath} to ${destPath}`);
    return destPath;
  } catch (error) {
    console.error(`Error moving file from ${sourcePath} to ${destPath}:`, error);
    throw error;
  }
}

/**
 * Downloads a file from a URL and saves it to the specified directory
 * @param {string} url - The URL to download from
 * @param {string} directory - The directory to save to (from AppDirectories)
 * @param {string} [filename] - Optional custom filename (defaults to URL filename)
 * @returns {Promise<string>} - The path to the downloaded file
 */
export async function downloadFile(
  url: string, 
  directory: string, 
  filename?: string
): Promise<string> {
  try {
    // Generate filename from URL if not provided
    const finalFilename = filename || url.split('/').pop() || `file-${Date.now()}`;
    const filePath = getFilePath(directory, finalFilename);
    
    // Check if file already exists
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      console.log(`File already exists at ${filePath}`);
      return filePath;
    }
    
    // Download the file
    console.log(`Downloading file from ${url}...`);
    const downloadResult = await FileSystem.downloadAsync(url, filePath);
    
    if (downloadResult.status !== 200) {
      throw new Error(`Download failed with status ${downloadResult.status}`);
    }
    
    console.log(`File successfully downloaded to ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

/**
 * Saves a file to the device's media library (Photos)
 * @param {string} fileUri - URI of the file to save
 * @param {string} album - Optional album name to save to
 * @returns {Promise<string>} - The URI of the saved file in the media library
 */
export async function saveToMediaLibrary(fileUri: string, album?: string): Promise<string> {
  try {
    // Request permission to access the media library
    const { status } = await MediaLibrary.requestPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Permission to access media library not granted');
    }
    
    // Save the file to the media library
    const asset = await MediaLibrary.createAssetAsync(fileUri);
    
    // Create album if specified and add asset to it
    if (album) {
      const albums = await MediaLibrary.getAlbumAsync(album);
      let targetAlbum = albums;
      
      if (!targetAlbum) {
        targetAlbum = await MediaLibrary.createAlbumAsync(album, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], targetAlbum, false);
      }
    }
    
    console.log(`File saved to media library: ${asset.uri}`);
    return asset.uri;
  } catch (error) {
    console.error('Error saving file to media library:', error);
    throw error;
  }
}

/**
 * Downloads a file and saves it to the device's media library
 * This is an alternative way to "download" files to the device
 * @param {string} url - The URL to download from
 * @param {string} [filename] - Optional custom filename
 * @param {string} [album] - Optional album name to save to
 * @returns {Promise<string>} - The URI of the saved file in the media library
 */
export async function downloadToMediaLibrary(
  url: string,
  filename?: string,
  album?: string
): Promise<string> {
  try {
    // First download to app's temporary directory
    const tempPath = await downloadFile(url, AppDirectories.TEMP, filename);
    
    // Then save to media library
    const mediaUri = await saveToMediaLibrary(tempPath, album);
    
    // Delete the temporary file
    await FileSystem.deleteAsync(tempPath);
    
    return mediaUri;
  } catch (error) {
    console.error('Error downloading to media library:', error);
    throw error;
  }
} 