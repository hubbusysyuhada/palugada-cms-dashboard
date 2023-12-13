import axios from "@/helper/axios"
import { UseAppDispatchType } from "..";
import { throwErr } from "./RBACAction";
import { SET_LOADING } from "./GlobalContextAction";

export const FETCH_ALL_RACKS = (payload: Partial<{ keywords: string; limit: number; offset: number }>) => {
  return async (dispatch: UseAppDispatchType) => {
    dispatch(SET_LOADING(true))
    const { keywords, limit, offset } = payload
    let url = `/racks?limit=${limit || 25}&offset=${offset || 0}`
    if (keywords) url += `&keywords=${keywords}`
    const token = localStorage.getItem('access_token')
    const { data } = await axios.get(url, {
      headers: {
        Authorization: 'Bearer ' + token
      },
    })

    if (data) {
      dispatch({ type: 'rack/set-racks', payload: { racks: data.data, totalRow: data.data[0]?.total_row || 0 } })
    }
    dispatch(SET_LOADING(false))
  }
}

export const CREATE_RACK = (payload: { name: string; storage_number: number; }) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.post(`/racks`, payload, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_RACKS({}))
    }
  }
}

export const DELETE_RACK = (id: string) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.delete(`/racks/${id}`, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_RACKS({}))
    }
  }
}

export const UPDATE_RACK = (payload: { id: string; name: string; storage_number: number }) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const { id, name, storage_number } = payload
      const token = localStorage.getItem('access_token')
      await axios.put(`/racks/${id}`, { name, storage_number }, {
        headers: {
          Authorization: 'Bearer ' + token
        },
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_RACKS({}))
    }
  }
}