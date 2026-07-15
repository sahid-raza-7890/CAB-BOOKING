import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  const isPassenger = context.user?.role === 'Passenger';
  const isDriver = context.user?.role === 'Driver';

  return {
    ...context,
    isPassenger,
    isDriver
  };
};
