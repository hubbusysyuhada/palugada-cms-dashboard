import axios from "@/helper/axios"
import { UseAppDispatchType } from "..";
import { throwErr } from "./RBACAction";
import { SET_LOADING, SET_ROUTE } from "./GlobalContextAction";
import _ from "lodash";
import { SupplyItemPayloadType, SupplyPayloadType } from "@/components/pages/CreateSupplyPage";

export const FETCH_ALL_ITEMS = (payload: Partial<{ keywords: string; supplierIds?: string[]; subCategoryIds?: number[]; limit: number; offset: number; orderBy: [string, "ASC" | "DESC"][] }>) => {
  return async (dispatch: UseAppDispatchType) => {
    dispatch(SET_LOADING(true))
    const { keywords, limit, offset, supplierIds, subCategoryIds, orderBy } = payload
    let url = `/items?limit=${limit || 25}&offset=${offset || 0}`
    if (keywords) url += `&keywords=${keywords}`
    if (supplierIds?.length) url += `&supplier_id=${JSON.stringify(supplierIds)}`
    if (subCategoryIds?.length) url += `&sub_category_id=${JSON.stringify(subCategoryIds)}`
    if (orderBy?.length) url += `&order_by=${JSON.stringify(orderBy)}`
    const token = localStorage.getItem('access_token')
    const { data: items } = await axios.get(url, {
      headers: {
        Authorization: 'Bearer ' + token
      },
    })
    const { data: suppliers } = await axios.get("items/all-suppliers", {
      headers: {
        Authorization: 'Bearer ' + token
      },
    })
    const { data: subCategories } = await axios.get("items/all-sub-categories", {
      headers: {
        Authorization: 'Bearer ' + token
      },
    })

    if (items && suppliers && subCategories) {
      dispatch({ type: 'item/set-items', payload: { items: items.data, totalRow: items.data[0]?.total_row || 0 } })
      dispatch({ type: 'supplier/set-suppliers', payload: { suppliers: suppliers.data, totalRow: suppliers.data[0]?.total_row || 0 } })
      dispatch({ type: 'sub_category/set-sub_categories', payload: { sub_categories: subCategories.data, totalRow: subCategories.data[0]?.total_row || 0 } })
    }
    dispatch(SET_LOADING(false))
  }
}

export const UPDATE_ITEM = (payload: { id: number; } & Record<string, any>) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const id = payload.id
      const token = localStorage.getItem('access_token')
      await axios.put(`/items/${id}`, _.omit(payload, ['id', 'created_at', 'total_row']), {
        headers: {
          Authorization: 'Bearer ' + token
        },
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_ITEMS({}))
    }
  }
}