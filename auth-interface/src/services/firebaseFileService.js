import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  getDocs,
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// File collection reference
const filesCollection = collection(db, 'files');

// Helper function to convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Upload file to Firestore as base64 (free solution)
export const uploadFile = async (file, userId, description = '') => {
  try {
    // Convert file to base64
    const fileBase64 = await fileToBase64(file);
    
    // Save file data to Firestore
    const fileData = {
      userId: userId,
      fileName: file.name,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      fileType: file.name.split('.').pop().toLowerCase(),
      description: description,
      fileContent: fileBase64,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isPublic: false,
      tags: [],
      storageType: 'firestore-base64'
    };

    const docRef = await addDoc(filesCollection, fileData);
    
    return {
      id: docRef.id,
      ...fileData
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Get user's files with real-time updates
export const getUserFiles = (userId, callback, errorCallback) => {
  const q = query(
    filesCollection,
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const files = [];
    snapshot.forEach((doc) => {
      files.push({
        id: doc.id,
        ...doc.data()
      });
    });
    // Sort by createdAt in JavaScript instead of Firestore
    files.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.toDate() - a.createdAt.toDate();
      }
      return 0;
    });
    callback(files);
  }, (error) => {
    console.error('Firestore listener error:', error);
    if (errorCallback) {
      errorCallback(error);
    }
  });
};

// Update file in Firestore
export const updateFile = async (fileId, file, userId) => {
  try {
    // Get current file data
    const fileDoc = doc(db, 'files', fileId);
    
    // Convert new file to base64
    const fileBase64 = await fileToBase64(file);

    // Update Firestore document
    await updateDoc(fileDoc, {
      fileName: file.name,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      fileType: file.name.split('.').pop().toLowerCase(),
      fileContent: fileBase64,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating file:', error);
    throw error;
  }
};

// Delete file from Firestore
export const deleteFile = async (fileId) => {
  try {
    // Delete from Firestore
    const fileDoc = doc(db, 'files', fileId);
    await deleteDoc(fileDoc);

    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Get file content from Firestore
export const getFileDownloadURL = async (fileId) => {
  try {
    const fileDoc = doc(db, 'files', fileId);
    const fileData = await getDoc(fileDoc);
    
    if (fileData.exists()) {
      const data = fileData.data();
      
      if (data.fileContent) {
        // Return the base64 content directly
        return data.fileContent;
      }
    }
    throw new Error('File not found');
  } catch (error) {
    console.error('Error getting file content:', error);
    throw error;
  }
};

// Manual fetch user files (for refresh functionality)
export const fetchUserFiles = async (userId) => {
  try {
    const q = query(
      filesCollection,
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    const files = [];
    
    snapshot.forEach((doc) => {
      files.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by createdAt
    files.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.toDate() - a.createdAt.toDate();
      }
      return 0;
    });
    
    return files;
  } catch (error) {
    console.error('Error fetching user files:', error);
    throw error;
  }
};
