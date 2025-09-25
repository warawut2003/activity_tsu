'use client';

import { useState, FormEvent, DragEvent } from 'react';

interface UploadedFile {
  newFilename: string;
  originalFilename: string;
  filepath: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploaderId, setUploaderId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setMessage('');
      setUploadedFiles([]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
      setMessage('');
      setUploadedFiles([]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length === 0) {
      setMessage('กรุณาเลือกไฟล์ที่ต้องการอัปโหลด');
      return;
    }
    if (!uploaderId) {
      setMessage('กรุณากรอกรหัสนิสิต');
      return;
    }

    setUploading(true);
    setMessage('กำลังอัปโหลด...');
    setUploadedFiles([]);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('file', file);
    });
    formData.append('uploaderId', uploaderId);

    try {
      const response = await fetch('/api/student-activities/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดบางอย่าง');
      }

      console.log('Server response:', data);
      setMessage(`อัปโหลดสำเร็จ!`);
      setUploadedFiles(data.files.file);

    } catch (error: any) {
      console.error('Upload failed:', error);
      setMessage(`อัปโหลดไม่สำเร็จ: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const dragDropStyles: React.CSSProperties = {
    border: `2px dashed ${isDragOver ? 'blue' : '#aaa'}`,
    padding: '20px',
    textAlign: 'center',
    borderRadius: '8px',
    backgroundColor: isDragOver ? '#f0f8ff' : '#f9f9f9',
    transition: 'border-color 0.3s, background-color 0.3s',
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: 'auto' }}>
      <h1>อัปโหลดไฟล์กิจกรรม</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={dragDropStyles}
        >
          <input id="file" type="file" multiple onChange={handleFileChange} disabled={uploading} style={{ display: 'none' }} />
          <label htmlFor="file" style={{ cursor: 'pointer', display: 'block' }}>
            ลากไฟล์มาวางที่นี่ หรือ <strong>คลิกเพื่อเลือกไฟล์</strong>
          </label>
          {files.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <strong>ไฟล์ที่เลือก:</strong> {files.map(f => f.name).join(', ')}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="uploaderId">รหัสนิสิต</label>
          <input id="uploaderId" type="text" value={uploaderId} onChange={(e) => setUploaderId(e.target.value)} disabled={uploading} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <button type="submit" disabled={uploading || files.length === 0 || !uploaderId} style={{ padding: '10px', cursor: 'pointer' }}>
          {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
        </button>
      </form>
      {message && <p style={{ marginTop: '20px' }}>{message}</p>}
      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>ไฟล์ที่อัปโหลดสำเร็จ:</h2>
          <ul>
            {uploadedFiles.map((file, index) => (
              <li key={index}>
                <a href={`/uploads/${file.newFilename}`} target="_blank" rel="noopener noreferrer">{file.originalFilename}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
