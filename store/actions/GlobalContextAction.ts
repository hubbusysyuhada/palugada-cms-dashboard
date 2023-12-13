import { UseAppDispatchType } from "..";

export function SET_LOADING(isLoading: boolean) {
  return (dispatch: UseAppDispatchType) => {
    dispatch({ type: `GC/loading-${isLoading ? 'on' : 'off'}` })
  }
}

export function SET_ROUTE(route: string) {
  return (dispatch: UseAppDispatchType) => {
    dispatch({ type: "GC/set-route", payload: route })
  }
}