import { configureStore } from '@reduxjs/toolkit'
import * as reducer from './reducer'
import { AuthReducerType } from './reducer/AuthReducer'
import { useDispatch } from 'react-redux'
import { GlobalContextReducerType } from './reducer/GlobalContextReducer'
import { RBACReducerType } from './reducer/RBACReducer'
import { UserReducerType } from './reducer/UserReducer'
import { EmployeeReducerType } from './reducer/EmployeeReducer'
import { CatalogReducerType } from './reducer/CatalogReducer'
import { CategoryReducerType } from './reducer/CategoryReducer'
import { SubCategoryReducerType } from './reducer/SubCategoryReducer'
import { RackReducerType } from './reducer/RackReducer'
import { SupplierReducerType } from './reducer/SupplierReducer'
import { SupplyReducerType } from './reducer/SupplyReducer'
import { ItemReducerType } from './reducer/ItemReducer'
import { TransactionyReducerType } from './reducer/TransactionReducer'

export type RootStateType = {
  GlobalContextReducer: GlobalContextReducerType;
  AuthReducer: AuthReducerType;
  RBACReducer: RBACReducerType;
  UserReducer: UserReducerType;
  EmployeeReducer: EmployeeReducerType;
  CatalogReducer: CatalogReducerType;
  CategoryReducer: CategoryReducerType;
  SubCategoryReducer: SubCategoryReducerType;
  RackReducer: RackReducerType;
  SupplierReducer: SupplierReducerType;
  SupplyReducer: SupplyReducerType;
  ItemReducer: ItemReducerType;
  TransactionReducer: TransactionyReducerType;
}

const store = configureStore({ reducer })

export const useAppDispatch: () => typeof store.dispatch = useDispatch
export type UseAppDispatchType = typeof store.dispatch

export default store