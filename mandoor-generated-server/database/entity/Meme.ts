import * as orm from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'
import User from './User';

export const relationColumns = ['poster_id','upvotes']

@orm.Entity({ tableName: "meme" })
export default class Meme {
    @orm.PrimaryKey({type: "uuid"})
    id: string = uuid();

    @orm.Property({ type: 'timestamp with timezone' })
    created_at: Date = new Date();

    @orm.Property({ type: 'varchar', length: 255, index: true })
    title: string;

    @orm.Property({ type: 'varchar', length: 500, index: false })
    source_path: string;

    @orm.Property({ type: 'integer', index: false })
    total_likes: number = 0;

    @orm.ManyToOne({ onDelete: "NO ACTION", onUpdateIntegrity: "NO ACTION" })
    poster_id!: User;

    @orm.ManyToMany(() => User, 'memes_upvoted', { pivotTable: 'memes_upvoted_upvotes_pivot', entity: () => User })
    upvotes = new orm.Collection<User>(this);
}