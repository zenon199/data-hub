import {pgTable, text, uuid, integer, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const files = pgTable('files', {
    id: uuid('id').defaultRandom().primaryKey(),

    //basic file/folder infp
    name: text('name').notNull(),
    path: text('path').notNull(), // /doc/proj/abc.pdf
    size: integer('size').notNull(),
    type: text('type').notNull(),  // hardcode as folder
    
    //storage info
    fileUrl: text('file_url').notNull(),
    thumbnailUrl: text('thumbnail_url')
})