import { Box, MenuItem, Select, Switch, TextField } from "@mui/material";
import styles from 'styles/Schema.module.scss'
import { ColumnState } from ".";
import { useEffect, useState } from "react";

export default function FloatConstructor(props: ColumnState) {
  const {
    default: defaultProp,
    defaultType: defaultTypeProp,
    unique: uniqueProp,
    nullable: nullableProp,
    autoIncrement: autoIncrementProp,
    index: indexProp,
    precision: precisionProp,
    scale: scaleProp
  } = props.column
  const [defaultValue, setDefaultValue] = defaultProp
  const [defaultType, setDefaultType] = defaultTypeProp
  const [unique, setUnique] = uniqueProp
  const [nullable, setNullable] = nullableProp
  const [index, setIndex] = indexProp
  const [precision, setPrecision] = precisionProp
  const [scale, setScale] = scaleProp

  const [haveDefault, setHaveDefault] = useState(false) // if have default then disable unique, auto increment and nullable

  useEffect(() => {
    if (!props.isEdit) {
      setDefaultValue("")
      setDefaultType("value")
      setNullable("true")
      setUnique("false")
      setIndex("false")
      // 123.45 has a precision of 5 and a scale of 2
      setPrecision(10)
      setScale(1)
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
      <Box display={"flex"} alignItems={"center"} marginY={"10px"} justifyContent={"flex-end"}>
        <Box display={"flex"} width={"80%"} justifyContent={"space-between"} alignItems={"center"}>
          <TextField value={defaultValue} variant="standard" type={'text'} onChange={e => setDefaultValue(e.target.value)} className={styles['input-label']} />
          <p>as</p>
          <Select
            variant="standard"
            value={defaultType}
            label="Column Type"
            onChange={e => { setDefaultType(e.target.value) }}
            sx={{ width: "75px" }}
          >
            <MenuItem value={"value"}>Value</MenuItem>
            <MenuItem value={"expression"}>Expression</MenuItem>
          </Select>
        </Box>
      </Box>
    )
    return (
      <>
        <Box display={"flex"} alignItems={"center"} marginY={"10px"}>
          <TextField className={styles['input-label']} value={"Unique"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
          <p>:</p>
          <Switch checked={unique} onClick={() => { setUnique(!unique) }} />
        </Box>
        <Box display={"flex"} alignItems={"center"} marginY={"10px"}>
          <TextField className={styles['input-label']} value={"Nullable"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
          <p>:</p>
          <Switch checked={nullable} onClick={() => { setNullable(!nullable) }} />
        </Box>
      </>
    )
  }

  return (
    <>
      <Box display={"flex"} alignItems={"center"} marginY={"10px"}>
        <TextField className={styles['input-label']} value={"Default"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
        <p>:</p>
        <Switch checked={haveDefault} onClick={changeDefault} />
      </Box>
      {renderRules()}
      <Box display={"flex"} alignItems={"center"} marginY={"10px"}>
        <TextField className={styles['input-label']} value={"Precision"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
        <p>:</p>
        <TextField className={styles['input']} value={precision} onChange={e => setPrecision(e.target.value)} variant="standard" type={"number"} InputProps={{ inputProps: { min: 3, max: 10 } }} />
      </Box>
      <Box display={"flex"} alignItems={"center"} marginY={"10px"}>
        <TextField className={styles['input-label']} value={"Scale"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
        <p>:</p>
        <TextField className={styles['input']} value={scale} onChange={e => setScale(e.target.value)} variant="standard" type={"number"} InputProps={{ inputProps: { min: 1, max: 3 } }} />
      </Box>
      <Box display={"flex"} alignItems={"center"} marginY={"10px"}>
        <TextField className={styles['input-label']} value={"Index"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
        <p>:</p>
        <Switch checked={index} onClick={() => { setIndex(!index) }} />
      </Box>
    </>
  )
}
