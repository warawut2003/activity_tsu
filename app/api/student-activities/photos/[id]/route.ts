import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { unlink, writeFile } from "fs/promises";
import { v4 as uuidv4 } from 'uuid';


const prisma = new PrismaClient();

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    // params สามารถเข้าถึงได้โดยตรง ไม่จำเป็นต้อง await
    const photoId = params.id;

    if (!photoId) {
        return NextResponse.json(
            { success: false, message: "ไม่พบ ID ของรูปภาพ" },
            { status: 400 }
        );
    }

    try {
        // 1. ค้นหาข้อมูลรูปภาพในฐานข้อมูลเพื่อเอาชื่อไฟล์
        const photo = await prisma.studentActivityPhoto.findUnique({
            where: { id: photoId }, // ✅ แก้ไข: ใช้ 'id' ซึ่งเป็น Primary Key ที่ถูกต้อง
        });

        if (!photo) {
            return NextResponse.json(
                { success: false, message: "ไม่พบรูปภาพที่ต้องการลบ" },
                { status: 404 }
            );
        }

        // 2. ลบไฟล์รูปภาพออกจากโฟลเดอร์ public/uploads
        const filePath = path.join(process.cwd(), 'public/uploads', photo.filename);
        try {
            await unlink(filePath);
        } catch (fileError: any) {
            // ถ้าไฟล์ไม่มีอยู่แล้ว ก็ไม่เป็นไร แต่ถ้าเป็น error อื่นให้ log ไว้
            if (fileError.code !== 'ENOENT') {
                console.warn(`Could not delete file: ${filePath}`, fileError);
            }
        }

        // 3. ลบข้อมูลรูปภาพออกจากฐานข้อมูล
        await prisma.studentActivityPhoto.delete({
            where: { id: photoId }, // ✅ แก้ไข: ใช้ 'id' ซึ่งเป็น Primary Key ที่ถูกต้อง
        });

        // 4. ส่งผลลัพธ์กลับไป
        return NextResponse.json({
            success: true,
            message: "ลบรูปภาพสำเร็จ",
        });

    } catch (error: any) {
        console.error("Error deleting photo:", error);
        return NextResponse.json(
            { success: false, message: `เกิดข้อผิดพลาด: ${error.message}` },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const photoId = params.id;

    if (!photoId) {
        return NextResponse.json({ success: false, message: "ไม่พบ ID ของรูปภาพ" }, { status: 400 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ success: false, message: "ไม่พบไฟล์ที่ต้องการอัปโหลด" }, { status: 400 });
        }

        // ใช้ transaction เพื่อความปลอดภัยของข้อมูล
        const updatedPhoto = await prisma.$transaction(async (tx) => {
            // 1. ค้นหารูปภาพเดิมเพื่อเอาชื่อไฟล์เก่า
            const oldPhoto = await tx.studentActivityPhoto.findUnique({
                where: { id: photoId },
            });

            if (!oldPhoto) {
                throw new Error("ไม่พบรูปภาพที่ต้องการแก้ไข");
            }

            // 2. ลบไฟล์รูปภาพเก่าออกจาก server
            const oldFilePath = path.join(process.cwd(), 'public/uploads', oldPhoto.filename);
            try {
                await unlink(oldFilePath);
            } catch (fileError: any) {
                if (fileError.code !== 'ENOENT') {
                    console.warn(`ไม่สามารถลบไฟล์เก่าได้: ${oldFilePath}`, fileError);
                }
            }

            // 3. อัปโหลดไฟล์ใหม่
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileExtension = path.extname(file.name);
            const newFilename = `${Date.now()}-${uuidv4()}${fileExtension}`;
            const newFilePath = path.join(process.cwd(), 'public/uploads', newFilename);
            await writeFile(newFilePath, buffer);

            // 4. อัปเดตข้อมูลในฐานข้อมูล
            const newUrl = `/uploads/${newFilename}`;
            const photo = await tx.studentActivityPhoto.update({
                where: { id: photoId },
                data: {
                    filename: newFilename,
                    url: newUrl,
                },
            });
            return photo;
        });

        return NextResponse.json({ success: true, photo: updatedPhoto });

    } catch (error: any) {
        console.error("Error replacing photo:", error);
        return NextResponse.json({ success: false, message: `เกิดข้อผิดพลาด: ${error.message}` }, { status: 500 });
    }
}
