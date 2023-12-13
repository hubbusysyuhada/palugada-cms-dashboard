import axios from "@/helper/axios"
import { UseAppDispatchType } from "..";
import { throwErr } from "./RBACAction";
import { SET_LOADING } from "./GlobalContextAction";

export const FETCH_ALL_CATEGORIES = (payload: Partial<{ name: string; catalogIds: string[]; limit: number; offset: number }>) => {
  return async (dispatch: UseAppDispatchType) => {
    dispatch(SET_LOADING(true))
    const { name, catalogIds, limit, offset } = payload
    let url = `/categories?limit=${limit || 25}&offset=${offset || 0}`
    if (name) url += `&name=${name}`
    if (catalogIds?.length) url += `&catalog_id=${JSON.stringify(catalogIds)}`
    const token = localStorage.getItem('access_token')
    const { data } = await axios.get(url, {
      headers: {
        Authorization: 'Bearer ' + token
      },
    })
    const { data: catalogs } = await axios.get('/categories/all-catalogs', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })

    if (data && catalogs) {
      dispatch({ type: 'category/set-categories', payload: { categories: data.data, totalRow: data.data[0]?.total_row || 0 } })
      dispatch({ type: 'catalog/set-catalogs', payload: { catalogs: catalogs.data} })
    }
    dispatch(SET_LOADING(false))
  }
}

export const CREATE_CATEGORY = (payload: { name: string; catalog_id: string; }) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.post(`/categories`, payload, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_CATEGORIES({}))
    }
  }
}

export const DELETE_CATEGORY = (id: string) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.delete(`/categories/${id}`, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_CATEGORIES({}))
    }
  }
}

export const UPDATE_CATEGORY = (payload: { id: string; name: string; catalog_id: string; }) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const { id, name, catalog_id } = payload
      const token = localStorage.getItem('access_token')
      await axios.put(`/categories/${id}`, { name, catalog_id }, {
        headers: {
          Authorization: 'Bearer ' + token
        },
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_CATEGORIES({}))
    }
  }
}