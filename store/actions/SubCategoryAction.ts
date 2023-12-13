import axios from "@/helper/axios"
import { UseAppDispatchType } from "..";
import { throwErr } from "./RBACAction";
import { SET_LOADING } from "./GlobalContextAction";

export const FETCH_ALL_SUB_CATEGORIES = (payload: Partial<{ name: string; categoryIds: string[]; catalogIds: string[]; limit: number; offset: number }>) => {
  return async (dispatch: UseAppDispatchType) => {
    dispatch(SET_LOADING(true))
    const { name, categoryIds, catalogIds, limit, offset } = payload
    let url = `/sub_categories?limit=${limit || 25}&offset=${offset || 0}`
    if (name) url += `&name=${name}`
    if (categoryIds?.length) url += `&category_id=${JSON.stringify(categoryIds)}`
    if (catalogIds?.length) url += `&catalog_id=${JSON.stringify(catalogIds)}`
    const token = localStorage.getItem('access_token')
    
    const { data } = await axios.get(url, {
      headers: {
        Authorization: 'Bearer ' + token
      },
    })
    const { data: categories } = await axios.get('/sub_categories/all-categories', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    const { data: catalogs } = await axios.get('/sub_categories/all-catalogs', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })

    if (data && catalogs && categories) {
      dispatch({ type: 'sub_category/set-sub_categories', payload: { sub_categories: data.data, totalRow: data.data[0]?.total_row || 0 } })
      dispatch({ type: 'category/set-categories', payload: { categories: categories.data } })
      dispatch({ type: 'catalog/set-catalogs', payload: { catalogs: catalogs.data} })
    }
    dispatch(SET_LOADING(false))
  }
}

export const CREATE_SUB_CATEGORY = (payload: { name: string; category_id: string; }) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.post(`/sub_categories`, payload, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_SUB_CATEGORIES({}))
    }
  }
}

export const DELETE_SUB_CATEGORY = (id: number) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.delete(`/sub_categories/${id}`, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_SUB_CATEGORIES({}))
    }
  }
}

export const UPDATE_SUB_CATEGORY = (payload: { id: number; name: string; category_id: string; }) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const { id, name, category_id } = payload
      const token = localStorage.getItem('access_token')
      await axios.put(`/sub_categories/${id}`, { name, category_id }, {
        headers: {
          Authorization: 'Bearer ' + token
        },
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_SUB_CATEGORIES({}))
    }
  }
}