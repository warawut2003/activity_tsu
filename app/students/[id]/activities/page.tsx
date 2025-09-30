"use client";

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

interface Photo {
    id: string;
    url: string;
    filename: string;
}

interface ActivityWithPhotos {
    std_act_id: string;
    title: string;
    detail: string | null;
    date: string;
    photos: Photo[];
}

function EditActivityPageComponent() {
    const router = useRouter();
    const params = useParams();
    // รับ id จาก URL pattern ใหม่ (ต้องตรงกับชื่อโฟลเดอร์ [id])
    const activityId = params.id as string;

    const [activity, setActivity] = useState<ActivityWithPhotos | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!activityId) return;

        const fetchActivity = async () => {
            try {
                setIsFetching(true);
                // แก้ไข API endpoint ให้ตรงกับ dynamic route ที่เรามี
                const res = await fetch(`/api/student-activities/${activityId}`);
                if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลกิจกรรมได้");
                const data: ActivityWithPhotos = await res.json();
                setActivity(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsFetching(false);
            }
        };
        fetchActivity();
    }, [activityId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setError(null);
            setSuccessMessage(null);
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleDeleteExistingPhoto = async (photoId: string) => {
        if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพนี้?")) return;

        try {
            const response = await fetch(`/api/student-activities/photos/${photoId}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถลบรูปภาพได้');
            }
            setActivity(prev => prev ? { ...prev, photos: prev.photos.filter(p => p.id !== photoId) } : null);
            setSuccessMessage("ลบรูปภาพสำเร็จ");
        } catch (err: any) {
            // เมื่อลบไม่สำเร็จ ให้เคลียร์ success message และแสดง error
            setSuccessMessage(null);
            setError(err.message);
        }
    };

    const handleAddPhotos = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (files.length === 0) {
            setError("กรุณาเลือกไฟล์ที่ต้องการเพิ่ม");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        const formData = new FormData();
        files.forEach(file => formData.append('file', file));

        try {
            // ใช้ API endpoint ใหม่ที่เราสร้าง
            const response = await fetch(`/api/student-activities/${activityId}/photos`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'เกิดข้อผิดพลาดในการเพิ่มรูปภาพ');

            setSuccessMessage(`เพิ่ม ${result.photos.length} รูปภาพสำเร็จ!`);
            setActivity(prev => prev ? { ...prev, photos: [...prev.photos, ...result.photos] } : null);
            setFiles([]); // Clear selected files
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">กำลังโหลดข้อมูล...</div>;
    if (error) return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-red-500">{error}</div>;
    if (!activity) return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">ไม่พบข้อมูลกิจกรรม</div>;

    return (
        <main className="p-4 sm:p-6 md:p-8 text-white">
            <div className="container mx-auto max-w-4xl">
                <button onClick={() => router.back()} className="mb-6 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    &larr; กลับ
                </button>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                    แก้ไขรูปภาพกิจกรรม
                </h1>
                <p className="text-center text-gray-300 mb-8 text-lg">{activity.title}</p>

                {/* ส่วนแสดงรูปภาพที่มีอยู่ */}
                <div className="bg-gray-800 p-8 rounded-lg shadow-2xl mb-8">
                    <h2 className="text-2xl font-bold mb-4">รูปภาพปัจจุบัน ({activity.photos.length})</h2>
                    {activity.photos.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {activity.photos.map(photo => (
                                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden shadow-lg group">
                                    <Image src={photo.url} alt={photo.filename} fill style={{ objectFit: 'cover' }} />
                                    <button
                                        onClick={() => handleDeleteExistingPhoto(photo.id)}
                                        className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        aria-label="ลบรูปภาพ"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-400">ยังไม่มีรูปภาพในกิจกรรมนี้</p>}
                </div>

                {/* ส่วนเพิ่มรูปภาพใหม่ */}
                <form onSubmit={handleAddPhotos} className="bg-gray-800 p-8 rounded-lg shadow-2xl space-y-6">
                    <h2 className="text-2xl font-bold mb-4">เพิ่มรูปภาพใหม่</h2>
                    {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">{error}</div>}
                    {successMessage && <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded-lg" role="alert">{successMessage}</div>}

                    <div className="border-2 border-dashed rounded-lg p-10 text-center border-gray-600 hover:border-blue-400">
                        <input id="file-upload" type="file" multiple onChange={handleFileChange} className="hidden" />
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <p className="text-gray-400">ลากไฟล์มาวาง หรือ <span className="font-semibold text-blue-400">คลิกเพื่อเลือกไฟล์</span></p>
                            <p className="text-xs text-gray-500 mt-2">รองรับหลายไฟล์ | ขนาดสูงสุด 5MB</p>
                        </label>
                    </div>

                    {files.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-2">ไฟล์ใหม่ที่จะเพิ่ม ({files.length}):</h3>
                            <ul className="space-y-2">
                                {files.map((file, index) => (
                                    <li key={index} className="bg-gray-700 p-2 rounded-md flex justify-between items-center text-sm">
                                        <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                        <button type="button" onClick={() => removeFile(index)} className="text-red-400 hover:text-red-300 font-bold">&times;</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button type="submit" disabled={isLoading || files.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500">
                        {isLoading ? 'กำลังเพิ่มรูปภาพ...' : `เพิ่ม ${files.length} รูปภาพ`}
                    </button>
                </form>
            </div>
        </main>
    );
}

export default function EditActivityPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">กำลังโหลด...</div>}>
            <EditActivityPageComponent />
        </Suspense>
    );
}
