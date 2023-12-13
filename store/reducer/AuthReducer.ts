import { Reducer } from '@reduxjs/toolkit'

export type AuthReducerType = {
  isLoginError: boolean;
  isChangePasswordError: boolean;
  isChangePasswordSuccess: boolean;
  features: string[];
  user: {
    external_id: string;
    role: string;
  } | null
}

const initialState: AuthReducerType = {
  isLoginError: false,
  isChangePasswordError: false,
  isChangePasswordSuccess: false,
  user: null,
  features: []
}

const authReducer: Reducer = (state: AuthReducerType = initialState, action): AuthReducerType => {
  const { type, payload } = action
  switch (type) {
    case 'auth/login':
      return { ...state, user: payload }
    case 'auth/logout':
      return { ...state, user: null, features: [] }
    case 'auth/features':
      return { ...state, features: payload }
    case 'auth/loginError':
      return { ...state, isLoginError: true }
    case 'auth/turnOffLoginError':
      return { ...state, isLoginError: false }
    case 'auth/changePasswordError':
      return { ...state, isChangePasswordError: true }
    case 'auth/turnOffChangePasswordError':
      return { ...state, isChangePasswordError: false }
    case 'auth/changePasswordSuccess':
      return { ...state, isChangePasswordSuccess: true }
    case 'auth/turnOffChangePasswordSuccess':
      return { ...state, isChangePasswordSuccess: false }
  }
  return { ...state }
}

export default authReducer