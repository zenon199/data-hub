import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { size } from "zod";

const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
    privateKey: process.env.NEXT_PRIVATE_IMAGEKIT_PUBLIC_KEY || '',
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ''
})

export async function POST(request: NextRequest) {
    try {
        const {userId} = await auth();
        
        if (!userId) {
            return NextResponse.json({error: "Unauthorised"}, {status: 401})
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const formUserId = formData.get('userId') as string
        const parentId = formData.get('parentId') as string || null

        if (formUserId !== userId) {
            return NextResponse.json({error: "Unauthorised"}, {status: 401})
        }
        if (!file) {
            return NextResponse.json({error: "No files provided"}, {status: 401})
        }

        if (parentId) {
            const [parentFolder] = await db
                .select()
                .from(files)
                .where(
                    and(
                        eq(files.id, parentId),
                        eq(files.userId, userId),
                        eq(files.isFolder, true)
                    )
                )
        } else {
            return NextResponse.json({error: "Parent folder not found"}, {status: 401})
        }

        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
            return NextResponse.json({error: "Ony images and pdf are supported"}, {status: 401})
        }

        const buffer = await file.arrayBuffer()
        const fileBuffer = Buffer.from(buffer)

        const folderPath = parentId ? `/data-hub/${userId}/folder/${parentId}` : `/data-hub/${userId}`
        
        const originalFilename = file.name
        const fileExtension = originalFilename.split('.').pop() || ''

        //check for empty extension
        //validation for not exe, php

        const uniqueFineName = `${uuidv4()}.${fileExtension}`

        const uploadResponse = await imagekit.upload({
            file: fileBuffer,
            fileName: uniqueFineName,
            folder: folderPath,
            useUniqueFileName: false
        })

        const fileData = {
            name: originalFilename,
            path: uploadResponse.filePath,
            size: file.size,
            type: file.type,
            fileUrl: uploadResponse.url,
            thumbnailUrl: uploadResponse.thumbnailUrl || null,
            userId: userId,
            parentId: parentId,
            isFolder: false,
            isStared: false,
            isTrash: false
        }

        const [newFile] = await db.insert(files).values(fileData).returning()

        return NextResponse.json(newFile)

    } catch (error) {
        return NextResponse.json({ error: 'Failed to upload file to db' },
            {status: 500}
        )
    }


}