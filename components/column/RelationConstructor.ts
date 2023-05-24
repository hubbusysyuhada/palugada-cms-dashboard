import { Column, Schema, Table } from "../schema"
import Swal from "sweetalert2"
import { FKActionType } from "./relation";

export interface RelationConstructorType {
  create: (payload: RelationConstructorPayload) => Promise<Schema>;
  update: (payload: RelationConstructorPayload & { originalColumnName: string; }) => Promise<Schema>;
  delete: (payload: RelationConstructorPayload & { column: Column }) => Promise<{ schema: Schema; isConfirmed: Boolean; }>;
}

type RelationConstructorPayload = {
  targetTableIndex: number;
  oppositeTableIndex: number;
  columnName: string;
  onUpdate: FKActionType;
  onDelete: FKActionType;
  oppositeColumnName: string;
  schema: Schema;
}

// note: render self relation masih error di collection column name
const oneToOne: RelationConstructorType = {
  async create(payload) {
    const {
      targetTableIndex,
      columnName,
      schema,
      onUpdate,
      onDelete,
      oppositeColumnName,
      oppositeTableIndex
    } = payload
    const originTableColumn: Column = {
      name: columnName,
      type: "relation",
      relation: {
        relationType: "OneToOne",
        isOwner: true,
        targetTable: targetTableIndex,
        targetColumn: schema.tables[targetTableIndex].columns.length,
        onUpdate,
        onDelete,
      }
    }
    const targetTableColumn: Column = {
      name: oppositeColumnName,
      type: "relation",
      relation: {
        relationType: "OneToOne",
        isOwner: false,
        targetTable: oppositeTableIndex,
        targetColumn: schema.tables[oppositeTableIndex].columns.length,
        onUpdate,
        onDelete,
      }
    }
    schema.tables[oppositeTableIndex].columns.push(originTableColumn)
    schema.tables[targetTableIndex].columns.push(targetTableColumn)
    return schema
  },
  async update(payload) {
    const {
      targetTableIndex,
      columnName,
      schema,
      onUpdate,
      onDelete,
      oppositeColumnName,
      oppositeTableIndex
    } = payload
    return schema
  },
  async delete(payload) {
    const {
      schema,
      oppositeTableIndex,
      column
    } = payload
    const columnTargetTable = column.relation?.targetTable as number
    const columnTargetColumn = column.relation?.targetColumn as number
    const tableName = schema.tables[oppositeTableIndex].name
    const oppositeTable = schema.tables[columnTargetTable]
    const oppositeTableName = oppositeTable.name
    const oppositeColumn = oppositeTable.columns[columnTargetColumn]
    const { isConfirmed } = await Swal.fire({
      title: `Delete One to One relation ${column.name} (${tableName}) and ${oppositeColumn.name} (${oppositeTableName})?`,
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    })
    if (isConfirmed) {
      schema.tables[columnTargetTable].columns.splice(columnTargetColumn, 1)
      schema.tables[oppositeColumn.relation?.targetTable as number].columns.splice(oppositeColumn.relation?.targetColumn as number, 1)
      Swal.fire(
        'Deleted!',
        `Column ${column.name} (${tableName}) and ${oppositeColumn.name} (${oppositeTableName}) has been deleted.`,
        'success'
      )
    }
    return { isConfirmed, schema }
  },
}

