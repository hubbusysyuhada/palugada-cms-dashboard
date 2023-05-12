import { EnvObj } from "@/components/env";
import { Column, Schema, Table } from "@/components/schema";
import { RequestBody } from "@/pages/api/generate";
import fs from 'fs'
import { zip } from 'zip-a-folder';
import _ from 'lodash'
import ColumnGenerator from "./columnGenerator";
import path from "path";

export default class ServerGenerator {
  protected env: EnvObj[]
  protected schema: Schema
  protected dirr = '/tmp/mandoor-generated-server'
  protected zipPath = '/tmp/mandoor-generated-server.zip'
  protected templatePath = path.join(process.cwd(), 'template')

  constructor(body: RequestBody) {
    this.env = body.env
    this.schema = body.schema
  }

  public async generateServer() {
    await this.makeDirectory()
    await this.generateEnv()

    await this.generateRootFiles()
    await this.generateMiddlewares()
    await this.generateDatabaseEntity()
    await this.generateHandler()
    await this.generateRoutes()

    await this.compileFile()
  }

  protected async generateHandler() {
    this.makeDirectory(`${this.dirr}/handlers`)
    const tables = this.schema.tables.filter(t => t.name !== 'user')
    const userTemplates = fs.readFileSync(this.templatePath + '/handlers/UserHandler.ts.txt', { encoding: "utf-8" })
    const template = fs.readFileSync(this.templatePath + '/handlers/ModelHandler.ts.txt', { encoding: "utf-8" })
    fs.writeFileSync(`${this.dirr}/handlers/UserHandler.ts`, userTemplates)

    tables.forEach(async (t) => {
      const id = t.columns.find(c => c.name === 'id') as Column
      const ID_TYPE = await new ColumnGenerator(id)[id.type](true)

      const MODEL = _.upperFirst(_.camelCase(t.name))
      fs.writeFileSync(`${this.dirr}/handlers/${MODEL}Handler.ts`, this.parseFileContent({ MODEL, ID_TYPE }, template), { encoding: 'utf-8' })
    })
  }

  protected async generateRoutes() {
    this.makeDirectory(`${this.dirr}/routes`)
    const tables = this.schema.tables.filter(t => t.name !== 'user').map(v => v.name)
    const userTemplates = fs.readFileSync(this.templatePath + '/routes/userRoute.ts.txt', { encoding: "utf-8" })
    const indexTemplate = fs.readFileSync(this.templatePath + '/routes/index.ts.txt', { encoding: "utf-8" })
    const template = fs.readFileSync(this.templatePath + '/routes/modelRoute.ts.txt', { encoding: "utf-8" })
    fs.writeFileSync(`${this.dirr}/routes/userRoute.ts`, userTemplates)

    const imports: string[] = []
    const routeRegister: string[] = [`server.register(userRoute)`]

    tables.forEach(t => {
      const name = _.camelCase(t)
      imports.push(`import ${name}Route from "./${name}Route";`)
      routeRegister.push(`  server.register(${name}Route, {prefix: '${t}'})`)
      const params = {
        MODEL_HANDLER: `${_.upperFirst(name)}Handler`,
        ROUTE_NAME: `${name}Route`,
      }
      fs.writeFileSync(`${this.dirr}/routes/${name}Route.ts`, this.parseFileContent(params, template), { encoding: 'utf-8' })
    })
    const IMPORTED_ROUTES = imports.join('\n')
    const ROUTES = routeRegister.join('\n')
    fs.writeFileSync(`${this.dirr}/routes/index.ts`, this.parseFileContent({ IMPORTED_ROUTES, ROUTES }, indexTemplate), { encoding: 'utf-8' })
  }

  protected async generateMiddlewares() {
    this.makeDirectory(`${this.dirr}/middleware`)
    const templates = fs.readdirSync(this.templatePath + '/middleware', { withFileTypes: true })
    templates.forEach(f => {
      const { name } = f
      const file = fs.readFileSync(`${this.templatePath}/middleware/${name}`, { encoding: "utf-8" })
      const path = `${this.dirr}/middleware/${name.slice(0, -4)}`
      fs.writeFileSync(path, file)
    })
  }

  public getFileStream() {
    return fs.createReadStream(this.zipPath)
  }

