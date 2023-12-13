import axios from "@/helper/axios"
import { UseAppDispatchType } from "..";
import { throwErr } from "./RBACAction";
import { SET_LOADING } from "./GlobalContextAction";

export const FETCH_ALL_USERS = (payload: Partial<{ name: string; roleIds: string[]; limit: number; offset: number }>) => {
  return async (dispatch: UseAppDispatchType) => {
    dispatch(SET_LOADING(true))
    const { name, roleIds, limit, offset } = payload
    let url = `/users?limit=${limit || 25}&offset=${offset || 0}`
    if (name) url += `&username=${name}`
    if (roleIds?.length) url += `&role_id=${JSON.stringify(roleIds)}`
    const token = localStorage.getItem('access_token')
    const { data } = await axios.get(url, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    if (data) {
      dispatch({ type: 'user/set-users', payload: { users: data, totalRow: data[0]?.total_row || 0 } })
    }
    dispatch(SET_LOADING(false))
  }
}

export const CREATE_USER = (param: { external_id: string; password: string, role_id: string }) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.post(`/register`, param, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_USERS({}))
    }
  }
}

export const CHANGE_ROLE = (userId: string, role: string) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.post(`/change-role/${userId}`, { role }, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_USERS({}))
    }
  }
}