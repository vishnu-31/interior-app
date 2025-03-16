import { ensureAppDirectories, AppDirectories } from './fileSystemUtils';

/**
 * Initializes the app's file system structure and other necessary setup
 * @returns {Promise<void>}
 */
export async function initializeAppFileSystem(): Promise<void> {
  try {
    console.log('Initializing app file system...');
    
    // Ensure all app directories exist
    await ensureAppDirectories();
    
    console.log('App file system initialized successfully');
  } catch (error) {
    console.error('Error initializing app file system:', error);
    throw error;
  }
}

/**
 * Returns information about the app's directory structure
 * @returns {Object} - Object containing directory paths
 */
export function getAppDirectories() {
  return { ...AppDirectories };
} 