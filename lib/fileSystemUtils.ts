import * as FileSystem from 'expo-file-system';

/**
 * App directory structure configuration
 */
export const AppDirectories = {
  // Root directory for all app data
  ROOT: `${FileSystem.documentDirectory}app_data/`,
  
  // Subdirectories for different types of content
  IMAGES: `${FileSystem.documentDirectory}app_data/images/`,
  DOCUMENTS: `${FileSystem.documentDirectory}app_data/documents/`,
  CACHE: `${FileSystem.documentDirectory}app_data/cache/`,
  TEMP: `${FileSystem.documentDirectory}app_data/temp/`,
  
  // Add more directories as needed
  // AUDIO: `${FileSystem.documentDirectory}app_data/audio/`,
  // VIDEO: `${FileSystem.documentDirectory}app_data/video/`,
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
    const content = await FileSystem.readAsStringAsync(filePath);
    return content;
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
    const result = await FileSystem.readDirectoryAsync(directory);
    return result;
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