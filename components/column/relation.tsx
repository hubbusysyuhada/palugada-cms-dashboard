import { Box, MenuItem, Select, Switch, TextField } from "@mui/material";
import styles from 'styles/Schema.module.scss'
import { ColumnState } from ".";
import { useEffect, useState } from "react";

export default function RelationConstructor(props: ColumnState) {
  const {
    default: defaultProp,
    defaultType: defaultTypeProp,
    unique: uniqueProp,
    nullable: nullableProp,
    index: indexProp
  } = props.column
  const [defaultValue, setDefaultValue] = defaultProp
  const [defaultType, setDefaultType] = defaultTypeProp
  const [unique, setUnique] = uniqueProp
  const [nullable, setNullable] = nullableProp
  const [index, setIndex] = indexProp

  const [haveDefault, setHaveDefault] = useState(false) // if have default then disable unique, auto increment and nullable

  useEffect(() => {
    if (!props.isEdit) {
      setDefaultValue("")
      setDefaultType("value")
      setNullable("true")
      setUnique("false")
      setIndex("false")
    }
    if (defaultValue) {
      setHaveDefault(true)
    }
  }, [])

  useEffect(() => {
    if (haveDefault && !defaultValue) props.columnRule(false)
    else props.columnRule(true)
  }, [defaultValue, haveDefault])

  const changeDefault = () => {
    if (!haveDefault) {
      setNullable("false")
      setUnique("false")
    }
    else {
      setDefaultType("value")
      setDefaultValue("")
    }
    setHaveDefault(!haveDefault)
  }

  const renderRules = () => {
    if (haveDefault) return (
      <Box display={"flex"} alignItems={"center"} marginY={"10px"} width={"50%"} justifyContent={"flex-end"}>
        <Box display={"flex"} width={"100%"} justifyContent={"space-between"} alignItems={"center"}>
          <TextField value={defaultValue} variant="standard" type={'text'} onChange={e => setDefaultValue(e.target.value)} sx={{ marginRight: "20px", width: "200px" }} />
          <p>as</p>
          <Select
            variant="standard"
            value={defaultType}
            label="Column Type"
            onChange={e => { setDefaultType(e.target.value) }}
            sx={{ width: "75px", marginLeft: "20px" }}
            disabled={true}
          >
            <MenuItem value={"value"}>Value</MenuItem>
            <MenuItem value={"expression"}>Expression</MenuItem>
          </Select>
        </Box>
      </Box>
    )
    return (
      <>
        <Box display={"flex"} alignItems={"center"} marginY={"10px"} width={"70%"} justifyContent={"space-between"}>
          <TextField className={styles['input-label']} value={"Unique"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
          <p>:</p>
          <div className={styles['input']}>
            <Switch checked={unique} onClick={() => { setUnique(!unique) }} />
          </div>
        </Box>
        <Box display={"flex"} alignItems={"center"} marginY={"10px"} width={"70%"} justifyContent={"space-between"}>
          <TextField className={styles['input-label']} value={"Nullable"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
          <p>:</p>
          <div className={styles['input']}>
            <Switch checked={nullable} onClick={() => { setNullable(!nullable) }} />
          </div>
        </Box>
      </>
    )
  }

  return (
    <>
      <Box display={"flex"} alignItems={"center"} marginY={"10px"} width={"70%"} justifyContent={"space-between"}>
        <TextField className={styles['input-label']} value={"One"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
        <p>:</p>
        <Select
          className={styles['input']}
          variant="standard"
          value={''}
          label="Column Type"
          onChange={e => {}}
        >
          <MenuItem value={"boolean"}>Boolean</MenuItem>
          <MenuItem value={"integer"}>Integer</MenuItem>
          <MenuItem value={"float"}>Float</MenuItem>
          <MenuItem value={"varchar"}>Variable Character</MenuItem>
          <MenuItem value={"tinytext"}>Tinytext</MenuItem>
          <MenuItem value={"mediumtext"}>Mediumtext</MenuItem>
          <MenuItem value={"longtext"}>Longtext</MenuItem>
          <MenuItem value={"timestamp"}>Timestamp</MenuItem>
          <MenuItem value={"relation"}>Relation</MenuItem>
        </Select>
      </Box>
      <Box display={"flex"} alignItems={"center"} marginY={"10px"} width={"70%"} justifyContent={"space-between"}>
        <TextField className={styles['input-label']} value={"Has Many"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
        <p>:</p>
        <Select
          className={styles['input']}
          variant="standard"
          value={''}
          label="Column Type"
          onChange={e => {}}
        >
          <MenuItem value={"boolean"}>Boolean</MenuItem>
          <MenuItem value={"integer"}>Integer</MenuItem>
          <MenuItem value={"float"}>Float</MenuItem>
          <MenuItem value={"varchar"}>Variable Character</MenuItem>
          <MenuItem value={"tinytext"}>Tinytext</MenuItem>
          <MenuItem value={"mediumtext"}>Mediumtext</MenuItem>
          <MenuItem value={"longtext"}>Longtext</MenuItem>
          <MenuItem value={"timestamp"}>Timestamp</MenuItem>
          <MenuItem value={"relation"}>Relation</MenuItem>
        </Select>
      </Box>
    </>
  )
}
