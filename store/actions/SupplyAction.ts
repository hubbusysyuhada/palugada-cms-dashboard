import axios from "@/helper/axios"
import { UseAppDispatchType } from "..";
import { throwErr } from "./RBACAction";
import { SET_LOADING, SET_ROUTE } from "./GlobalContextAction";
import _ from "lodash";
import { SupplyItemPayloadType, SupplyPayloadType } from "@/components/pages/CreateSupplyPage";

export const FETCH_ALL_SUPPLIES = (payload: Partial<{ keywords: string; supplierIds?: string[]; paid?: boolean[]; limit: number; offset: number; orderBy: [string, "ASC" | "DESC"][] }>) => {
  return async (dispatch: UseAppDispatchType) => {
    dispatch(SET_LOADING(true))
    const { keywords, limit, offset, supplierIds, paid, orderBy } = payload
    let url = `/supplies?limit=${limit || 25}&offset=${offset || 0}`
    if (keywords) url += `&keywords=${keywords}`
    if (supplierIds?.length) url += `&supplier_id=${JSON.stringify(supplierIds)}`
    if (paid?.length) url += `&paid=${JSON.stringify(paid)}`
    if (orderBy?.length) url += `&order_by=${JSON.stringify(orderBy)}`
    const token = localStorage.getItem('access_token')
    const { data: supplies } = await axios.get(url, {
      headers: {
        Authorization: 'Bearer ' + token
      },
    })
    const { data: suppliers } = await axios.get("supplies/all-suppliers", {
      headers: {
        Authorization: 'Bearer ' + token
      },
    })
    const { data: racks } = await axios.get("supplies/all-racks", {
      headers: {
        Authorization: 'Bearer ' + token
      },
    })
    const { data: subCategories } = await axios.get("supplies/all-sub-categories", {
      headers: {
        Authorization: 'Bearer ' + token
      },
    })

    if (supplies && suppliers && racks && subCategories) {
      dispatch({ type: 'supply/set-supplies', payload: { supplies: supplies.data, totalRow: supplies.data[0]?.total_row || 0 } })
      dispatch({ type: 'supplier/set-suppliers', payload: { suppliers: suppliers.data, totalRow: suppliers.data[0]?.total_row || 0 } })
      dispatch({ type: 'rack/set-racks', payload: { racks: racks.data, totalRow: racks.data[0]?.total_row || 0 } })
      dispatch({ type: 'sub_category/set-sub_categories', payload: { sub_categories: subCategories.data, totalRow: subCategories.data[0]?.total_row || 0 } })
    }
    dispatch(SET_LOADING(false))
  }
}

type CreateSupplyPayloadType = {
  supplier_id: string;
  invoice_number: string;
  due_date: string;
  issued_date: string;
  is_paid: boolean;
  items: SupplyItemPayloadType[]
}

export const CREATE_SUPPLY = (payload: CreateSupplyPayloadType) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.post(`/supplies`, payload, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
      dispatch(SET_LOADING(true))
      dispatch(FETCH_ALL_SUPPLIES({}))
      dispatch(SET_ROUTE('supplies'))
      dispatch(SET_LOADING(false))
    } catch (error) {
      throwErr(error)
    }
  }
}

export const UPDATE_SUPPLY = (payload: { id: string; } & Record<string, any>) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const id = payload.id
      const token = localStorage.getItem('access_token')
      await axios.put(`/supplies/${id}`, _.omit(payload, ['id', 'created_at', 'total_row']), {
        headers: {
          Authorization: 'Bearer ' + token
        },
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ALL_SUPPLIES({}))
    }
  }
}