import { Column, DataType, SqlColumnProps } from '../schema';
// export {default as boolean} from './boolean'
// export {default as integer} from './integer'
import BooleanConstructor from './boolean';
import FloatConstructor from './float';
import IntegerConstructor from './integer';


export default function ColumnConstructor(props: ColumnProps) {
  switch (props.type) {
    case 'boolean':
      return <BooleanConstructor column={props.column} isEdit={props.isEdit} columnRule={props.columnRule} />
      break;
    case 'integer':
      return <IntegerConstructor column={props.column} isEdit={props.isEdit} columnRule={props.columnRule} />
      break;
    case 'float':
      return <FloatConstructor column={props.column} isEdit={props.isEdit} columnRule={props.columnRule} />
      break;
    default:
      return (
        <>
        </>
      )
      break;
  }
}


export type ColumnProps = {
  tableName: string;
  type: DataType;
} & ColumnState

export type ColumnState = {
  column: Record<SqlColumnProps, [any, React.Dispatch<React.SetStateAction<any>>]>;
  isEdit?: boolean;
  columnRule: React.Dispatch<React.SetStateAction<boolean>>;
};