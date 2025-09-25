import { NextRequest , NextResponse }  from "next/server";
import formidable from 'formidable';
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';

export const config = {
    api : {
        bodyParser : false,
    }
}

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        if (value) {
            chunks.push(value);
        }
    }
    return Buffer.concat(chunks);
}


export async function POST(req : NextRequest){
    try {
        const uploadDir = 'public/uploads';
        // ตรวจสอบและสร้างโฟลเดอร์ uploads หากยังไม่มี (เปลี่ยนเป็นแบบ async)
        await fs.promises.mkdir(uploadDir, { recursive: true });

        const formData = await req.formData();
        const files = formData.getAll('file') as File[];
        const uploaderId = formData.get('uploaderId') as string;

        if (!files || files.length === 0) {
            return NextResponse.json({ message: 'ไม่พบไฟล์ที่อัปโหลด' }, { status: 400 });
        }

        const uploadedFileData = [];

        for (const file of files) {
            // เช็คขนาดไฟล์ด้วยตนเอง
            const maxFileSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxFileSize) {
                // ส่ง response กลับไปทันทีถ้าไฟล์ใหญ่เกิน
                return NextResponse.json({ message: `ขนาดไฟล์ ${file.name} เกิน 5MB` }, { status: 413 });
            }

            // สร้างชื่อไฟล์ใหม่
            const uniqueSuffix = uuidv4();
            const originalName = file.name.replace(/\s/g, '_');
            const newFilename = `${uniqueSuffix}-${originalName}`;
            const filepath = `${uploadDir}/${newFilename}`;

            // แปลงไฟล์เป็น Buffer เพื่อบันทึก
            const buffer = Buffer.from(await file.arrayBuffer());
            await fs.promises.writeFile(filepath, buffer);
            
            uploadedFileData.push({
                newFilename: newFilename,
                originalFilename: file.name,
                filepath: filepath,
                mimetype: file.type,
                size: file.size,
            });
        }
        
        // ส่งข้อมูลที่จำเป็นกลับไป, fields จะมีแค่ uploaderId
        return NextResponse.json({ 
            fields: { uploaderId: [uploaderId] }, // ทำให้โครงสร้างคล้าย formidable
            files: { file: uploadedFileData } // ทำให้โครงสร้างคล้าย formidable
        }, { status: 200 });
    } catch (error: any) {
        console.error('Upload error:', error);

        if (error.code === 1009) { // formidable's maxTotalFileSize exceeded error code
            return NextResponse.json({ message: 'ขนาดไฟล์เกิน 5MB' }, { status: 413 }); // 413 Payload Too Large
        }

        return NextResponse.json({ message: 'เกิดข้อผิดพลาดระหว่างการอัปโหลดไฟล์' }, { status: 500 });
    }
}