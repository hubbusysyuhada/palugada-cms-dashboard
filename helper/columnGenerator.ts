import { Column } from "@/components/schema"


export default class ColumnGenerator {
  constructor(protected column: Column) { }

  public async autoincrement(returnPrimitive?: boolean) {
    if (returnPrimitive) return 'number'
    return '' // still in development
  }

  public async uuid(returnPrimitive?: boolean) {
    if (returnPrimitive) return 'string'
    return `    @orm.PrimaryKey({type: "uuid"})\n    ${this.column.name}: string${this.column.default ? ` = ${this.column.default}`: ''};`
  }

  public async boolean(returnPrimitive?: boolean) {
    if (returnPrimitive) return 'boolean'
    return `    @orm.Property({ type: '${this.column.type}' })\n    ${this.column.name}: boolean = ${this.column.default == 'true'};`
  }

  public async float(returnPrimitive?: boolean) {
    if (returnPrimitive) return 'number'
    return `    @orm.Property('decimal', { precision: ${this.column.precision}, scale: ${this.column.scale}${this.column.unique && !this.column.default ? ', unique: true' : ''} })\n    ${this.column.name}${this.column.nullable && !this.column.default ? '?' : ''}: number${this.column.default ? ' = ' + this.column.default : ''};`
  }

  public async integer(returnPrimitive?: boolean) {
    if (returnPrimitive) return 'number'
    return `    @orm.Property({ type: '${this.column.type}'${this.column.unique && !this.column.default ? ', unique: true' : ''} })\n    ${this.column.name}${this.column.nullable && !this.column.default ? '?' : ''}: number${this.column.default ? ' = ' + this.column.default : ''};`
  }

  public async password(returnPrimitive?: boolean) {
    if (returnPrimitive) return 'string'
    this.column.length = 255
    this.column.default = ''
    this.column.nullable = false
    this.column.unique = false
    return await this.varchar(returnPrimitive)
  }

  public async text(returnPrimitive?: boolean) {
    if (returnPrimitive) return 'string'
    return `    @orm.Property({ type: '${this.column.type}' })\n    ${this.column.name}?: string;`
  }

  public async timestamp(returnPrimitive?: boolean) {
    if (returnPrimitive) return 'Date'
    return `    @orm.Property({ type: 'timestamp with timezone' })\n    ${this.column.name}${this.column.nullable && !this.column.default ? '?' : ''}: Date${this.column.default ? ' = ' + this.column.default : ''};`
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
    return `    @orm.Property({ type: 'varchar', length: ${this.column.length}${this.column.unique && !this.column.default ? ', unique: true' : ''} })\n    ${this.column.name}${this.column.nullable && !this.column.default ? '?' : ''}: string${this.column.default ? ' = ' + this.column.default : ''};`
  }

  public async relation(returnPrimitive?: boolean) {
    return ''
    // return `    @orm.Property({ type: 'varchar', length: '${this.column.length}'${this.column.unique && !this.column.default ? ', unique: true' : ''} })\n    ${this.column.name}${this.column.nullable && !this.column.default ? '?' : ''}: string${this.column.default ? ' = ' + this.column.default : ''};`
  }
}