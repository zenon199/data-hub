import {pgTable, text, uuid, integer, boolean, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const files = pgTable('files', {
    id: uuid('id').defaultRandom().primaryKey(),

    //basic file/folder info
    name: text('name').notNull(),
    path: text('path').notNull(), // /doc/proj/abc.pdf
    size: integer('size').notNull(),
    type: text('type').notNull(),  // hardcode as folder
    
    //storage info
    fileUrl: text('file_url').notNull(),
    thumbnailUrl: text('thumbnail_url'),

    //ownership
    userId: text('user_id').notNull(),
    parentId: uuid('parent_id'), // parent folder ids / null

    //file/folder flags
    isFolder: boolean('is_folder').default(false).notNull(),
    isStared: boolean('is_stared').default(false).notNull(),
    isTrash: boolean('is_trash').default(false).notNull(),

    //timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const filesRelations = relations(files, ({ one, many }) => ({
    parent: one(files, {
        fields: [files.parentId],
        references: [files.id]
    }),

    
    //relationship to child file/folder
    children: many(files)
    })
)

//Type definations
export const File = typeof files.$inferSelect
export const NewFile = typeof files.$inferInsert