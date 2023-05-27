import { Box, MenuItem, Select, Switch, TextField } from "@mui/material";
import styles from 'styles/Schema.module.scss'
import { RelationColumnState } from ".";
import { useEffect, useState } from "react";
import { Schema } from "../schema";

export type FKActionType = 'CASCADE' | 'SET NULL' | 'NO ACTION'
export type RelationType = 'One to One' | 'One to Many' | 'Many to Many'

export default function RelationConstructor(props: RelationColumnState) {
  const {
    onDelete: [onDelete, setOnDelete],
    onUpdate: [onUpdate, setOnUpdate],
    targetTable: [secondTable, setSecondTable],
    collectionColumn: [oppositeName, setOppositeName],
    relationType: [relationType, setRelationType],
  } = props.relationProps

  const parsedSchema: Schema = JSON.parse(localStorage.getItem('SCHEMA') || '{ tables: [] }')
  const fkActions: FKActionType[] = ['CASCADE', 'SET NULL', 'NO ACTION']
  const [createOppositeColumn, setCreateOppositeColumn] = useState(true)
  const [isOppositeColumnError, setIsOppositeColumnError] = useState(false)
  const [oppositeErrorMessage, setOppositeErrorMessage] = useState('')

  const [originalOppositeName, setOriginalOppositeName] = useState('')

  useEffect(() => {
    if (props.isEdit) {
      const { relation } = props.column
      const isHavingOppositeColumn = !!props.column.relation.targetColumn
      setSecondTable(relation.targetTable)

      if (isHavingOppositeColumn) {
        const oppositeTable = parsedSchema.tables[relation.targetTable]
        const oppositeColumn = oppositeTable.columns[relation.targetColumn]
        setOppositeName(oppositeColumn.name)
        setOriginalOppositeName(oppositeColumn.name)
      } else {
        setCreateOppositeColumn(false)
      }
    }
  }, [])

  useEffect(() => {
    if (secondTable || secondTable === 0) {
      const targetTableColumns = parsedSchema.tables[secondTable].columns.map(c => c.name)
      const condition1 = createOppositeColumn ? !!oppositeName : !createOppositeColumn // check if oppositeName is given when creating opposite column
      const condition2 = !targetTableColumns?.includes(oppositeName) || (props.isEdit && oppositeName === originalOppositeName)
      if (condition1 && condition2) props.columnRule(true)
      else props.columnRule(false)

      if (!condition2) {
        setIsOppositeColumnError(true)
        setOppositeErrorMessage(`${oppositeName} already exist in ${parsedSchema.tables[secondTable].name}`)
      } else {
        setIsOppositeColumnError(false)
        setOppositeErrorMessage('')
      }

      if (!createOppositeColumn) setOppositeName('')
    }
    else props.columnRule(false)
  }, [createOppositeColumn, oppositeName, secondTable])

  const renderFKRules = () => {
    return <>
      <Box display={"flex"} alignItems={"center"} marginY={"10px"} width={"70%"} justifyContent={"space-between"}>
        <TextField className={styles['input-label']} value={"On Update"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
        <p>:</p>
        <Select
          className={styles['input']}
          variant="standard"
          value={onUpdate}
          onChange={e => setOnUpdate(e.target.value as FKActionType)}
          disabled={props.isEdit}
        >
          {fkActions.map((v, i) => <MenuItem key={i} value={v}>{v}</MenuItem>)}
        </Select>
      </Box>
      <Box display={"flex"} alignItems={"center"} marginY={"10px"} width={"70%"} justifyContent={"space-between"}>
        <TextField className={styles['input-label']} value={"On Delete"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
        <p>:</p>
        <Select
          className={styles['input']}
          variant="standard"
          value={onDelete}
          onChange={e => setOnDelete(e.target.value as FKActionType)}
          disabled={props.isEdit}
        >
          {fkActions.map((v, i) => <MenuItem key={i} value={v}>{v}</MenuItem>)}
        </Select>
      </Box>
    </>
  }

  const renderRelationsType = () => {
    switch (relationType) {
      case 'One to One':
        return <>
          <Box display={"flex"} alignItems={"center"} marginY={"10px"} width={"70%"} justifyContent={"space-between"}>
            <TextField className={styles['input-label']} value={"One"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
            <p>:</p>
            <TextField className={styles['input-label']} value={parsedSchema.tables[props.tableIndex].name} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
          </Box>
          <Box display={"flex"} alignItems={"center"} marginY={"10px"} width={"70%"} justifyContent={"space-between"}>
            <TextField className={styles['input-label']} value={"Inversed Table"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
            <p>:</p>
            <Select
              className={styles['input']}
              variant="standard"
              value={secondTable}
              label="Column Type"
              onChange={e => setSecondTable(+(e.target.value))}
              MenuProps={{ style: { maxHeight: "250px" } }}
              disabled={props.isEdit}
            >
              {parsedSchema.tables.map((t, i) => t.name !== parsedSchema.tables[props.tableIndex].name && <MenuItem key={i} value={i}>{t.name}</MenuItem>)}
            </Select>
          </Box>
          <Box display={"flex"} alignItems={"center"} marginY={"10px"} width={"70%"} justifyContent={"space-between"}>
            <TextField className={styles['input-label']} value={"Inversed Column"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
            <p>:</p>
            <TextField className={styles.input} placeholder="Inversed Column" value={oppositeName} variant="standard" type={'text'} InputProps={{ disableUnderline: false }} onChange={e => { setOppositeName(e.target.value.toLowerCase().replaceAll(' ', '_')) }} label={oppositeErrorMessage} error={isOppositeColumnError} disabled={props.isEdit} />
          </Box>
          {renderFKRules()}
        </>
      case 'One to Many':
        return <>
          <Box display={"flex"} alignItems={"center"} marginY={"10px"} width={"70%"} justifyContent={"space-between"}>
            <TextField className={styles['input-label']} value={"Table"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
            <p>:</p>
            <Select
              className={styles['input']}
              variant="standard"
              value={secondTable}
              label="Column Type"
              onChange={e => setSecondTable(+(e.target.value))}
              MenuProps={{ style: { maxHeight: "250px" } }}
              disabled={props.isEdit}
            >
              {parsedSchema.tables.map((t, i) => t.name !== parsedSchema.tables[props.tableIndex].name && <MenuItem key={i} value={i}>{t.name}</MenuItem>)}
            </Select>
          </Box>
          <Box display={"flex"} alignItems={"center"} marginY={"10px"} width={"70%"} justifyContent={"space-between"}>
            <TextField className={styles['input-label']} value={"Has Many"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
            <p>:</p>
            <TextField className={styles['input-label']} value={parsedSchema.tables[props.tableIndex].name} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
          </Box>
          <Box display={"flex"} alignItems={"center"} marginY={"10px"} width={"70%"} justifyContent={"space-between"}>
            <TextField className={styles['input-label']} value={"Collection Column"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
            <p>:</p>
            <div className={styles['input']}>
              <Switch checked={createOppositeColumn} onClick={() => { !props.isEdit && setCreateOppositeColumn(!createOppositeColumn) }} />
            </div>
          </Box>
          {
            createOppositeColumn
            &&
            <Box display={"flex"} alignItems={"center"} marginY={"10px"} width={"70%"} justifyContent={"space-between"}>
              <TextField className={styles['input-label']} value={"Collection Name"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
              <p>:</p>
              <TextField className={styles.input} placeholder="Collection Name" value={oppositeName} variant="standard" type={'text'} InputProps={{ disableUnderline: false }} onChange={e => { setOppositeName(e.target.value.toLowerCase().replaceAll(' ', '_')) }} label={oppositeErrorMessage} error={isOppositeColumnError} disabled={props.isEdit} />
            </Box>
          }
          {renderFKRules()}
        </>
      case 'Many to Many':
        return <>
          <Box display={"flex"} alignItems={"center"} marginY={"10px"} width={"70%"} justifyContent={"space-between"}>
            <TextField className={styles['input-label']} value={"Many"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
            <p>:</p>
            <TextField className={styles['input-label']} value={parsedSchema.tables[props.tableIndex].name} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
          </Box>
          <Box display={"flex"} alignItems={"center"} marginY={"10px"} width={"70%"} justifyContent={"space-between"}>
            <TextField className={styles['input-label']} value={"Has Many"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
            <p>:</p>
            <Select
              className={styles['input']}
              variant="standard"
              value={secondTable}
              label="Column Type"
              onChange={e => setSecondTable(+(e.target.value))}
              MenuProps={{ style: { maxHeight: "250px" } }}
              disabled={props.isEdit}
            >
              {parsedSchema.tables.map((t, i) => t.name !== parsedSchema.tables[props.tableIndex].name && <MenuItem key={i} value={i}>{t.name}</MenuItem>)}
            </Select>
          </Box>
          <Box display={"flex"} alignItems={"center"} marginY={"10px"} width={"70%"} justifyContent={"space-between"}>
            <TextField className={styles['input-label']} value={"Collection Name"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
            <p>:</p>
            <TextField className={styles.input} placeholder="Collection Name" value={oppositeName} variant="standard" type={'text'} InputProps={{ disableUnderline: false }} onChange={e => { setOppositeName(e.target.value.toLowerCase().replaceAll(' ', '_')) }} label={oppositeErrorMessage} error={isOppositeColumnError} disabled={props.isEdit} />
          </Box>
          {renderFKRules()}
        </>
    }
    return (
      <>
      </>
    )
  }

  return (
    <>
      <Box display={"flex"} alignItems={"center"} marginY={"10px"} width={"70%"} justifyContent={"space-between"}>
        <TextField className={styles['input-label']} value={"Relation Type"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
        <p>:</p>
        <Select
          className={styles['input']}
          variant="standard"
          value={relationType}
          label="Column Type"
          onChange={e => { setRelationType(e.target.value) }}
          disabled={props.isEdit}
        >
          <MenuItem value={"One to One"}>One to One</MenuItem>
          <MenuItem value={"One to Many"}>One to Many</MenuItem>
          <MenuItem value={"Many to Many"}>Many to Many</MenuItem>
        </Select>
      </Box>
      {renderRelationsType()}
    </>
  )
}
