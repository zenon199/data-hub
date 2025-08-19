import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH (
    request: NextRequest,
    props: { params: Promise<{ fileId: string }> }) {
    
    try {
        const {userId} = await auth();
        if (!userId) {
            return NextResponse.json({error: "Unauthorised"}, {status: 401})
        }

        const { fileId } = await props.params
        
        if (!fileId) {
            return NextResponse.json({error: "FileId is required"}, {status: 401})
        }

        const [file] = await db.select().from(files).where(
            and(
                eq(files.id, fileId),
                eq(files.userId, userId)
            )
        )
        if (!file) {
            return NextResponse.json({error: "File not found"}, {status: 401})
        }
        //toggle the star status

        const updatedFiles = await db.update(files).set({ isStared: !file.isStared }).where(
            and(
                eq(files.id, fileId),
                eq(files.userId, userId)
            )
        ).returning()

        //log the whole updated files
        const updatedFile = updatedFiles[0]

        return NextResponse.json(updatedFile)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update files' },
            {status: 500}
        )
    }
}