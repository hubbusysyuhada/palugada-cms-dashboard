import makeKey from "@/helper/makeKey";
import setLocalStorage from "@/helper/setLocalStorage";
import { AddCard, CreateNewFolderOutlined, Delete, KeyboardArrowDown, KeyboardArrowUp, Settings } from "@mui/icons-material";
import { Box, Button, Grid, IconButton, MenuItem, Modal, Select, Switch, TextField, } from "@mui/material";
import React, { useEffect, useState } from "react"
import styles from 'styles/Schema.module.scss'
import Swal from "sweetalert2";
import _ from 'lodash'
import ColumnConstrucor from "./column";

export type DataType = "varchar" | "tinytext" | "mediumtext" | "longtext" | "password" | "integer" | "float" | "boolean" | "timestamp" | "uuid" | "autoincrement"
export type SqlColumnProps = 'default' | 'defaultType' | 'unique' | 'nullable' | 'primary' | 'index' | 'precision' | 'scale' | 'length' 

export type Column = {
  name: string;
  type: DataType;
  default?: string;
  defaultType?: "expression" | "value";
  unique?: boolean;
  nullable?: boolean;
  primary?: boolean;
  autoIncrement?: boolean;
  index?: boolean;

  length?: number;

  scale?: number;
  precision?: number;

  isProtected?: boolean;
  error?: string
}

export type Table = {
  name: string;
  columns: Column[];
  uniqueIndex?: string[];
  isProtected: boolean;
  isOpen?: boolean
  error?: string
}

export type Schema = {
  tables: Table[]
}

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #08011b',
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
};

