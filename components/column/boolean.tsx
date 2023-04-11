import { Box, Switch, TextField } from "@mui/material";
import styles from 'styles/Schema.module.scss'
import { ColumnProps, ColumnState } from ".";
import { useEffect } from "react";

export default function BooleanConstructor(props: ColumnState) {
  const { default: defaultProp } = props.column
  const [defaultValue, setDefaultValue] = defaultProp

  useEffect(() => {
    if (!props.isEdit) {
      setDefaultValue("true")
    }
  }, [])

  return (
    <>
      <Box display={"flex"} alignItems={"center"} marginY={"10px"}>
        <TextField className={styles['input-label']} value={"Default"} variant="standard" type={'text'} InputProps={{ disableUnderline: true, readOnly: true }} />
        <p>:</p>
        <Switch checked={defaultValue === "true"} onClick={() => { setDefaultValue(defaultValue === 'true' ? 'false' : 'true') }} />
      </Box>
    </>
  )
}
