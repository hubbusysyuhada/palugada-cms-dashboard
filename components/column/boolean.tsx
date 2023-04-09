import { TextField } from "@mui/material";
import styles from 'styles/Schema.module.scss'
import { ColumnProps } from ".";

type BooleanColumn = {
  name: string;
  type: 'boolean';
  default: boolean;
  index?: boolean;

  isProtected?: boolean;
  error?: string
}

class BooleanConstructor {
  public static renderForm(props: ColumnProps) {
    const { tableName } = props
    // <TextField className={styles.input} disabled={false} value={""} variant="standard" type={'text'} InputProps={{ disableUnderline: false }} onChange={e => { }} error label={"FOO"} />
    return (
      <>
        <h1>hi {tableName}</h1>
      </>
    )
  }
}

export default BooleanConstructor