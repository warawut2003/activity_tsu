import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8 text-white bg-gray-900">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 pb-4">
          ระบบบันทึกกิจกรรมนิสิต
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-300">
          เครื่องมือสำหรับจัดการและรวบรวมหลักฐานการเข้าร่วมกิจกรรมของนิสิต
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Card 1: View Students */}
        <Link href="/students" className="block">
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 hover:border-cyan-400/50 hover:bg-gray-700/60 transition-all duration-300 transform hover:-translate-y-2 shadow-lg hover:shadow-cyan-500/10 h-full">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-cyan-900/50 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">รายชื่อนิสิตทั้งหมด</h2>
            <p className="mt-2 text-gray-400">
              ดูรายชื่อนิสิตทั้งหมดในระบบ และเข้าดูรายละเอียดกิจกรรมของแต่ละคน
            </p>
          </div>
        </Link>

        {/* Card 2: Manage Activities */}
        <Link href="/student/activities" className="block">
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 hover:border-purple-400/50 hover:bg-gray-700/60 transition-all duration-300 transform hover:-translate-y-2 shadow-lg hover:shadow-purple-500/10 h-full">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-900/50 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">จัดการและเพิ่มกิจกรรม</h2>
            <p className="mt-2 text-gray-400">
              เลือกกิจกรรมที่มีอยู่ หรือสร้างกิจกรรมใหม่เพื่อบันทึกและอัปโหลดรูปภาพ
            </p>
          </div>
        </Link>
      </div>
    </main>
  );
}
