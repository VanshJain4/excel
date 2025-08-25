import { doc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { fetchUserFiles } from './firebaseFileService';

// Use the existing sample Excel file as template
// This ensures we have a valid Excel file structure
const EMPTY_EXCEL_BASE64 = 'UEsDBBQAAAAIAAiD7VQAAAAAAAAAAAAAAAAJAAAAeGwvX3JlbHMvUEsDBBQAAAAIAAiD7VQAAAAAAAAAAAAAAAAKAAAAeGwvX3JlbHMvX3JlbHMvUEsDBBQAAAAIAAiD7VQAAAAAAAAAAAAAAAAMAAAAeGwvX3JlbHMvX3JlbHMvX3JlbC54bWxQSwECFAMUAAAACAAIg+1UAAAAAAAAAAAAAAAACQAAAAAAAAAAABAA7QEAAAAAeGwvX3JlbHMvUEsBAhQDFAAAAAgACIPtVAAAAAAAAAAAAAAAAAoAAAAAAAAAAAAQAAAAAAAAAAB4bC9fcmVscy9fcmVscy9QSwECFAMUAAAACAAIg+1UAAAAAAAAAAAAAAAADAAAAAAAAAAAABAA7QEAAAB4bC9fcmVscy9fcmVscy9fcmVsLnhtbFBLBQYAAAAAAwADAPUAAAD1AAAAAA==';

// Helper function to generate unique file name
const generateUniqueFileName = (fileName, existingFiles) => {
  // Split filename and extension
  const lastDotIndex = fileName.lastIndexOf('.');
  const nameWithoutExt = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
  const extension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';
  
  // Check if filename already exists
  const existingNames = existingFiles.map(file => file.originalName || file.fileName);
  
  if (!existingNames.includes(fileName)) {
    return fileName;
  }
  
  // Find the next available number
  let counter = 1;
  let newFileName;
  
  do {
    newFileName = `${nameWithoutExt} (${counter})${extension}`;
    counter++;
  } while (existingNames.includes(newFileName));
  
  return newFileName;
};

export const createEmptyExcelFile = async (fileName, userId, userEmail) => {
  try {
    // Get existing files to check for duplicates
    const existingFiles = await fetchUserFiles(userId);
    
    // Generate unique file name
    const uniqueFileName = generateUniqueFileName(fileName, existingFiles);
    
    // For now, let's use a simple approach - create a file that points to the empty template
    // This will use the existing empty.xlsx handling in the WOPI server
    
    const fileData = {
      fileName: uniqueFileName,
      originalName: uniqueFileName,
      fileSize: 1024, // Small size for empty file
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileContent: null, // No content - will use empty template
      userId: userId,
      userEmail: userEmail,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      description: 'Empty Excel spreadsheet created by user',
      tags: [],
      isEmpty: true // Flag to indicate this is an empty file
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'files'), fileData);
    
    console.log('Empty Excel file created with ID:', docRef.id);
    
    return {
      success: true,
      fileId: docRef.id,
      fileName: uniqueFileName,
      originalName: uniqueFileName
    };
  } catch (error) {
    console.error('Error creating empty Excel file:', error);
    throw new Error('Failed to create empty Excel file: ' + error.message);
  }
};
