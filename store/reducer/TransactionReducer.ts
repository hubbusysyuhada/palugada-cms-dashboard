import { Reducer } from '@reduxjs/toolkit'
import { Supplier } from './SupplierReducer';
import { Item } from './ItemReducer';
import { Employee } from './EmployeeReducer';

export type TransactionyReducerType = {
  transactions: Transaction[];
  totalRow: number;
  insight: Record<number, InsightType>
}

export type TypeOfTransactionType = 'IN' | 'OUT'

export type InsightSeriesType = 'daily' | 'weekly' | 'monthly' | 'once'

export type ServiceType = {
  name: string;
  price: number;
}

export type InsightType = {
  label: string;
  in: number[];
  out: number[];
  sumIn: number;
  sumOut: number;
}
export type TransactionItem = {
  item: Item;
  amount: number;
}

export type Transaction = {
  id: number;
  created_at: Date;
  invoice: string;
  total_price: number;
  vehicle_type?: string;
  plate_number?: string;
  customer_name: string;
  customer_phone: string;
  type: TypeOfTransactionType;
  notes?: string;
  discount: number;
  additional_services: ServiceType[],
  mechanics: Employee[];
  transaction_items: TransactionItem[]
}

const initialState: TransactionyReducerType = {
  transactions: [],
  totalRow: 0,
  insight: {}
}

const supplyReducer: Reducer = (state: TransactionyReducerType = initialState, action): TransactionyReducerType => {
  const { type, payload } = action
  switch (type) {
    case 'transaction/set-transactions':
      return { ...state, transactions: payload.transactions, totalRow: payload.totalRow }
    case 'transaction/set-insight':
      return { ...state, insight: payload.insight }
  }
  return { ...state }
}

export default supplyReducer