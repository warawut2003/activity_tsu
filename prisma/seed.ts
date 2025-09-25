import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


async function seedStudent() {
    await prisma.student.createMany({
        data: [
            { name: "Alice"},
            { name: "Bob"},
            { name: "Charlie"},
            { name: "Dave"},
            { name: "Eve"},
        ],
    });
}

async function main() {
    await seedStudent();
    console.log(" Seeded data successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    })