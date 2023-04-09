import { debounce } from "@/helper/debounce";
import makeKey from "@/helper/makeKey";
import setLocalStorage from "@/helper/setLocalStorage";
import { AddCard, CreateNewFolderOutlined, Delete, KeyboardArrowDown, KeyboardArrowUp, Settings } from "@mui/icons-material";
import { Box, Button, Grid, IconButton, MenuItem, Modal, Select, TextField, Typography, } from "@mui/material";
import React, { useEffect, useState } from "react"
import styles from 'styles/Schema.module.scss'
import Swal from "sweetalert2";
import _ from 'lodash'
import column from "./column";

type DataType = "tinytext" | "mediumtext" | "longtext" | "password" | "integer" | "float" | "boolean"

export type Column = {
  name: string;
  type: DataType;
  default?: any;
  defaultType?: "expression" | "value";
  unique?: boolean;
  nullable?: boolean;
  primary?: boolean;
  autoIncrement?: boolean;
  index?: boolean;

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
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #08011b',
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
};

export default function Schema() {
  const [schema, setSchema] = useState<Schema>({ tables: [] })
  const [showCreateColumn, setShowCreateColumn] = useState(false)
  const [createColumnTableId, setCreateColumnTableId] = useState(0)
  const [newColumnName, setNewColumnName] = useState("")
  const [newColumnType, setNewColumnType] = useState<DataType>("boolean")

  useEffect(() => {
    const initialState: Schema = {
      tables: [
        {
          name: "user",
          columns: [
            {
              name: "id",
              type: "tinytext",
              default: "UUID()",
              defaultType: "expression",
              primary: true,
              isProtected: true
            },
            {
              name: "external_id",
              type: "tinytext",
              unique: true,
              index: true,
              isProtected: true
            },
            {
              name: "password",
              type: "password",
              isProtected: true
            }
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
          type: "tinytext",
          default: "UUID()",
          defaultType: "expression",
          primary: true,
          isProtected: true
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
        <TextField value={tableName} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: schema.tables[index].isProtected, style: { color: "#dbdbdb" } }} onChange={e => { renameTable(e.target.value, index) }} onClick={e => e.stopPropagation()} error={!!errorMsg} label={errorMsg} />
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

  const showCreateColumnModal = (tableIndex: number) => {
    setShowCreateColumn(true)
    setCreateColumnTableId(tableIndex)
  }

  const renderCreateColumn = (tableName: string) => {
    return (
      <Box>
        <Box display={"flex"} alignItems={"center"} marginY={"10px"}>
          <TextField className={styles['input-label']} value={"Name"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
          <p>:</p>
          <TextField className={styles.input} placeholder="Column Name" value={newColumnName} variant="standard" type={'text'} InputProps={{ disableUnderline: false }} onChange={e => { setNewColumnName(e.target.value) }} />
        </Box>
        <Box display={"flex"} alignItems={"center"} marginY={"10px"}>
          <TextField className={styles['input-label']} value={"Column Type"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
          <p>:</p>
          <Select

            className={styles['input']}
            variant="standard"
            value={newColumnType}
            label="Column Type"
            onChange={e => setNewColumnType(e.target.value as DataType)}
          >
            <MenuItem value={"boolean"}>Boolean</MenuItem>
            <MenuItem value={"integer"}>Integer</MenuItem>
            <MenuItem value={"float"}>Float</MenuItem>
          </Select>
        </Box>
        {/* {column[type].renderForm({ tableName })} */}
      </Box>
    )
  }

  const cancelCreateColumn = () => {
    setNewColumnName("")
    setShowCreateColumn(false)
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
                    <div className={styles['new-column-container']} onClick={e => showCreateColumnModal(i)} >
                      <AddCard sx={{ fontSize: "10px", marginLeft: "5px" }} />
                      <p>ADD NEW COLUMN</p>
                    </div>
                    {t.columns.map((c, i) => (
                      <div className={styles['column-item']}>
                        <p style={{ margin: 0 }}>{c.name} <i><b>({c.primary ? "PRIMARY" : c.type})</b></i></p>
                        <IconButton
                          size='small'
                          onClick={() => { }}
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

      <Modal open={showCreateColumn} onClose={(e, reason) => {
        if (!reason || !['backdropClick', 'escapeKeyDown'].includes(reason)) {
          setShowCreateColumn(false)
        }
      }}>
        <Box sx={modalStyle}>
          <Box display={"flex"} justifyContent={"start"} alignContent={"center"} alignItems={"center"} flexDirection={"column"}>
            {renderCreateColumn(schema.tables[createColumnTableId]?.name)}
            <Box display={"flex"} justifyContent={"space-between"} width={"50%"}>
              <Button variant="contained" color="primary">Create</Button>
              <Button variant="outlined" color="error" onClick={cancelCreateColumn}>Cancel</Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </div>
  )
}