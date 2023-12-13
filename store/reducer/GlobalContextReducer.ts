import { Reducer } from '@reduxjs/toolkit'

export type GlobalContextReducerType = {
  isLoading: boolean;
  routeName: string;
}

const initialState: GlobalContextReducerType = {
  isLoading: false,
  routeName: '',
}

const globalContextReducer: Reducer = (state: GlobalContextReducerType = initialState, action): GlobalContextReducerType => {
  const { type, payload } = action
  switch (type) {
    case 'GC/set-route':
      return { ...state, routeName: payload }
    case 'GC/loading-on':
      return { ...state, isLoading: true }
    case 'GC/loading-off':
      return { ...state, isLoading: false }
  }
  return { ...state }
}

export default globalContextReducer