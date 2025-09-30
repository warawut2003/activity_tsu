import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const students = await prisma.student.findMany({
            select: {
                std_id: true,
                name: true,
                _count: {
                    select: { activities: true },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
        return NextResponse.json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        return NextResponse.json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลนิสิต" }, { status: 500 });
    }
}
