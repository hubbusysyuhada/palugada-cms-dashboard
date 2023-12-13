import axios from "@/helper/axios"
import { UseAppDispatchType } from "..";
import Swal from "sweetalert2";
import { Permission } from "../reducer/RBACReducer";
import { SET_LOADING } from "./GlobalContextAction";
import SwalModal from "@/helper/SwalModal";

export const FETCH_ROLES_AND_PERMISSIONS = () => {
  return async (dispatch: UseAppDispatchType) => {
    dispatch(SET_LOADING(true))
    const token = localStorage.getItem('access_token')
    const { data: roles } = await axios.get('/roles', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    const { data: permissions } = await axios.get('/route_permissions', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    if (roles && permissions) {

      const allowedOrderedFeatures = [
        "transactions",
        "catalogs",
        "categories",
        "sub_categories",
        "items",
        "racks",
        "suppliers",
        "supplies",
        "employees",
        "roles",
        // "route_permissions", // commented because of security reasons. User should add it manually via database if they want to make a new route permissions
        // "user" // commented because of security reasons. User feature should only accessed by owner
      ]
      const orderedPermissions: Permission[] = []
      allowedOrderedFeatures.map(f => orderedPermissions.push(permissions.data.find((p: Permission) => p.name === f)))
      dispatch({ type: 'rbac/roles', payload: roles.data })
      dispatch({ type: 'rbac/permissions', payload: orderedPermissions })
    }
    dispatch(SET_LOADING(false))
  }
}

export const FETCH_ROLES = () => {
  return async (dispatch: UseAppDispatchType) => {
    const token = localStorage.getItem('access_token')
    const { data: roles } = await axios.get('/roles', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    if (roles) {
      dispatch({ type: 'rbac/roles', payload: roles.data })
    }
  }
}

export const UPDATE_ROLES_AND_PERMISSIONS = (param: { roleId: string; permissionsId: string[]; name: string }) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const { roleId, permissionsId, name } = param
      const token = localStorage.getItem('access_token')
      const { data: roles } = await axios.put(`/roles/${roleId}`, { name, permissionsId }, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ROLES_AND_PERMISSIONS())
    }
  }
}

export const CREATE_ROLE = (name: string) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.post(`/roles`, { name }, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ROLES_AND_PERMISSIONS())
    }
  }
}

export const DELETE_ROLES = (id: string) => {
  return async (dispatch: UseAppDispatchType) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.delete(`/roles/${id}`, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
    } catch (error) {
      throwErr(error)
    } finally {
      dispatch(FETCH_ROLES_AND_PERMISSIONS())
    }
  }
}

export function throwErr(err: any) {
  SwalModal({
    icon: 'error',
    text: err.response.data.code || err.response.data.message || "something went wrong",
    hideDenyButton: true
  })
}