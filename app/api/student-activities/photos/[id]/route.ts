import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { unlink } from "fs/promises";

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
            where: { id: photoId },
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
            where: { id: photoId },
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
