import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: ดึงข้อมูลกิจกรรมตาม ID
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id: activityId } = await params;
    try {
        const activity = await prisma.studentActivity.findUnique({
            where: { std_act_id: activityId },
            include: { photos: true },
        });

        if (!activity) {
            return NextResponse.json(
                { success: false, message: "ไม่พบกิจกรรม" },
                { status: 404 }
            );
        }

        return NextResponse.json(activity);
    } catch (error) {
        console.error("Error fetching activity:", error);
        return NextResponse.json(
            { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
            { status: 500 }
        );
    }
}

// PUT: อัปเดตข้อมูลกิจกรรมตาม ID
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id: activityId } = await params;
    try {
        const body = await req.json();
        const { title, detail, date } = body;

        // Client-side validation
        if (!title || !date) {
            return NextResponse.json(
                { success: false, message: "กรุณากรอก Title และ Date" },
                { status: 400 }
            );
        }

        const updatedActivity = await prisma.studentActivity.update({
            where: { std_act_id: activityId },
            data: {
                title: title.trim(),
                detail,
                date: new Date(date),
            },
        });

        return NextResponse.json({ success: true, activity: updatedActivity });

    } catch (error: any) {
        console.error("Error updating activity:", error);
        // จัดการ Error กรณีที่หา activityId ไม่เจอ
        if (error.code === 'P2025') {
            return NextResponse.json(
                { success: false, message: "ไม่พบกิจกรรมที่ต้องการอัปเดต" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { success: false, message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" },
            { status: 500 }
        );
    }
}
