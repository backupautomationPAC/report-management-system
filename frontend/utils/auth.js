// Authentication utility functions
export const getStoredUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const getStoredSessionId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sessionId');
  }
  return null;
};

export const setStoredAuth = (sessionId, user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const clearStoredAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
  }
};

export const isAuthenticated = () => {
  return !!(getStoredSessionId() && getStoredUser());
};

export const hasRole = (requiredRole) => {
  const user = getStoredUser();
  if (!user) return false;

  const roleHierarchy = {
    'admin': 4,
    'supervisor': 3,
    'ae': 2,
    'accounting': 1
  };

  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
};
