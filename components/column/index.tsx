import { Column, DataType, Relation, SqlColumnProps } from '../schema';
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
      return <BooleanConstructor column={props.column} isEdit={props.isEdit} columnRule={props.columnRule} tableIndex={props.tableIndex} />
      break;
    case 'integer':
      return <IntegerConstructor column={props.column} isEdit={props.isEdit} columnRule={props.columnRule} tableIndex={props.tableIndex} />
      break;
    case 'float':
      return <FloatConstructor column={props.column} isEdit={props.isEdit} columnRule={props.columnRule} tableIndex={props.tableIndex} />
      break;
    case 'timestamp':
      return <TimestampConstructor column={props.column} isEdit={props.isEdit} columnRule={props.columnRule} tableIndex={props.tableIndex} />
      break;
    case 'tinytext':
    case 'mediumtext':
    case 'longtext':
      return <TextConstructor column={props.column} isEdit={props.isEdit} columnRule={props.columnRule} tableIndex={props.tableIndex} />
      break;
    case 'varchar':
      return <VarcharConstructor column={props.column} isEdit={props.isEdit} columnRule={props.columnRule} tableIndex={props.tableIndex} />
      break;
    case 'relation':
      return <RelationConstructor column={props.column} isEdit={props.isEdit} columnRule={props.columnRule} tableIndex={props.tableIndex} relationProps={props.relationProps} />
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
  type: DataType;
} & ColumnState & RelationColumnProps

export type RelationPropsKey = 'onUpdate' | 'onDelete' | 'targetTable' | 'collectionColumn' | 'relationType'

export type ColumnState = {
  column: ColumnBaseType;
  isEdit?: boolean;
  columnRule: React.Dispatch<React.SetStateAction<boolean>>;
  tableIndex: number;
};

export type RelationColumnState = ColumnState & RelationColumnProps

export type RelationColumnProps = {
  relationProps: Record<RelationPropsKey, [any, React.Dispatch<React.SetStateAction<any>>]>
}

export type ColumnBaseType = Record<SqlColumnProps, [any, React.Dispatch<React.SetStateAction<any>>]> & { relation: Relation }