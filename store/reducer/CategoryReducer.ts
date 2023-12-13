import { Reducer } from '@reduxjs/toolkit'
import { Catalog } from './CatalogReducer';

export type CategoryReducerType = {
  categories: Category[];
  totalRow: number;
}

export type Category = {
  id: string;
  name: string;
  catalog: Catalog
}

const initialState: CategoryReducerType = {
  categories: [],
  totalRow: 0
}

const categoryReducer: Reducer = (state: CategoryReducerType = initialState, action): CategoryReducerType => {
  const { type, payload } = action
  switch (type) {
    case 'category/set-categories':
return { ...state, categories: payload.categories, totalRow: payload.totalRow }
  }
return { ...state }
}

export default categoryReducer