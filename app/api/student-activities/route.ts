import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const activityId = searchParams.get('activityId'); // เพิ่มการรับ activityId

    const getDistinctTitles = searchParams.get('distinct');

    try {

        if (getDistinctTitles === 'true') {
            const distinctActivities = await prisma.studentActivity.findMany({
                distinct: ['title'],
                select: {
                    title: true,
                    detail: true,
                    date: true,
                },
                orderBy: {
                    date: 'desc',
                }
            });
            // สร้าง ID จำลองสำหรับ frontend (เนื่องจาก distinct ไม่ได้คืน ID หลัก)
            return NextResponse.json(distinctActivities.map((act, index) => ({...act, std_act_id: `central-${index}`})));
        }

        // เพิ่ม: กรณีต้องการดึงกิจกรรมเดียวด้วย ID
        if (activityId) {
            const activity = await prisma.studentActivity.findUnique({
                where: { std_act_id: activityId },
                include: {
                    photos: true,
                },
            });
            if (!activity) {
                return NextResponse.json({ success: false, message: "ไม่พบกิจกรรม" }, { status: 404 });
            }
            return NextResponse.json(activity);
        }

        if (studentId) {
            const activities = await prisma.studentActivity.findMany({
                where: { studentId: studentId },
                include: {
                    photos: true, // <-- เพิ่มส่วนนี้เพื่อดึงข้อมูลรูปภาพ
                },
                orderBy: {
                    date: 'desc',
                }
            });
            return NextResponse.json(activities);
        }

        // กรณีที่ไม่มี studentId และไม่ใช่ distinct
        const activities = await prisma.studentActivity.findMany({ orderBy: { date: 'desc' } });
        return NextResponse.json(activities);

    } catch (error) {
        console.error("Error fetching activities:", error);
        return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรม" }, { status: 500 });
    }
}
