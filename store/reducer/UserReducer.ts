import { Reducer } from '@reduxjs/toolkit'
import { Role } from './RBACReducer';

export type UserReducerType = {
  users: {
    id: string;
    external_id: string;
    role: Role
  }[],
  totalRow: number;
}

const initialState: UserReducerType = {
  users: [],
  totalRow: 0,
}

const userReducer: Reducer = (state: UserReducerType = initialState, action): UserReducerType => {
  const { type, payload } = action
  switch (type) {
    case 'user/set-users':
      return { ...state, users: payload.users, totalRow: payload.totalRow }
  }
  return { ...state }
}

export default userReducer