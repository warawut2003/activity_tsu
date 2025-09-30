// app/student/activities/upload/page.tsx
"use client";

import { useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';

interface UploadedPhoto {
    id: string; // เพิ่ม id เพื่อใช้ในการลบ
    url: string;
    filename: string;
}

function UploadPageComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // รับข้อมูลกิจกรรมจาก URL
    const activityTitle = searchParams.get('title');
    const activityDetail = searchParams.get('detail');
    const activityDate = searchParams.get('date');
    const studentId = searchParams.get('studentId');

    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setError(null);
            setSuccessMessage(null);
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isEntering: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        if (isEntering) {
            setIsDragging(true);
        } else {
            setIsDragging(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setError(null);
            setSuccessMessage(null);
            setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
            e.dataTransfer.clearData();
        }
    }, []);

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleDeleteUploadedPhoto = async (photoId: string) => {
        if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพที่เพิ่งอัปโหลดนี้?")) {
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

            // อัปเดต UI โดยการกรองรูปภาพที่ถูกลบออกไป
            setUploadedPhotos(prevPhotos => prevPhotos.filter(p => p.id !== photoId));
            setSuccessMessage("ลบรูปภาพสำเร็จ");

        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!activityTitle || !activityDate || !studentId) {
            setError("ข้อมูลกิจกรรมไม่ครบถ้วน");
            return;
        }
        if (files.length === 0) {
            setError("กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        const formData = new FormData();
        // เพิ่มข้อมูลกิจกรรมลงใน FormData
        formData.append('title', activityTitle);
        if(activityDetail) formData.append('detail', activityDetail);
        formData.append('date', activityDate);
        formData.append('studentId', studentId);

        // เพิ่มไฟล์
        files.forEach(file => {
            formData.append('file', file);
        });

        try {
            const response = await fetch('/api/student-activities/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
            }

            setSuccessMessage(`บันทึกกิจกรรมและอัปโหลด ${result.photos.length} รูปภาพสำเร็จ!`);
            setUploadedPhotos(prev => [...prev, ...result.photos]);
            setFiles([]); // Clear selected files after successful upload

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!activityTitle || !activityDate || !studentId) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900 text-white text-center p-4">
                <h1 className="text-2xl font-bold text-red-500 mb-4">เกิดข้อผิดพลาด</h1>
                <p className="text-lg mb-6">ไม่พบข้อมูลกิจกรรมที่ต้องการอัปโหลดรูปภาพ</p>
                <button onClick={() => router.push('/student/activities')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    กลับไปหน้ากิจกรรม
                </button>
            </div>
        );
    }

    return (
        <main className="p-4 sm:p-6 md:p-8 text-white">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                    อัปโหลดรูปภาพกิจกรรม
                </h1>
                <p className="text-center text-gray-300 mb-8 text-lg">สำหรับกิจกรรม: <span className="font-semibold text-purple-300">{activityTitle}</span></p>

                <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-2xl space-y-6">
                    {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">{error}</div>}
                    {successMessage && <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded-lg" role="alert">{successMessage}</div>}

                    <div
                        onDragEnter={(e) => handleDragEvents(e, true)}
                        onDragLeave={(e) => handleDragEvents(e, false)}
                        onDragOver={(e) => handleDragEvents(e, true)}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors duration-300 ${isDragging ? 'border-blue-500 bg-gray-700' : 'border-gray-600 hover:border-blue-400'}`}
                    >
                        <input
                            id="file-upload"
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <p className="text-gray-400">ลากไฟล์มาวางที่นี่ หรือ <span className="font-semibold text-blue-400">คลิกเพื่อเลือกไฟล์</span></p>
                            <p className="text-xs text-gray-500 mt-2">รองรับหลายไฟล์ | ขนาดไฟล์สูงสุด 5MB</p>
                        </label>
                    </div>

                    {files.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-2">ไฟล์ที่เลือก ({files.length}):</h3>
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

                    <button type="submit" disabled={isLoading || files.length === 0} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex justify-center items-center">
                        {isLoading ? 'กำลังอัปโหลด...' : `อัปโหลด ${files.length} ไฟล์`}
                    </button>
                </form>

                {uploadedPhotos.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold mb-6 text-center">รูปภาพที่อัปโหลดสำเร็จ</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {uploadedPhotos.map(photo => (
                                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden shadow-lg group">
                                    <Image
                                        src={photo.url}
                                        alt={photo.filename}
                                        fill
                                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                        style={{ objectFit: 'cover' }}
                                        className="transition-transform duration-300 hover:scale-110"
                                    />
                                    <button
                                        onClick={() => handleDeleteUploadedPhoto(photo.id)}
                                        className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        aria-label="ลบรูปภาพ"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

// ใช้ Suspense เพื่อรอให้ useSearchParams ทำงานเสร็จก่อน
export default function UploadPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">กำลังโหลด...</div>}>
            <UploadPageComponent />
        </Suspense>
    );
}