import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import { setupFetchInterceptor } from '../utils/api';

export const AuthContext = createContext();

const initialState = {
  token: null,
  user: null,
  loading: true,
  authenticated: false
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'RESTORE_SESSION':
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        authenticated: !!action.payload.token,
        loading: false
      };
    case 'LOGIN':
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        authenticated: true,
        loading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        token: null,
        user: null,
        authenticated: false,
        loading: false
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Restore session on mount
    const storedToken = localStorage.getItem('authToken');
    let storedUser = null;
    
    try {
      const userStr = localStorage.getItem('authUser');
      if (userStr) storedUser = JSON.parse(userStr);
    } catch (e) {
      console.error('Failed to parse authUser from local storage', e);
    }

    dispatch({
      type: 'RESTORE_SESSION',
      payload: { token: storedToken, user: storedUser }
    });
  }, []);

  const login = useCallback((token, user) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));
    
    // Remove old legacy keys just in case
    localStorage.removeItem('ucab_token');
    localStorage.removeItem('ucab_user');
    localStorage.removeItem('ucab_user_name');
    localStorage.removeItem('ucab_user_role');

    dispatch({ type: 'LOGIN', payload: { token, user } });
  }, []);

  const logout = useCallback(() => {
    // Determine where to send the user BEFORE clearing storage
    let redirectTo = '/login';
    try {
      const userStr = localStorage.getItem('authUser');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u?.role === 'Admin')  redirectTo = '/admin-login';
        if (u?.role === 'Driver') redirectTo = '/driver-login';
      }
    } catch (_) {}

    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    
    // Remove old legacy keys just in case
    localStorage.removeItem('ucab_token');
    localStorage.removeItem('ucab_user');
    localStorage.removeItem('ucab_user_name');
    localStorage.removeItem('ucab_user_role');

    dispatch({ type: 'LOGOUT' });
    
    if (window.location.pathname !== redirectTo) {
      window.location.href = redirectTo;
    }
  }, []);

  useEffect(() => {
    setupFetchInterceptor(logout);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
