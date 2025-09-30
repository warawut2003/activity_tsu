// app/student/activities/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // <-- 1. Import useRouter

// Interface สำหรับข้อมูลกิจกรรม (ควรตรงกับ Prisma Schema)
interface StudentActivity {
    std_act_id: string;
    title: string;
    detail: string | null;
    date: string;
}

export default function StudentActivitiesPage() {
    const [activities, setActivities] = useState<StudentActivity[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // State สำหรับจัดการ Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<StudentActivity | null>(null);

    const router = useRouter(); // <-- 2. สร้าง instance ของ router

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setIsLoading(true);
                setError(null);
                // 3. แก้ไข URL ให้ดึงข้อมูลกิจกรรมที่ไม่ซ้ำกัน (กิจกรรมกลาง)
                const response = await fetch('/api/student-activities?distinct=true');
                if (!response.ok) {
                    throw new Error('ไม่สามารถดึงข้อมูลกิจกรรมได้');
                }
                const data: StudentActivity[] = await response.json();
                setActivities(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActivities();
    }, []);

    // 4. แก้ไขฟังก์ชัน: เมื่อคลิกเลือกกิจกรรม ให้เปิด Modal
    const handleSelectActivity = (activity: StudentActivity) => {
        setSelectedActivity(activity);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedActivity(null);
    };

    // ฟังก์ชันสำหรับจัดการเมื่อผู้ใช้ยืนยันรหัสนักศึกษาจาก Modal
    const handleConfirmStudentId = (studentId: string) => {
        if (!selectedActivity || !studentId) return;
        
        try {
            // 4.1 ไม่สร้างกิจกรรมในหน้านี้ แต่จะส่งข้อมูลทั้งหมดไปที่หน้า upload
            const params = new URLSearchParams();
            params.set('title', selectedActivity.title);
            if (selectedActivity.detail) {
                params.set('detail', selectedActivity.detail);
            }
            params.set('date', selectedActivity.date);
            params.set('studentId', studentId.trim());
            // 4.2 ระบุว่าเป็น "กิจกรรมที่เลือกจาก Template"
            // เพื่อให้หน้า upload รู้ว่าไม่ต้องแสดงฟอร์มกรอกข้อมูลกิจกรรม
            params.set('fromTemplate', 'true');

            router.push(`/student/activities/upload?${params.toString()}`);

        } catch (error: any) {
            setError(`เกิดข้อผิดพลาด: ${error.message}`);
        } finally {
            closeModal();
        }
    };


    // Modal Component สำหรับกรอกรหัสนักศึกษา
    const StudentIdModal = () => {
        const [studentId, setStudentId] = useState('');
        const [modalError, setModalError] = useState('');

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!studentId.trim()) {
                setModalError('กรุณากรอกรหัสนักศึกษา');
                return;
            }
            setModalError('');
            handleConfirmStudentId(studentId);
        };

        if (!isModalOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
                <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-2 text-white">ยืนยันการเลือกกิจกรรม</h2>
                    <p className="text-gray-300 mb-6">สำหรับกิจกรรม: <span className="font-semibold text-purple-300">{selectedActivity?.title}</span></p>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="studentId" className="block text-sm font-medium text-gray-300 mb-2">
                            กรุณากรอกรหัสนักศึกษาเพื่อดำเนินการต่อ
                        </label>
                        <input
                            id="studentId"
                            type="text"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                            placeholder="เช่น 652021068"
                            autoFocus
                        />
                        {modalError && <p className="text-red-400 text-sm mt-2">{modalError}</p>}
                        <div className="flex justify-end gap-4 mt-6">
                            <button type="button" onClick={closeModal} className="py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors">ยกเลิก</button>
                            <button type="submit" className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">ยืนยัน</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };


    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
                <p className="text-xl">กำลังโหลดข้อมูลกิจกรรม...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900 text-red-500">
                <p className="text-xl">เกิดข้อผิดพลาด: {error}</p>
            </div>
        );
    }

    return (
        <main className="p-4 sm:p-6 md:p-8 text-white">
            <div className="container mx-auto">
                {/* แสดง Modal ที่สร้างขึ้น */}
                <StudentIdModal />

                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl sm:text-4xl font-bold text-center sm:text-left bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-800">
                        เลือกกิจกรรม หรือสร้างใหม่
                    </h1>
                    <Link href="/student/activities/new">
                        <span className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 shadow-lg flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            เพิ่มกิจกรรมใหม่
                        </span>
                    </Link>
                </div>

                {activities.length === 0 ? (
                    <p className="text-center text-gray-400">ไม่พบกิจกรรมในขณะนี้</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activities.map((activity) => (
                            // 5. เพิ่ม onClick และปรับ className เพื่อให้รู้ว่าคลิกได้
                            <div 
                                key={activity.std_act_id}
                                className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col justify-between transition-transform transform hover:scale-105 hover:cursor-pointer"
                                onClick={() => handleSelectActivity(activity)}
                            >
                                <div>
                                    <h2 className="text-2xl font-semibold mb-2 text-purple-300">{activity.title}</h2>
                                    <p className="text-gray-400 mb-4">{activity.detail || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>
                                    <p className="text-sm text-gray-500">
                                        วันที่: {new Date(activity.date).toLocaleDateString('th-TH', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-700 text-right">
                                     <span className="text-blue-400 font-semibold">เลือกกิจกรรมนี้ &rarr;</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}