import { Reducer } from '@reduxjs/toolkit'
import { Category } from './CategoryReducer';

export type SubCategoryReducerType = {
  sub_categories: SubCategory[];
  totalRow: number;
}

export type SubCategory = {
  id: number;
  name: string;
  category: Category
}

const initialState: SubCategoryReducerType = {
  sub_categories: [],
  totalRow: 0
}

const subCategoryReducer: Reducer = (state: SubCategoryReducerType = initialState, action): SubCategoryReducerType => {
  const { type, payload } = action
  switch (type) {
    case 'sub_category/set-sub_categories':
return { ...state, sub_categories: payload.sub_categories, totalRow: payload.totalRow }
  }
return { ...state }
}

export default subCategoryReducer