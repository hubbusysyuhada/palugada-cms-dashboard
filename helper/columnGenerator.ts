import { Column, Relation, Table } from "@/components/schema"
import _ from 'lodash'


export default class ColumnGenerator {
  private tableName?: string;
  private oppositeTable?: Table;
  private oppositeTableName?: string;
  private oppositeClassName?: string;
  private oppositeColumn?: Column;
  private columnRelation?: Relation;

  constructor(protected column: Column) { }

  public async autoincrement(returnPrimitive: boolean = false) {
    if (returnPrimitive) return 'number'
    return '' // still in development
  }

  public async uuid(returnPrimitive: boolean = false) {
    if (returnPrimitive) return 'string'
    return `    @orm.PrimaryKey({type: "uuid"})\n    ${this.column.name}: string${this.column.default ? ` = ${this.column.default}` : ''};`
  }

  public async boolean(returnPrimitive: boolean = false) {
    if (returnPrimitive) return 'boolean'
    return `    @orm.Property({ type: '${this.column.type}' })\n    ${this.column.name}: boolean = ${this.column.default};`
  }

  public async float(returnPrimitive: boolean = false) {
    if (returnPrimitive) return 'number'
    return `    @orm.Property('decimal', { precision: ${this.column.precision}, scale: ${this.column.scale}${this.column.unique && !this.column.default ? ', unique: true' : ''} })\n    ${this.column.name}${this.column.nullable && !this.column.default ? '?' : ''}: number${this.column.default ? ' = ' + this.column.default : ''};`
  }

  public async integer(returnPrimitive: boolean = false) {
    if (returnPrimitive) return 'number'
    return `    @orm.Property({ type: '${this.column.type}'${this.column.unique && !this.column.default ? ', unique: true' : ''}, index: ${this.column.index} })\n    ${this.column.name}${this.column.nullable && !this.column.default ? '?' : ''}: number${this.column.default ? ' = ' + this.column.default : ''};`
  }

  public async password(returnPrimitive: boolean = false) {
    if (returnPrimitive) return 'string'
    this.column.length = 255
    this.column.default = ''
    this.column.nullable = false
    this.column.unique = false
    this.column.index = false
    return await this.varchar(returnPrimitive)
  }

  public async text(returnPrimitive: boolean = false) {
    if (returnPrimitive) return 'string'
    return `    @orm.Property({ type: '${this.column.type}' })\n    ${this.column.name}?: string;`
  }

  public async timestamp(returnPrimitive: boolean = false) {
    if (returnPrimitive) return 'Date'
    return `    @orm.Property({ type: 'timestamp with timezone' })\n    ${this.column.name}${this.column.nullable && !this.column.default ? '?' : ''}: Date${this.column.default ? ' = ' + this.column.default : ''};`
  }

  public async tinytext(returnPrimitive: boolean = false) {
    return await this.text(returnPrimitive)
  }

  public async mediumtext(returnPrimitive: boolean = false) {
    return await this.text(returnPrimitive)
  }

  public async longtext(returnPrimitive: boolean = false) {
    return await this.text(returnPrimitive)
  }

  public async varchar(returnPrimitive: boolean = false) {
    return `    @orm.Property({ type: 'varchar', length: ${this.column.length}${this.column.unique && !this.column.default ? ', unique: true' : ''}, index: ${this.column.index} })\n    ${this.column.name}${this.column.nullable && !this.column.default ? '?' : ''}: string${this.column.default ? ' = ' + this.column.default : ''};`
  }

  public async relation(returnPrimitive: boolean = false, payload: { tables: Table[]; tableName: string } = { tables: [], tableName: '' }) {
    let result = ''
    if (this.column.relation) {
      const relationType = _.camelCase(this.column.relation?.relationType) as 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany'
      this.tableName = payload.tableName
      this.oppositeTable = payload.tables[this.column.relation.targetTable]
      this.oppositeTableName = this.oppositeTable.name
      this.oppositeClassName = _.upperFirst(_.camelCase(this.oppositeTableName))
      this.columnRelation = this.column.relation
      this.oppositeColumn = this.oppositeTable.columns[this.columnRelation.targetColumn]
      result = await this[relationType]()
    }
    return result
  }

  protected async oneToOne() {
    let params = ''
    if (this.columnRelation?.isOwner) {
      params = `() => ${this.oppositeClassName}, opposite_table => opposite_table.${this.oppositeColumn?.name}, { owner: true, onDelete: "${this.columnRelation?.onDelete}", onUpdateIntegrity: "${this.columnRelation?.onUpdate}" }`
    }
    else {
      params = `{entity: () => ${this.oppositeClassName}}`
    }
    return `    @orm.OneToOne(${params})\n    ${this.column.name}!: ${this.oppositeClassName};`
  }

  protected async oneToMany() {
    return `    @orm.OneToMany(() => ${this.oppositeClassName}, opposite_table => opposite_table.${this.oppositeColumn?.name})\n    ${this.column.name} = new orm.Collection<${this.oppositeClassName}>(this);`
  }

  protected async manyToOne() {
    return `    @orm.ManyToOne({ onDelete: "${this.columnRelation?.onDelete}", onUpdateIntegrity: "${this.columnRelation?.onUpdate}" })\n    ${this.column.name}!: ${this.oppositeClassName};`

  }

  protected async manyToMany() {
    const column1 = this.column.name
    const column2 = this.oppositeTable?.columns[this.columnRelation?.targetColumn as number].name
    const pivot = [column1, column2]
    pivot.sort()
    pivot.push('pivot')
    const pivotTable = pivot.join('_')
    let params = ''
    if (this.columnRelation?.isOwner) {
      params = `() => ${this.oppositeClassName}, '${this.oppositeColumn?.name}', { pivotTable: '${pivotTable}', entity: () => ${this.oppositeClassName} }`
    }
    else params = `{ pivotTable: '${pivotTable}' }`
    return `    @orm.ManyToMany(${params})\n    ${this.column.name} = new orm.Collection<${this.oppositeClassName}>(this);`
  }
}