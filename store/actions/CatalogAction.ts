import axios from "@/helper/axios"
import { UseAppDispatchType } from "..";
import { throwErr } from "./RBACAction";
import { SET_LOADING } from "./GlobalContextAction";

export const FETCH_ALL_CATALOGS = (payload: Partial<{ name: string; limit: number; offset: number }>) => {
  return async (dispatch: UseAppDispatchType) => {
    dispatch(SET_LOADING(true))
    const { name, limit, offset } = payload
    let url = `/catalogs?limit=${limit || 25}&offset=${offset || 0}`
    if (name) url += `&name=${name}`
    const token = localStorage.getItem('access_token')
    const { data } = await axios.get(url, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    if (data) {
      dispatch({ type: 'catalog/set-catalogs', payload: { catalogs: data.data, totalRow: data.data[0]?.total_row || 0 } })
    }
    dispatch(SET_LOADING(false))
  }
}

export const CREATE_CATALOG = (name: string) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.post(`/catalogs`, { name }, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_CATALOGS({}))
    }
  }
}

export const DELETE_CATALOG = (id: string) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.delete(`/catalogs/${id}`, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_CATALOGS({}))
    }
  }
}

export const UPDATE_CATALOG = (id: string, name: string) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.put(`/catalogs/${id}`, { name }, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_CATALOGS({}))
    }
  }
}