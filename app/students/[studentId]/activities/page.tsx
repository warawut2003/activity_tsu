"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // 1. Import useParams
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';

// Interfaces สำหรับ Type-safety
interface Photo {
    id: string; // ✅ แก้ไข: ใช้ 'id' ให้ตรงกับ Primary Key ใน Schema
    url: string;
    filename: string;
}

interface Activity {
    std_act_id: string;
    title: string;
    detail: string | null;
    date: string;
    photos: Photo[];
}

interface Student {
    std_id: string;
    name: string;
}

interface StudentActivityData {
    student: Student;
    activities: Activity[];
}

// สร้าง Component ย่อยสำหรับแสดงแต่ละรายการกิจกรรม
// การแยก Component ช่วยให้ React จัดการ 'key' ใน list ที่ซ้อนกันได้ดีขึ้น
function ActivityItem({
    activity,
    onDeletePhoto,
    onReplacePhoto,
}: {
    activity: Activity;
    onDeletePhoto: (photoId: string, activityId: string) => void;
    onReplacePhoto: (photoId: string, activityId: string, file: File) => void;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

    const handleEditClick = (photoId: string) => {
        setSelectedPhotoId(photoId);
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && selectedPhotoId) {
            onReplacePhoto(selectedPhotoId, activity.std_act_id, file);
        }
        // Reset ค่า input เพื่อให้สามารถเลือกไฟล์เดิมซ้ำได้
        event.target.value = '';
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
            <h2 className="text-2xl font-semibold text-purple-300 mb-2">{activity.title}</h2>
            <p className="text-sm text-gray-500 mb-4">
                วันที่: {new Date(activity.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            {activity.detail && <p className="text-gray-300 mb-4">{activity.detail}</p>}
            
            {/* Input สำหรับเลือกไฟล์ที่ซ่อนไว้ */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />

            {activity.photos.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-200 mb-3">รูปภาพประกอบ:</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {activity.photos.map(photo => (
                            <div key={photo.id} className="relative aspect-square rounded-md overflow-hidden group">
                                <a href={photo.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                                    <Image src={photo.url} alt={photo.filename} fill sizes="20vw" style={{ objectFit: 'cover' }} className="transition-transform duration-300 group-hover:scale-110" />
                                </a>
                                <div className="absolute top-1 right-1 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button
                                        onClick={() => handleEditClick(photo.id)}
                                        className="bg-blue-600/80 hover:bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center"
                                        aria-label="แก้ไขรูปภาพ"
                                    >
                                        {/* SVG Icon แก้ไข */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                    </button>
                                    <button
                                        onClick={() => onDeletePhoto(photo.id, activity.std_act_id)}
                                        className="bg-red-600/80 hover:bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center"
                                        aria-label="ลบรูปภาพ"
                                    >
                                        {/* SVG Icon ถังขยะ */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function StudentActivitiesPage() {
    // 2. ใช้ useParams เพื่อดึงค่า dynamic route ออกมาอย่างถูกต้อง
    const params = useParams();
    const studentId = params.studentId as string;

    const [data, setData] = useState<StudentActivityData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!studentId) return;

        const fetchStudentActivities = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/students/${studentId}/activities`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'ไม่สามารถดึงข้อมูลได้');
                }
                const result: StudentActivityData = await response.json();
                setData(result);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudentActivities();
    }, [studentId]);

    const handleDeletePhoto = async (photoId: string, activityId: string) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพนี้?')) {
            return;
        }

        try {
            const response = await fetch(`/api/student-activities/photos/${photoId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถลบรูปภาพได้');
            }

            // อัปเดต State เพื่อลบรูปภาพออกจาก UI ทันที
            setData(prevData => {
                if (!prevData) return null;
                const updatedActivities = prevData.activities.map(act => {
                    if (act.std_act_id === activityId) {
                        return { ...act, photos: act.photos.filter(p => p.id !== photoId) };
                    }
                    return act;
                });
                return { ...prevData, activities: updatedActivities };
            });
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleReplacePhoto = async (photoId: string, activityId: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            // แสดงสถานะกำลังโหลดชั่วคราว (อาจจะเพิ่ม state isLoading เฉพาะรูปนั้นๆ)
            const response = await fetch(`/api/student-activities/photos/${photoId}`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถแก้ไขรูปภาพได้');
            }

            const { photo: updatedPhoto } = await response.json();

            // อัปเดต State เพื่อเปลี่ยนรูปภาพใน UI ทันที
            setData(prevData => {
                if (!prevData) return null;
                const updatedActivities = prevData.activities.map(act => {
                    if (act.std_act_id === activityId) {
                        const updatedPhotos = act.photos.map(p => p.id === photoId ? updatedPhoto : p);
                        return { ...act, photos: updatedPhotos };
                    }
                    return act;
                });
                return { ...prevData, activities: updatedActivities };
            });
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">กำลังโหลดข้อมูลกิจกรรม...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-red-500">เกิดข้อผิดพลาด: {error}</div>;
    }

    if (!data) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-gray-400">ไม่พบข้อมูล</div>;
    }

    const { student, activities } = data;

    return (
        <main className="p-4 sm:p-6 md:p-8 text-white">
            <div className="container mx-auto max-w-5xl">
                <Link href="/students" className="text-cyan-400 hover:text-cyan-300 mb-6 inline-block">&larr; กลับไปหน้ารายชื่อนิสิต</Link>
                <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">{student.name}</h1>
                <p className="text-lg text-gray-400 mb-8">รหัสนิสิต: {student.std_id}</p>

                {activities.length === 0 ? (
                    <div className="text-center py-12 bg-gray-800 rounded-lg">
                        <p className="text-gray-400 text-lg">ยังไม่มีการบันทึกกิจกรรม</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {activities.map((activity) => (
                            <ActivityItem key={activity.std_act_id} activity={activity} onDeletePhoto={handleDeletePhoto} onReplacePhoto={handleReplacePhoto} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
