import { Reducer } from '@reduxjs/toolkit'
import { Supplier } from './SupplierReducer';
import { Item } from './ItemReducer';
import { Employee } from './EmployeeReducer';

export type TransactionyReducerType = {
  transactions: Transaction[];
  totalRow: number;
}

export type TypeOfTransactionType = 'IN' | 'OUT'

export type ServiceType = {
  name: string;
  price: number;
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
  additional_services: ServiceType[],
  mechanics: Employee[];
  transaction_items: TransactionItem[]
}

const initialState: TransactionyReducerType = {
  transactions: [],
  totalRow: 0,
}

const supplyReducer: Reducer = (state: TransactionyReducerType = initialState, action): TransactionyReducerType => {
  const { type, payload } = action
  switch (type) {
    case 'transaction/set-transactions':
return { ...state, transactions: payload.transactions, totalRow: payload.totalRow }
  }
return { ...state }
}

export default supplyReducer