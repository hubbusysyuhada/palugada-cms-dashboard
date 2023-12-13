import axios from "@/helper/axios"
import { UseAppDispatchType } from "..";
import { throwErr } from "./RBACAction";
import { SET_LOADING } from "./GlobalContextAction";
import _ from "lodash";

export const FETCH_ALL_SUPPLIERS = (payload: Partial<{ keywords: string; limit: number; offset: number }>) => {
  return async (dispatch: UseAppDispatchType) => {
    dispatch(SET_LOADING(true))
    const { keywords, limit, offset } = payload
    let url = `/suppliers?limit=${limit || 25}&offset=${offset || 0}`
    if (keywords) url += `&keywords=${keywords}`
    const token = localStorage.getItem('access_token')
    const { data } = await axios.get(url, {
      headers: {
        Authorization: 'Bearer ' + token
      },
    })

    if (data) {
      dispatch({ type: 'supplier/set-suppliers', payload: { suppliers: data.data, totalRow: data.data[0]?.total_row || 0 } })
    }
    dispatch(SET_LOADING(false))
  }
}

export const CREATE_SUPPLIER = (payload: Record<string, any>) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.post(`/suppliers`, payload, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_SUPPLIERS({}))
    }
  }
}

export const DELETE_SUPPLIER = (id: string) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.delete(`/suppliers/${id}`, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_SUPPLIERS({}))
    }
  }
}

export const UPDATE_SUPPLIER = (payload: { id: string; } & Record<string, any>) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const id = payload.id
      const token = localStorage.getItem('access_token')
      await axios.put(`/suppliers/${id}`, _.omit(payload, ['id', 'created_at', 'total_row']), {
        headers: {
          Authorization: 'Bearer ' + token
        },
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_SUPPLIERS({}))
    }
  }
}