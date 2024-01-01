import axios from "@/helper/axios"
import { UseAppDispatchType } from "..";
import { throwErr } from "./RBACAction";
import { SET_LOADING, SET_ROUTE } from "./GlobalContextAction";
import _ from "lodash";
import { TransactionPayloadType } from "@/components/pages/CreateTransactionInPage";
import { ServiceType, TypeOfTransactionType } from "../reducer/TransactionReducer";

export const FETCH_ALL_TRANSACTIONS = (payload: Partial<{ keywords: string; type: TypeOfTransactionType[]; startDate: string; endDate: string; limit: number; offset: number; orderBy: [string, "ASC" | "DESC"][] }>) => {
  return async (dispatch: UseAppDispatchType) => {
    dispatch(SET_LOADING(true))
    const { keywords, limit, offset, orderBy, startDate, endDate, type } = payload
    let url = `/transactions?limit=${limit || 25}&offset=${offset || 0}`
    if (keywords) url += `&keywords=${keywords}`
    if (startDate) url += `&start_date=${startDate}`
    if (endDate) url += `&end_date=${endDate}`
    if (type?.length) url += `&type=${JSON.stringify(type)}`
    if (orderBy?.length) url += `&order_by=${JSON.stringify(orderBy)}`
    const token = localStorage.getItem('access_token')
    const { data: transactions } = await axios.get(url, {
      headers: {
        Authorization: 'Bearer ' + token
      },
    })
    const { data: employees } = await axios.get("transactions/all-employees", {
      headers: {
        Authorization: 'Bearer ' + token
      },
    })

    const { data: items } = await axios.get("transactions/all-items?stock=gt-0", {
      headers: {
        Authorization: 'Bearer ' + token
      },
    })

    if (transactions && employees && items) {
      dispatch({ type: 'transaction/set-transactions', payload: { transactions: transactions.data, totalRow: transactions.data[0]?.total_row || 0 } })
      dispatch({ type: 'employee/set-employees', payload: { employees: employees.data, totalRow: employees.data[0]?.total_row || 0 } })
      dispatch({ type: 'item/set-items', payload: { items: items.data, totalRow: items.data[0]?.total_row || 0 } })
    }
    dispatch(SET_LOADING(false))
  }
}

type CreateTransactionPayloadType = {
  items: {
    id: number;
    amount: number;
  }[];
  mechanicIds: string[];
  services: ServiceType[];
} & TransactionPayloadType

export const CREATE_TRANSACTION = (payload: CreateTransactionPayloadType, type: TypeOfTransactionType) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.post(`/transactions`, { ...payload, type }, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
      dispatch(SET_LOADING(true))
      dispatch(FETCH_ALL_TRANSACTIONS({}))
      dispatch(SET_ROUTE('transactions'))
      dispatch(SET_LOADING(false))
    } catch (error) {
      throwErr(error)
    }
  }
}