export default function Schema() {
  const [schema, setSchema] = useState<Schema>({ tables: [] })
  const [showColumnModal, setShowColumnModal] = useState(false)
  const [columnTableId, setColumnTableId] = useState(0)
  const [disableSaveColumn, setDisableSaveColumn] = useState(false)
  const [columnRulePassed, setColumnRulePassed] = useState(true)
  const [isEditColumn, setIsEditColumn] = useState(false)
  const [editColumnName, setEditColumnName] = useState("")
  const [columnName, setColumnName] = useState("")
  const [columnType, setColumnType] = useState<DataType>("boolean")
  const defaultValue = useState("")
  const defaultType = useState<"expression" | "value">("value")
  const unique = useState(false)
  const nullable = useState(true)
  const primary = useState(false)
  const autoIncrement = useState(false)
  const index = useState(false)
  const precision = useState<number | null>(null)
  const scale = useState<number | null>(null)
  const length = useState<number | null>(null)


  useEffect(() => {
    const initialState: Schema = {
      tables: [
        {
          name: "user",
          columns: [
            {
              name: "id",
              type: "uuid",
              primary: true,
              isProtected: true,
            },
            {
              name: "external_id",
              type: "varchar",
              length: 255,
              unique: true,
              index: true,
              nullable: false,
              isProtected: true,
            },
            {
              name: "password",
              type: "password",
              nullable: false,
              isProtected: true,
            },
            {
              name: "created_at",
              type: "timestamp",
              default: "new Date()",
              defaultType: "value",
              isProtected: true,
            },
          ],
          isProtected: true
        }
      ]
    }
    const currentEnv = localStorage.getItem('SCHEMA')
    if (currentEnv) {
      const parsedSchema = JSON.parse(currentEnv)
      setSchema(parsedSchema)
    }
    else {
      setSchema(initialState)
      localStorage.setItem('SCHEMA', JSON.stringify(initialState))
    }
  }, [])

  useEffect(() => {
    const existingColumns = schema.tables[columnTableId]?.columns
      .map(v => v.name)
      .filter(name => name !== editColumnName)

    if (!columnName || existingColumns.includes(columnName) || !columnRulePassed) setDisableSaveColumn(true)
    else setDisableSaveColumn(false)
  }, [columnName, columnRulePassed])

  const openCloseTable = (index: number, val: boolean) => {
    const tables: Table[] = JSON.parse(JSON.stringify(schema.tables))
    tables[index].isOpen = !tables[index].isOpen
    setSchema({ ...schema, tables })
  }

  const createNewTable = () => {
    const name = makeKey(5)
    const table: Table = {
      name,
      isProtected: false,
      columns: [
        {
          name: "id",
          type: "uuid",
          primary: true,
          isProtected: true,
        },
        {
          name: "created_at",
          type: "timestamp",
          default: "new Date()",
          defaultType: "value",
          isProtected: true,
        },
      ]
    }

    const tables = JSON.parse(JSON.stringify(schema.tables))
    tables.push(table)
    const newSchema = { ...schema, tables }
    setSchema(newSchema)
    setLocalStorage({ "SCHEMA": JSON.stringify(newSchema) })
  }

  const renameTable = (value: string, index: number) => {
    const tables: Table[] = JSON.parse(JSON.stringify(schema.tables))
    const tableNames = tables.map((v: Table) => v.name)
    tables[index].name = value
    let isError = false
    if (tableNames.includes(value)) {
      tables[index].error = `Table ${value} already exists`
      isError = true
    }
    if (!value) {
      tables[index].error = `Table must have a name`
      isError = true
    }

    if (!isError) {
      tables[index].error = ''
    }

    const newSchema = { ...schema, tables }
    setSchema(newSchema)
    setLocalStorage({ "SCHEMA": JSON.stringify(newSchema) })
  }

  const deleteTable = async (tableName: string) => {
    const { isConfirmed } = await Swal.fire({
      title: `Delete table ${tableName}?`,
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    })
    if (isConfirmed) {
      const tables = schema.tables.filter(v => v.name !== tableName)
      const newSchema = { ...schema, tables }
      setSchema(newSchema)
      setLocalStorage({ "SCHEMA": JSON.stringify(newSchema) })
      Swal.fire(
        'Deleted!',
        `Table ${tableName} has been deleted.`,
        'success'
      )
    }
  }

  const renderTableHeader = (tableName: string, index: number) => {
    const { isProtected, isOpen, error: errorMsg } = schema.tables[index]
    return (
      <>
        <TextField value={tableName} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: schema.tables[index].isProtected, style: { color: "#dbdbdb" } }} onChange={e => { renameTable(e.target.value.replaceAll(' ', '_'), index) }} onClick={e => e.stopPropagation()} error={!!errorMsg} label={errorMsg} />
        {!isProtected && <Delete style={{ height: "16px", width: "16px", color: "#be2b2b" }} onClick={async e => {
          e.stopPropagation()
          await deleteTable(tableName)
        }} />}
        {isOpen ?
          <KeyboardArrowUp style={{ height: "18px", width: "18px", color: "white" }} />
          :
          <KeyboardArrowDown style={{ height: "18px", width: "18px", color: "white" }} />
        }
      </>
    )
  }

  const showColumnModalModal = (tableIndex: number) => {
    setShowColumnModal(true)
    setColumnTableId(tableIndex)
  }

  const showEditColumnModal = (tableIndex: number, column: Column) => {
    setShowColumnModal(true)
    setColumnTableId(tableIndex)
    setIsEditColumn(true)

    setEditColumnName(column.name)
    setColumnName(column.name)
    setColumnType(column.type)

    defaultValue[1](column.default || "")
    defaultType[1](column.defaultType || "value")
    const booleans = { unique, nullable, primary, autoIncrement, index }
    for (const key in booleans) {
      const v = key as keyof typeof column
      if (column[v] !== undefined) {
        booleans[key as keyof typeof booleans][1](column[v] as boolean)
      }
    }

  }

  const renderEditCreateColumn = (tableName: string) => {
    return (
      <Box display={"flex"} justifyContent={"start"} alignContent={"space-between"} alignItems={"center"} flexDirection={"column"} width={"100%"}>
        <Box display={"flex"} alignItems={"center"} marginY={"10px"} width={"70%"} justifyContent={"space-between"}>
          <TextField className={styles['input-label']} value={"Name"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
          <p>:</p>
          <TextField className={styles.input} placeholder="Column Name" value={columnName} variant="standard" type={'text'} InputProps={{ disableUnderline: false }} onChange={e => { setColumnName(e.target.value.toLowerCase().replaceAll(' ', '_')) }} />
        </Box>
        <Box display={"flex"} alignItems={"center"} marginY={"10px"} width={"70%"} justifyContent={"space-between"}>
          <TextField className={styles['input-label']} value={"Column Type"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
          <p>:</p>
          <Select
            className={styles['input']}
            variant="standard"
            value={columnType}
            label="Column Type"
            onChange={e => setColumnType(e.target.value as DataType)}
          >
            <MenuItem value={"boolean"}>Boolean</MenuItem>
            <MenuItem value={"integer"}>Integer</MenuItem>
            <MenuItem value={"float"}>Float</MenuItem>
            <MenuItem value={"varchar"}>Variable Character</MenuItem>
            <MenuItem value={"tinytext"}>Tinytext</MenuItem>
            <MenuItem value={"mediumtext"}>Mediumtext</MenuItem>
            <MenuItem value={"longtext"}>Longtext</MenuItem>
            <MenuItem value={"timestamp"}>Timestamp</MenuItem>
          </Select>
        </Box>
        <ColumnConstrucor type={columnType} tableName={tableName} column={{
          default: defaultValue, defaultType, index, nullable, primary, unique, precision, scale, length
        }} isEdit={isEditColumn} columnRule={setColumnRulePassed} />
      </Box>
    )
  }

  const purgeColumnEditCreate = () => {
    setColumnName("")
    setColumnType("boolean")
    setIsEditColumn(false)
    setEditColumnName("")
    defaultValue[1]("")
    defaultType[1]("value")
    unique[1](false)
    nullable[1](true)
    primary[1](false)
    autoIncrement[1](false)
    index[1](false)
  }

  const closeModal = () => {
    purgeColumnEditCreate()
    setShowColumnModal(false)
  }

  const createColumn = () => {
    const column: Column = {
      name: columnName,
      type: columnType,
      isProtected: false,
      default: defaultValue[0],
      defaultType: defaultType[0],
      autoIncrement: autoIncrement[0],
      index: index[0],
      nullable: nullable[0],
      primary: primary[0],
      unique: unique[0],
    }

    const tables = JSON.parse(JSON.stringify(schema.tables))
    tables[columnTableId].columns.push(column)
    const newSchema = { ...schema, tables }
    setSchema(newSchema)
    setLocalStorage({ "SCHEMA": JSON.stringify(newSchema) })
    purgeColumnEditCreate()
    setShowColumnModal(false)
  }

  const deleteColumn = async () => {
    setShowColumnModal(false)
    const tables = schema.tables
    const tableName = tables[columnTableId].name
    const { isConfirmed } = await Swal.fire({
      title: `Delete column ${editColumnName} in table ${tableName}?`,
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    })
    if (isConfirmed) {
      tables[columnTableId].columns = tables[columnTableId].columns.filter(c => c.name !== editColumnName)
      const newSchema = { ...schema, tables }
      setSchema(newSchema)
      setLocalStorage({ "SCHEMA": JSON.stringify(newSchema) })
      Swal.fire(
        'Deleted!',
        `Column ${editColumnName} in table ${tableName} has been deleted.`,
        'success'
      )
    }
    else {
      setShowColumnModal(true)
    }
  }

  const updateColumn = () => {
    const column: Column = {
      name: columnName,
      type: columnType,
      isProtected: false,
      default: defaultValue[0],
      defaultType: defaultType[0],
      autoIncrement: autoIncrement[0],
      index: index[0],
      nullable: nullable[0],
      primary: primary[0],
      unique: unique[0],
    }

    const tables = schema.tables
    tables[columnTableId].columns = tables[columnTableId].columns.map(c => {
      if (c.name === editColumnName) return column
      return c
    })
    const newSchema = { ...schema, tables }
    setSchema(newSchema)
    setLocalStorage({ "SCHEMA": JSON.stringify(newSchema) })
    setShowColumnModal(false)
  }

  const renderModalBtnGroup = () => {
    if (!isEditColumn) {
      return (
        <Box display={"flex"} justifyContent={"space-between"} width={"50%"}>
          <Button variant="contained" color="primary" disabled={disableSaveColumn} onClick={createColumn}>Create</Button>
          <Button variant="outlined" color="error" onClick={closeModal}>Cancel</Button>
        </Box>
      )
    }
    return (
      <Box display={"flex"} justifyContent={"space-between"} width={"65%"}>
        <Button variant="contained" color="primary" disabled={disableSaveColumn} onClick={updateColumn}>Save</Button>
        <Button variant="outlined" color="error" onClick={closeModal}>Cancel</Button>
        <Button variant="contained" color="error" onClick={deleteColumn}>Delete</Button>
      </Box>
    )
  }

  return (
    <div className={styles.root}>
      <Grid container spacing={4} justifyContent={"center"} >

        <Grid item xs={4} justifyContent={"center"} alignItems={"center"} alignContent={"center"} display={"flex"}>
          <div className={styles['new-table-container']} onClick={createNewTable}>
            <CreateNewFolderOutlined />
            <p>ADD NEW TABLE</p>
          </div>
        </Grid>

        {schema.tables?.map((t, i) => {
          return (
            t.isOpen
              ?
              <Grid item xs={4} >
                <div className={styles['table-container']}>
                  <div className={styles['table-header']} onClick={() => openCloseTable(i, !t.isOpen)}>
                    {renderTableHeader(t.name, i)}
                  </div>
                  <div className={styles['column-container']}>
                    <div className={styles['new-column-container']} onClick={e => {
                      purgeColumnEditCreate()
                      showColumnModalModal(i)
                    }} >
                      <AddCard sx={{ fontSize: "10px", marginLeft: "5px" }} />
                      <p>ADD NEW COLUMN</p>
                    </div>
                    {t.columns.map((c, j) => (
                      <div className={styles['column-item']} key={j}>
                        <p style={{ margin: 0 }}>{c.name} <i><b>({c.primary ? "PRIMARY" : c.type})</b></i></p>
                        <IconButton
                          size='small'
                          onClick={() => {
                            showEditColumnModal(i, c)
                          }}
                          edge="end"
                        >
                          {!c.isProtected && <Settings style={{ height: "12px", width: "12px" }} />}
                        </IconButton>
                      </div>
                    ))}
                  </div>
                </div>
              </Grid>
              :
              <Grid item container xs={4} justifyContent={"center"} alignItems={"center"}>
                <div className={`${styles['table-header']} ${styles.closed}`} onClick={() => openCloseTable(i, !t.isOpen)}>
                  {renderTableHeader(t.name, i)}
                </div>
              </Grid>
          )
        })}

      </Grid>

      <Modal open={showColumnModal} onClose={(e, reason) => {
        if (!reason || !['backdropClick', 'escapeKeyDown'].includes(reason)) {
          setShowColumnModal(false)
        }
      }}>
        <Box sx={modalStyle}>
          <Box display={"flex"} justifyContent={"start"} alignContent={"space-around"} alignItems={"center"} flexDirection={"column"}>
            {renderEditCreateColumn(schema.tables[columnTableId]?.name)}
            {renderModalBtnGroup()}
          </Box>
        </Box>
      </Modal>
    </div>
  )
}