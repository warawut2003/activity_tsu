-- CreateTable
CREATE TABLE "public"."Student" (
    "std_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("std_id")
);

-- CreateTable
CREATE TABLE "public"."StudentActivity" (
    "std_act_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "StudentActivity_pkey" PRIMARY KEY ("std_act_id")
);

-- CreateTable
CREATE TABLE "public"."StudentActivityPhoto" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activityId" TEXT NOT NULL,

    CONSTRAINT "StudentActivityPhoto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."StudentActivity" ADD CONSTRAINT "StudentActivity_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("std_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentActivityPhoto" ADD CONSTRAINT "StudentActivityPhoto_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."StudentActivity"("std_act_id") ON DELETE RESTRICT ON UPDATE CASCADE;
