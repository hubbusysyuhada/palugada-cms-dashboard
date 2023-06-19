import * as orm from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'
import Meme from './Meme';

export const relationColumns = ['memes_posted','memes_upvoted']

@orm.Entity({ tableName: "user" })
export default class User {
    @orm.PrimaryKey({type: "uuid"})
    id: string = uuid();

    @orm.Property({ type: 'varchar', length: 255, unique: true, index: true })
    external_id: string;

    @orm.Property({ type: 'varchar', length: 255, index: false })
    password: string;

    @orm.Property({ type: 'timestamp with timezone' })
    created_at: Date = new Date();

    @orm.Property({ type: 'varchar', length: 255, index: false })
    profile_picture: string = https://1fid.com/wp-content/uploads/2022/06/no-profile-picture-6-1024x1024.jpg;

    @orm.Property({ type: 'boolean' })
    is_verified: boolean = false;

    @orm.OneToMany(() => Meme, opposite_table => opposite_table.poster_id)
    memes_posted = new orm.Collection<Meme>(this);

    @orm.ManyToMany({ pivotTable: 'memes_upvoted_upvotes_pivot' })
    memes_upvoted = new orm.Collection<Meme>(this);
}