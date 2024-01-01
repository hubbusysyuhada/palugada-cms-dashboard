import { Reducer } from '@reduxjs/toolkit'
import { Supplier } from './SupplierReducer';
import { Item } from './ItemReducer';

export type SupplyReducerType = {
  supplies: Supply[];
  totalRow: number;
}

export type Supply = {
  id: string;
  supplier: Supplier;
  total_price: number;
  invoice_number: string;
  is_paid: boolean;
  json_data: Record<string, any>;
  due_date: Date;
  issued_date: Date;
  notes?: string;
  items: Item[]
}

const initialState: SupplyReducerType = {
  supplies: [],
  totalRow: 0,
}

const supplyReducer: Reducer = (state: SupplyReducerType = initialState, action): SupplyReducerType => {
  const { type, payload } = action
  switch (type) {
    case 'supply/set-supplies':
return { ...state, supplies: payload.supplies, totalRow: payload.totalRow }
  }
return { ...state }
}

export default supplyReducer