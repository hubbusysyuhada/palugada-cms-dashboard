import { Reducer } from '@reduxjs/toolkit'

export type RackReducerType = {
  racks: Rack[];
  totalRow: number;
}

export type Rack = {
  id: string;
  name: string;
  storage_number: number;
}

const initialState: RackReducerType = {
  racks: [],
  totalRow: 0
}

const rackReducer: Reducer = (state: RackReducerType = initialState, action): RackReducerType => {
  const { type, payload } = action
  switch (type) {
    case 'rack/set-racks':
return { ...state, racks: payload.racks, totalRow: payload.totalRow }
  }
return { ...state }
}

export default rackReducer