import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Prisma, PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import { writeFile } from 'fs/promises';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    // 1. อ่าน FormData และดึงข้อมูลที่จำเป็นออกมาทันที
    // การทำเช่นนี้จะทำให้ถ้า req.formData() มีปัญหา จะเกิด error ที่นี่เลย
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const detail = formData.get('detail') as string | null;
    const date = formData.get('date') as string;
    const studentId = formData.get('studentId') as string;
    const files = formData.getAll('file') as File[];

    try {
        // 2. ย้ายการตรวจสอบข้อมูลมาไว้ใน try block
        // ข้อมูลที่จำเป็นสำหรับการสร้างกิจกรรม
        if (!title || !date || !studentId) {
            return NextResponse.json({ success: false, message: "ข้อมูลกิจกรรมไม่ครบถ้วน" }, { status: 400 });
        }

        if (!files || files.length === 0) {
            return NextResponse.json({ success: false, message: "ไม่พบไฟล์ที่อัปโหลด" }, { status: 400 });
        }

        const photosData: Prisma.StudentActivityPhotoCreateManyInput[] = [];
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.promises.mkdir(uploadDir, { recursive: true }); // สร้างโฟลเดอร์ถ้ายังไม่มี

        // 3. ใช้ Prisma Transaction เพื่อจัดการ business logic
        const result = await prisma.$transaction(async (tx) => {
            // 2.1 ตรวจสอบว่ามีกิจกรรมนี้สำหรับนักศึกษาคนนี้อยู่แล้วหรือไม่ (Upsert Logic)
            let activity = await tx.studentActivity.findFirst({
                where: {
                    studentId: studentId,
                    title: title.trim(),
                    // เพื่อความแม่นยำ ควรเช็คเฉพาะวัน ไม่รวมเวลา
                    date: {
                        gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
                        lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
                    }
                }
            });

            // 2.2 ถ้าไม่พบกิจกรรม ให้สร้างใหม่
            if (!activity) {
                activity = await tx.studentActivity.create({
                    data: {
                        title: title.trim(),
                        detail: detail,
                        date: new Date(date),
                        student: { connect: { std_id: studentId } }
                    }
                });
            }

            // 2.2 วนลูปจัดการแต่ละไฟล์
            for (const file of files) {
                if (file.size > 5 * 1024 * 1024) { // ไม่เกิน 5MB
                    console.warn(`Skipping file ${file.name} due to size limit.`);
                    continue;
                }

                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                // สร้างชื่อไฟล์ใหม่ที่ไม่ซ้ำกัน
                const fileExtension = path.extname(file.name);
                const newFilename = `${Date.now()}-${uuidv4()}${fileExtension}`;
                const filePath = path.join(uploadDir, newFilename);

                await writeFile(filePath, buffer);

                const url = `/uploads/${newFilename}`;
                photosData.push({
                    filename: newFilename,
                    url: url,
                    activityId: activity.std_act_id, // ✅ ใช้ ID ของกิจกรรมที่มีอยู่หรือเพิ่งสร้าง
                });
            }

            if (photosData.length === 0) {
                throw new Error("ไม่มีไฟล์ที่สามารถอัปโหลดได้ (อาจมีขนาดใหญ่เกินไป)");
            }

            // 2.3 สร้างข้อมูลรูปภาพทั้งหมด
            const createdPhotos = await tx.studentActivityPhoto.createManyAndReturn({
                data: photosData,
            });

            return { activity, createdPhotos };
        });
        

        return NextResponse.json({ 
            success: true, 
            activity: result.activity,
            photos: result.createdPhotos 
        });
    } catch (error : any) {
        console.error("Upload error:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
             // 4. ใช้ตัวแปร studentId ที่ดึงมาแล้วด้านนอก ซึ่งมั่นใจได้ว่ามีค่า
             return NextResponse.json({ success: false, message: `ไม่พบรหัสนักศึกษา: ${studentId}` }, { status: 404 });
        }
        return NextResponse.json({ success: false, message: `เกิดข้อผิดพลาด: ${error.message}` }, { status: 500 });
    }

}