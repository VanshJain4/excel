import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:5001/api';

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/status`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setCurrentUser(data.user);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  // Google OAuth login
  const loginWithGoogle = () => {
    // Redirect to Google OAuth
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  // Get user files
  const getUserFiles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/files`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, files: data.files };
      } else {
        return { success: false, error: 'Failed to fetch files' };
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  // Upload file
  const uploadFile = async (file, description = '', tags = []) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      formData.append('tags', tags.join(','));

      const response = await fetch(`${API_BASE_URL}/files/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, file: data.file };
      } else {
        return { success: false, error: data.error || 'Upload failed' };
      }
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  // Delete file
  const deleteFile = async (fileId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Delete failed' };
      }
    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    getUserFiles,
    uploadFile,
    deleteFile,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
