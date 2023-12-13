import axios from "@/helper/axios"
import setLocalStorage from "@/helper/setLocalStorage";
import { UseAppDispatchType } from "..";
import { NextRouter } from "next/router";
import { SET_ROUTE } from "./GlobalContextAction";

export const USER_LOGIN = (param: { username: string; password: string; }) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const { data } = await axios.post('/login', {
        external_id: param.username,
        password: param.password
      })
      if (data) {
        dispatch({ type: 'auth/login', payload: data.user })
        setLocalStorage({ access_token: data.token })
        dispatch(FETCH_FEATURES())
      }
    } catch (error) {
      dispatch({ type: 'auth/loginError' })
      return error
    }
  }
}

export const USER_CHANGE_PASSWORD = (param: { username: string; password: string; newPassword: string; }) => {
  return async (dispatch: UseAppDispatchType) => {
    const { username, password, newPassword } = param
    try {
      await axios.post('/change-password', {
        external_id: username,
        password,
        newPassword
      }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('access_token')
        }
      })
      dispatch({ type: 'auth/changePasswordSuccess' })
    } catch (error) {
      dispatch({ type: 'auth/changePasswordError' })
      return error
    }
  }
}

export const FETCH_FEATURES = () => {
  return async (dispatch: UseAppDispatchType) => {
    const token = localStorage.getItem('access_token')
    const { data } = await axios.get('/features', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    if (data) {
      const orderedFeatures = [
        "transactions",
        "catalogs",
        "categories",
        "sub_categories",
        "items",
        "racks",
        "suppliers",
        "supplies",
        "employees",
        "roles",
        // "route_permissions", // commented because of security reasons. User should add it manually via database if they want to make a new route permissions
        "user"
      ]

      dispatch({ type: 'auth/features', payload: data.features })
    }
  }
}

export const FETCH_USER = (route: NextRouter) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const token = localStorage.getItem('access_token')
      const { data } = await axios.get('/profile', {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
      if (data) {
        dispatch({ type: 'auth/login', payload: data })
      }
    } catch (error) {
      localStorage.removeItem('access_token')
      route.push('/auth')
    }
  }
}

export function TURN_OFF_LOGIN_ERROR() {
  return (dispatch: UseAppDispatchType) => {
    dispatch({ type: 'auth/turnOffLoginError' })
  }
}

export function USER_LOGOUT() {
  return (dispatch: UseAppDispatchType) => {
    dispatch(SET_ROUTE(''))
    dispatch({ type: 'auth/logout' })
  }
}