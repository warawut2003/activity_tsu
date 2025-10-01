import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// The `request` parameter is intentionally unused here. Its presence is required
// by Next.js to correctly resolve dynamic route parameters like `studentId`.
export async function GET(
    request: Request,
    context: { params: { studentId: string } }
) {
    const studentId = context.params.studentId;

    if (!studentId) {
        return NextResponse.json({ message: "ไม่พบรหัสนักศึกษา" }, { status: 400 });
    }

    try {
        // ค้นหาข้อมูลนิสิตก่อน เพื่อให้แน่ใจว่ามีตัวตนและใช้แสดงชื่อ
        const student = await prisma.student.findUnique({
            where: {
                std_id: studentId,
            },
            select: {
                name: true,
                std_id: true,
            }
        });

        if (!student) {
            return NextResponse.json({ message: `ไม่พบข้อมูลนิสิตรหัส ${studentId}` }, { status: 404 });
        }

        // ค้นหากิจกรรมทั้งหมดของนิสิตคนนี้ พร้อมทั้งรูปภาพที่เกี่ยวข้อง
        const activities = await prisma.studentActivity.findMany({
            where: {
                studentId: studentId,
            },
            include: {
                photos: true, // ดึงข้อมูลรูปภาพมาด้วย
            },
            orderBy: {
                date: 'desc', // เรียงตามวันที่ล่าสุดก่อน
            },
        });

        return NextResponse.json({ student, activities });

    } catch (error) {
        console.error(`Error fetching activities for student ${studentId}:`, error);
        return NextResponse.json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรม" }, { status: 500 });
    }
}
