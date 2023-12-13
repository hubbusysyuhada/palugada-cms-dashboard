import { Reducer } from '@reduxjs/toolkit'

export type CatalogReducerType = {
  catalogs: Catalog[],
  totalRow: number;
}

export type Catalog = {
  id: string;
  name: string;
}

const initialState: CatalogReducerType = {
  catalogs: [],
  totalRow: 0,
}

const catalogReducer: Reducer = (state: CatalogReducerType = initialState, action): CatalogReducerType => {
  const { type, payload } = action
  switch (type) {
    case 'catalog/set-catalogs':
      return { ...state, catalogs: payload.catalogs, totalRow: payload.totalRow }
  }
  return { ...state }
}

export default catalogReducer