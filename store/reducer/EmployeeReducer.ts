import { Reducer } from '@reduxjs/toolkit'

export type EmployeeReducerType = {
  employees: Employee[],
  totalRow: number;
}

export type Employee = {
  id: string;
  name: string;
  idKaryawan: string;
}

const initialState: EmployeeReducerType = {
  employees: [],
  totalRow: 0,
}

const employeeReducer: Reducer = (state: EmployeeReducerType = initialState, action): EmployeeReducerType => {
  const { type, payload } = action
  switch (type) {
    case 'employee/set-employees':
      return { ...state, employees: payload.employees, totalRow: payload.totalRow }
  }
  return { ...state }
}

export default employeeReducer