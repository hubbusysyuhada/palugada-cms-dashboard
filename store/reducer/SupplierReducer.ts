import { Reducer } from '@reduxjs/toolkit'

export type SupplierReducerType = {
  suppliers: Supplier[];
  totalRow: number;
}

export type Supplier = {
  id: string;
  name: string;
  address?: string;
  contact_person: string;
  contact_info: string;
  account_number: string;
  account_name: string;
  bank_name: string;
  notes?: string;
}

const initialState: SupplierReducerType = {
  suppliers: [],
  totalRow: 0,
}

const supplierReducer: Reducer = (state: SupplierReducerType = initialState, action): SupplierReducerType => {
  const { type, payload } = action
  switch (type) {
    case 'supplier/set-suppliers':
return { ...state, suppliers: payload.suppliers, totalRow: payload.totalRow }
  }
return { ...state }
}

export default supplierReducer