import { Column, DataType, SqlColumnProps } from '../schema';
import BooleanConstructor from './boolean';
import FloatConstructor from './float';
import IntegerConstructor from './integer';
import RelationConstructor from './relation';
import TextConstructor from './text';
import TimestampConstructor from './timestamp';
import VarcharConstructor from './varchar';


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
    case 'timestamp':
      return <TimestampConstructor column={props.column} isEdit={props.isEdit} columnRule={props.columnRule} />
      break;
    case 'tinytext':
    case 'mediumtext':
    case 'longtext':
      return <TextConstructor column={props.column} isEdit={props.isEdit} columnRule={props.columnRule} />
      break;
    case 'varchar':
      return <VarcharConstructor column={props.column} isEdit={props.isEdit} columnRule={props.columnRule} />
      break;
    case 'relation':
      return <RelationConstructor column={props.column} isEdit={props.isEdit} columnRule={props.columnRule} />
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