import { Reducer } from '@reduxjs/toolkit'

export type RBACReducerType = {
  allRoles: Role[];
  allPermissions: Permission[];
}

export type Role = {
  id: string;
  name: string;
  permissions: Permission[];
}

export type Permission = {
  id: string;
  name: string;
}

const initialState: RBACReducerType = {
  allRoles: [],
  allPermissions: []
}

const rbacReducer: Reducer = (state: RBACReducerType = initialState, action): RBACReducerType => {
  const { type, payload } = action
  switch (type) {
    case 'rbac/roles':
      return { ...state, allRoles: payload }
    case 'rbac/permissions':
      return { ...state, allPermissions: payload }
  }
  return { ...state }
}

export default rbacReducer