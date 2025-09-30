"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StudentWithActivityCount {
    std_id: string;
    name: string;
    _count: {
        activities: number;
    };
}

export default function StudentsListPage() {
    const [students, setStudents] = useState<StudentWithActivityCount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/students');
                if (!response.ok) {
                    throw new Error('ไม่สามารถดึงข้อมูลนิสิตได้');
                }
                const data = await response.json();
                setStudents(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudents();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">กำลังโหลด...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-red-500">เกิดข้อผิดพลาด: {error}</div>;
    }

    return (
        <main className="p-4 sm:p-6 md:p-8 text-white">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
                    รายชื่อนิสิตทั้งหมด
                </h1>

                {students.length === 0 ? (
                    <p className="text-center text-gray-400">ไม่พบข้อมูลนิสิต</p>
                ) : (
                    <div className="bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
                        <ul className="divide-y divide-gray-700">
                            {students.map((student) => (
                                <li key={student.std_id}>
                                    <Link href={`/students/${student.std_id}/activities`}>
                                        <div className="p-4 sm:p-6 hover:bg-gray-700/50 transition-colors duration-200 flex justify-between items-center">
                                            <div>
                                                <p className="text-lg font-semibold text-cyan-300">{student.name}</p>
                                                <p className="text-sm text-gray-400">รหัสนิสิต: {student.std_id}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-white">{student._count.activities}</p>
                                                <p className="text-xs text-gray-500">กิจกรรม</p>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </main>
    );
}
