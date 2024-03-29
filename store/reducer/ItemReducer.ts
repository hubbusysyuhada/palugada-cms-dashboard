import { Reducer } from '@reduxjs/toolkit'
import { Rack } from './RackReducer';
import { SubCategory } from './SubCategoryReducer';
import { Supply } from './SupplyReducer';

export type ItemReducerType = {
  items: Item[];
  totalRow: number;
}

export enum ItemUnitType {
  GALOON = 'gln',
  LITER = 'ltr',
  SET = 'set'
}

export type Item = {
  id: number;
  name: string;
  description?: string;
  unique_id: string;
  buying_price: number;
  selling_price: number;
  rack: Rack;
  sub_category: SubCategory;
  stock: number;
  unit: ItemUnitType;
  supply: Supply;
}

const initialState: ItemReducerType = {
  items: [],
  totalRow: 0,
}

const itemReducer: Reducer = (state: ItemReducerType = initialState, action): ItemReducerType => {
  const { type, payload } = action
  switch (type) {
    case 'item/set-items':
return { ...state, items: payload.items, totalRow: payload.totalRow }
  }
return { ...state }
}

export default itemReducer