const oneToMany: RelationConstructorType = {
  async create(payload) {
    const {
      targetTableIndex,
      columnName,
      schema,
      onUpdate,
      onDelete,
      oppositeColumnName,
      oppositeTableIndex
    } = payload
    const originTableColumn: Column = {
      name: columnName,
      type: "relation",
      relation: {
        relationType: "ManyToOne",
        isOwner: false,
        targetTable: targetTableIndex,
        targetColumn: !oppositeColumnName ? 0 : schema.tables[targetTableIndex].columns.length,
        onUpdate,
        onDelete,
      }
    }
    const targetTableColumn: Column = {
      name: oppositeColumnName,
      type: "relation",
      relation: {
        relationType: "OneToMany",
        isOwner: true,
        targetTable: oppositeTableIndex,
        targetColumn: schema.tables[oppositeTableIndex].columns.length,
        onUpdate,
        onDelete,
      }
    }

    schema.tables[oppositeTableIndex].columns.push(originTableColumn)
    if (oppositeColumnName) schema.tables[targetTableIndex].columns.push(targetTableColumn)
    return schema
  },
  async update(payload) {
    const {
      targetTableIndex,
      columnName,
      schema,
      onUpdate,
      onDelete,
      oppositeColumnName,
      oppositeTableIndex
    } = payload
    return schema
  },
  async delete(payload) {
    const {
      schema,
      oppositeTableIndex,
      column
    } = payload
    const columnTargetTable = column.relation?.targetTable as number
    const columnTargetColumn = column.relation?.targetColumn as number
    const tableName = schema.tables[oppositeTableIndex].name
    const oppositeTable = schema.tables[columnTargetTable]
    const oppositeTableName = oppositeTable.name
    const oppositeColumn = oppositeTable.columns[columnTargetColumn]
    const columns = oppositeColumn ? `${column.name} (${tableName}) and ${oppositeColumn.name} (${oppositeTableName})` : `${column.name} in table ${tableName}`
    const { isConfirmed } = await Swal.fire({
      title: `Delete One to Many relation ${columns}?`,
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    })
    if (isConfirmed) {
      schema.tables[oppositeTableIndex].columns = schema.tables[oppositeTableIndex].columns.filter(c => c.name !== column.name)
      if (oppositeColumn) {
        schema.tables[columnTargetTable].columns.splice(columnTargetColumn, 1)
      }
      Swal.fire(
        'Deleted!',
        `Column ${columns} has been deleted.`,
        'success'
      )
    }
    return { isConfirmed, schema }
  },
}

const manyToMany: RelationConstructorType = {
  async create(payload: RelationConstructorPayload) {
    const {
      targetTableIndex,
      columnName,
      schema,
      onUpdate,
      onDelete,
      oppositeColumnName,
      oppositeTableIndex
    } = payload
    const originTableColumn: Column = {
      name: columnName,
      type: "relation",
      relation: {
        relationType: "ManyToMany",
        isOwner: true,
        targetTable: targetTableIndex,
        targetColumn: schema.tables[targetTableIndex].columns.length,
        onUpdate,
        onDelete,
      }
    }
    const targetTableColumn: Column = {
      name: oppositeColumnName,
      type: "relation",
      relation: {
        relationType: "ManyToMany",
        isOwner: true,
        targetTable: oppositeTableIndex,
        targetColumn: schema.tables[oppositeTableIndex].columns.length,
        onUpdate,
        onDelete,
      }
    }
    schema.tables[oppositeTableIndex].columns.push(originTableColumn)
    schema.tables[targetTableIndex].columns.push(targetTableColumn)
    return schema
  },
  async update(payload) {
    const {
      targetTableIndex,
      columnName,
      schema,
      onUpdate,
      onDelete,
      oppositeColumnName,
      oppositeTableIndex
    } = payload
    return schema
  },
  async delete(payload) {
    const {
      schema,
      oppositeTableIndex,
      column
    } = payload
    const columnTargetTable = column.relation?.targetTable as number
    const columnTargetColumn = column.relation?.targetColumn as number
    const tableName = schema.tables[oppositeTableIndex].name
    const oppositeTable = schema.tables[columnTargetTable]
    const oppositeTableName = oppositeTable.name
    const oppositeColumn = oppositeTable.columns[column.relation?.targetColumn as number]
    const { isConfirmed } = await Swal.fire({
      title: `Delete Many to Many relation ${column.name} (${tableName}) and ${oppositeColumn.name} (${oppositeTableName})?`,
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    })
    if (isConfirmed) {
      schema.tables[columnTargetTable].columns.splice(columnTargetColumn, 1)
      schema.tables[oppositeColumn.relation?.targetTable as number].columns.splice(oppositeColumn.relation?.targetColumn as number, 1)
      Swal.fire(
        'Deleted!',
        `Column ${column.name} (${tableName}) and ${oppositeColumn.name} (${oppositeTableName}) has been deleted.`,
        'success'
      )
    }
    return { isConfirmed, schema }
  },
}

export default { oneToOne, oneToMany, manyToMany }