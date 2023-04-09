import { Column } from '../schema';
import BooleanConstructor from './boolean';

export default {
  boolean: BooleanConstructor,
  tinytext: BooleanConstructor,
  mediumtext: BooleanConstructor,
  longtext: BooleanConstructor,
  password: BooleanConstructor,
  integer: BooleanConstructor,
  float: BooleanConstructor,
}

export type ColumnProps = {
  tableName: string;
  column?: Column;
  isEdit?: boolean
}