import { Column } from "@/components/schema"


export default class ColumnGenerator {
  constructor(protected column: Column) { }

  public async autoincrement(returnPrimitive?: boolean) {
    if (returnPrimitive) return 'number'
    return 'autoincrement'
  }

  public async uuid(returnPrimitive?: boolean) {
    if (returnPrimitive) return 'string'
    const type = this.column.primary ? 'PrimaryGeneratedColumn' : 'Generated'
    return `    @orm.${type}('uuid')\n    ${this.column.name}: string;`
  }

  public async boolean(returnPrimitive?: boolean) {
    if (returnPrimitive) return 'boolean'
    return `    @orm.Column({ type: '${this.column.type}' })\n    ${this.column.name}: boolean = ${this.column.default == 'true'};`
  }

  public async float(returnPrimitive?: boolean) {
    if (returnPrimitive) return 'number'
    return `    @orm.Column('decimal', { precision: ${this.column.precision}, scale: ${this.column.scale}${this.column.unique && !this.column.default ? ', unique: true' : ''} })\n    ${this.column.name}${this.column.nullable && !this.column.default ? '?' : ''}: number${this.column.default ? ' = ' + this.column.default : ''};`
  }

  public async integer(returnPrimitive?: boolean) {
    if (returnPrimitive) return 'number'
    return `    @orm.Column({ type: '${this.column.type}'${this.column.unique && !this.column.default ? ', unique: true' : ''} })\n    ${this.column.name}${this.column.nullable && !this.column.default ? '?' : ''}: number${this.column.default ? ' = ' + this.column.default : ''};`
  }

  public async password(returnPrimitive?: boolean) {
    if (returnPrimitive) return 'string'
    return await this.text(returnPrimitive, 'mediumtext')
  }

  public async text(returnPrimitive?: boolean, columnType?: string,) {
    if (returnPrimitive) return 'string'
    return `    @orm.Column({ type: '${columnType}' })\n    ${this.column.name}${this.column.nullable && !this.column.default ? '?' : ''}: string${this.column.default ? ' = ' + this.column.default : ''};`
  }

  public async timestamp(returnPrimitive?: boolean) {
    if (returnPrimitive) return 'Date'
    return `    @orm.Column({ type: '${this.column.type}' })\n    ${this.column.name}${this.column.nullable && !this.column.default ? '?' : ''}: Date${this.column.default ? ' = ' + this.column.default : ''};`
  }

  public async tinytext(returnPrimitive?: boolean) {
    return await this.text(returnPrimitive)
  }

  public async mediumtext(returnPrimitive?: boolean) {
    return await this.text(returnPrimitive)
  }

  public async longtext(returnPrimitive?: boolean) {
    return await this.text(returnPrimitive)
  }

  public async varchar(returnPrimitive?: boolean) {
    return `    @orm.Column({ type: 'varchar', length: '${this.column.length}'${this.column.unique && !this.column.default ? ', unique: true' : ''} })\n    ${this.column.name}${this.column.nullable && !this.column.default ? '?' : ''}: string${this.column.default ? ' = ' + this.column.default : ''};`
  }
}