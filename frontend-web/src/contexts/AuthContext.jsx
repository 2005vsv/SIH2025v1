import PropTypes from 'prop-types';
import { createContext, useContext, useReducer, useEffect } from 'react';
import socketService from '../services/socket';

const initialState = {
  isAuthenticated: !!localStorage.getItem('accessToken'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  loading: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        loading: false,
      };
    case 'LOGOUT':
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
      };
    case 'UPDATE_USER':
      localStorage.setItem('user', JSON.stringify(action.payload));
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Connect to socket when user is authenticated
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        socketService.connect(state.user.id, token);
      }
    } else {
      socketService.disconnect();
    }

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [state.isAuthenticated, state.user]);

  const login = (user, accessToken, refreshToken) => {
    dispatch({ type: 'LOGIN', payload: { user, accessToken, refreshToken } });
    // Socket connection will be handled by useEffect
  };

  const logout = () => {
    socketService.disconnect();
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (user) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    setLoading,
    socketService,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
