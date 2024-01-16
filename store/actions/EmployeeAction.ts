import axios from "@/helper/axios"
import { UseAppDispatchType } from "..";
import { throwErr } from "./RBACAction";
import { SET_LOADING } from "./GlobalContextAction";

export const FETCH_ALL_EMPLOYEES = (payload: Partial<{ name: string; limit: number; offset: number; isActiveOnly?: boolean }>) => {
  return async (dispatch: UseAppDispatchType) => {
    dispatch(SET_LOADING(true))
    const { name, limit, offset, isActiveOnly } = payload
    let url = `/employees?limit=${limit || 25}&offset=${offset || 0}`
    if (name) url += `&name=${name}`
    if (isActiveOnly) url += `&is_active=true`
    const token = localStorage.getItem('access_token')
    const { data } = await axios.get(url, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    if (data) {
      dispatch({ type: 'employee/set-employees', payload: { employees: data.data, totalRow: data.data[0]?.total_row || 0 } })
    }
    dispatch(SET_LOADING(false))
  }
}

export const CREATE_EMPLOYEE = (payload: { name: string; idKaryawan: string; title: string; }) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.post(`/employees`, payload, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_EMPLOYEES({ isActiveOnly: true }))
    }
  }
}

export const DEACTIVE_EMPLOYEE = (id: string) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.put(`/employees/${id}`, { is_active: false }, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_EMPLOYEES({ isActiveOnly: true }))
    }
  }
}

export const UPDATE_EMPLOYEE = (id: string, payload: { name: string; idKaryawan: string; title: string; }) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.put(`/employees/${id}`, payload, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_EMPLOYEES({ isActiveOnly: true }))
    }
  }
}