  protected async generateRootFiles() {
    const templates = fs.readdirSync(this.templatePath, { withFileTypes: true })

    templates.forEach(f => {
      const { name } = f
      if (f.isFile()) {
        const file = fs.readFileSync(`${this.templatePath}/${name}`, { encoding: "utf-8" })
        const path = `${this.dirr}/${name.slice(0, -4)}`
        if (name === 'index.ts.txt') {
          const userColumns = this.schema.tables[0].columns
          const columnType = {
            "varchar": "varchar",
            "tinytext": "string",
            "mediumtext": "string",
            "longtext": "string",
            "password": "string",
            "integer": "number",
            "float": "number",
            "boolean": "boolean",
            "timestamp": "Date",
            "uuid": "string",
            "autoincrement": "number",
          }

          const USER = `{\n${userColumns.filter(c => c.type !== 'password').map(c => `  ${c.name}: ${columnType[c.type]};\n`).join('')}}`

          fs.writeFileSync(path, this.parseFileContent({ USER }, file))
        }
        else {
          fs.writeFileSync(path, file)
        }
      }
    })
    const jsonFile = { schema: this.schema }
    fs.writeFileSync(`${this.dirr}/schema-metadata.json`, JSON.stringify(jsonFile, null, 2), { "encoding": "utf-8" })
  }

  protected async generateDatabaseEntity() {
    this.makeDirectory(`${this.dirr}/database`)
    let IMPORT = ''
    const tables = this.schema.tables
    const ENTITIES = `[${(await Promise.all(tables.map(async table => {
      const className = _.upperFirst(_.camelCase(table.name))
      IMPORT += `import { ${className} } from "./entity/${className}"\n`
      await this.generateModelEntities(table)
      return className
    }))).join(', ')}]`
    const template = fs.readFileSync(`${this.templatePath}/database/index.ts.txt`, { encoding: "utf-8" })

    fs.writeFileSync(`${this.dirr}/database/index.ts`, this.parseFileContent({ IMPORT, ENTITIES }, template), { encoding: 'utf-8' })
  }

  protected parseFileContent(arg: Record<string, string>, fileContent: string) {
    for (const key in arg) {
      const regex = new RegExp(`{{!! ${key} !!}}`, 'g')
      fileContent = fileContent.replace(regex, arg[key])
    }
    return fileContent
  }

  protected async generateModelEntities(table: Table) {
    this.makeDirectory(`${this.dirr}/database/entity`)
    const template = fs.readFileSync(`${this.templatePath}/database/entity/entity.ts.txt`, { encoding: "utf-8" })
    const TABLENAME = table.name
    const CLASSNAME = _.upperFirst(_.camelCase(table.name))

    const COLUMN = (await Promise.all(table.columns.map(async column => {
      return await new ColumnGenerator(column)[column.type]()
    }))).join('\n\n')

    const COLUMN_RESPONSE: string[] = []

    const CLASS_PROPS = (await Promise.all(table.columns.map(async column => {
      COLUMN_RESPONSE.push(`model['${column.name}'],`)
      return `\n        private ${column.name}: ${await new ColumnGenerator(column)[column.type](true)}`
    }))).join(',') + '\n'

    fs.writeFileSync(`${this.dirr}/database/entity/${CLASSNAME}.ts`, this.parseFileContent({ TABLENAME, CLASSNAME, COLUMN, CLASS_PROPS, COLUMN_RESPONSE: COLUMN_RESPONSE.join('\n        ') }, template), { encoding: 'utf-8' })
  }

  protected async makeDirectory(dir?: string) {
    if (!fs.existsSync(dir || this.dirr)) {
      fs.mkdirSync(dir || this.dirr)
    }
  }

  public async deleteDirectory() {
    if (fs.existsSync(this.dirr)) {
      fs.rmSync(this.dirr, { recursive: true, force: true });
    }
  }

  protected async generateEnv() {
    this.makeDirectory(`${this.dirr}/helpers`)
    let envExample = ''
    let envServer = ''
    let envHelper: string[] = ['']

    const template = fs.readFileSync(this.templatePath + '/helpers/env.ts.txt', { encoding: "utf-8" })

    this.env.forEach(({ key, value }) => {
      envExample += `${key}=\n`
      envServer += `${key}=${value}\n`
      envHelper.push(`  ${key}: process.env.${key},`)
    })
    const ENV = envHelper.join('\n') + '\n'

    fs.writeFileSync(`${this.dirr}/.env.example`, envExample, { encoding: 'utf-8' })
    fs.writeFileSync(`${this.dirr}/.env`, envServer, { encoding: 'utf-8' })
    fs.writeFileSync(`${this.dirr}/helpers/env.ts`, this.parseFileContent({ ENV }, template), { encoding: 'utf-8' })
  }

  protected async compileFile() {
    await zip(this.dirr, this.zipPath)
  }
}