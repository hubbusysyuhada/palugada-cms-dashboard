import env from "../helpers/env";
import { MikroORM, UnderscoreNamingStrategy } from "@mikro-orm/core";
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SqliteDriver } from "@mikro-orm/sqlite";

export default class MikroOrmInstance {
  constructor (
    private orm: MikroORM<SqliteDriver>
  ) {}

  static async init() {
    const orm = await MikroORM.init<SqliteDriver>({
      entities: ['./database/entity'],
      dbName: env.DB_NAME,
      user: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      host: env.DB_HOST,
      type: env.DB_TYPE as "mongo" | "mysql" | "mariadb" | "postgresql" | "sqlite" | "better-sqlite",
      metadataProvider: TsMorphMetadataProvider,
      namingStrategy: UnderscoreNamingStrategy,
      pool: { max: 10, min: 2 },
      forceUtcTimezone: true
    })

    const generator = orm.getSchemaGenerator()
    await generator.updateSchema()
    return new MikroOrmInstance(orm)
  }

  private async getOrm() {
    return this.orm
  }

  public async getEm() {
    return this.orm.em.fork()
  }

  public async open() {
    await this.orm.connect()
  }

  public async close() {
    await this.orm.close()
  }
}