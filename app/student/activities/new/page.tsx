// app/student/activities/new/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewActivityPage() {
    // 1. State Management: สร้าง state เพื่อจัดการข้อมูลในฟอร์ม
    const [title, setTitle] = useState('');
    const [detail, setDetail] = useState('');
    const [date, setDate] = useState('');
    const [studentId, setStudentId] = useState(''); // State สำหรับรหัสนักศึกษา

    // State สำหรับการจัดการ UI/UX
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const router = useRouter();

    // 2. Form Submission Handler: ฟังก์ชันที่จะทำงานเมื่อผู้ใช้กดปุ่ม "บันทึกกิจกรรม"
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // ป้องกันการรีเฟรชหน้าเมื่อ submit form
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        // 3. Client-side Validation: ตรวจสอบข้อมูลเบื้องต้น
        if (!title || !date || !studentId) {
            setError('กรุณากรอกข้อมูลให้ครบถ้วน: หัวข้อกิจกรรม, วันที่, และรหัสนักศึกษา');
            setIsLoading(false);
            return;
        }

        try {
            // 4. ไม่เรียก API ในหน้านี้ แต่จะส่งข้อมูลไปที่หน้า upload ผ่าน URL params
            const params = new URLSearchParams();
            params.set('title', title);
            params.set('detail', detail);
            params.set('date', date);
            params.set('studentId', studentId);
            
            setSuccessMessage('ข้อมูลพร้อมแล้ว! กำลังนำคุณไปยังหน้าอัปโหลด...');

           
            setTimeout(() => {
                router.push(`/student/activities/upload?${params.toString()}`);
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 6. JSX & UI: ส่วนของการแสดงผลฟอร์ม
    return (
        <main className="p-4 sm:p-6 md:p-8 text-white">
            <div className="container mx-auto max-w-2xl">
                <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                    สร้างกิจกรรมใหม่
                </h1>

                <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-2xl space-y-6">
                    {/* แสดงข้อความ Error หรือ Success */}
                    {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">{error}</div>}
                    {successMessage && <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded-lg" role="alert">{successMessage}</div>}

                    <div>
                        <label htmlFor="studentId" className="block text-sm font-medium text-gray-300 mb-2">รหัสนักศึกษา <span className="text-red-500">*</span></label>
                        <input
                            id="studentId"
                            type="text"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="เช่น 652021068"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">หัวข้อกิจกรรม <span className="text-red-500">*</span></label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="เช่น เข้าร่วมอบรมเชิงปฏิบัติการ..."
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="detail" className="block text-sm font-medium text-gray-300 mb-2">รายละเอียด (ถ้ามี)</label>
                        <textarea
                            id="detail"
                            value={detail}
                            onChange={(e) => setDetail(e.target.value)}
                            rows={4}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับกิจกรรม"
                        />
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">วันที่จัดกิจกรรม <span className="text-red-500">*</span></label>
                        <input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex justify-center items-center">
                        {isLoading ? 'กำลังบันทึก...' : 'บันทึกกิจกรรม'}
                    </button>
                </form>
            </div>
        </main>
    );
}