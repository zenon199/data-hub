import { auth } from "@clerk/nextjs/server";
import { files } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid4 } from 'uuid'

export async function POST(request:NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' },
                {status: 401})    
        }

        const body = await request.json()
        const { name, userId: bodyUserId, parentId = null } = body
        
        if (bodyUserId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' },
                {status: 401})
        }

        if (!name || typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json({ error: 'Folder name is required' },
                {status: 400})
        }

        if (parentId) {
            const [parentFolder] =await db
                .select()
                .from(files)
                .where(
                    and(
                        eq(files.id, parentId),
                        eq(files.userId, userId),
                        eq(files.isFolder,true)
                    )
            )
            if (!parentFolder) {
                return NextResponse.json({ error: 'Parent folder not found' },
                    {status: 401})
            }
        }

        //create folder in the db
        const folderData = {
            id: uuid4(),
            name: name.trim(),
            path: `/folders/${userId}/${uuid4()}`,
            size: 0,
            type: 'folder',
            fileUrl: '',
            thumbnailUrl: '',
            userId,
            parentId,
            isFolder: true,
            isStared: false,
            isTrash: false
        }

        const [newFolder] = await db.insert(files).values(folderData).returning()

        return NextResponse.json({
            success: true,
            message: 'Folder created successfully',
            folder: newFolder
        })

    } catch (error) {
        return NextResponse.json({ error: 'Failed to add folder in DB' },
            {status: 500}
        )
    }
}