import { prisma } from "./lib/prisma";

async function main() {
  console.log("Testing database connection...");

  const username = `phase2_test_${Date.now()}`;

  // WRITE
  const createdUser = await prisma.user.create({
    data: {
      username,
      passwordHash: "temporary_test_hash",
    },
  });

  console.log("User created:");
  console.log(createdUser);

  // READ
  const foundUser = await prisma.user.findUnique({
    where: {
      id: createdUser.id,
    },
  });

  console.log("User read from database:");
  console.log(foundUser);

  // CLEAN UP
  await prisma.user.delete({
    where: {
      id: createdUser.id,
    },
  });

  console.log("Test user deleted.");
  console.log("Database read/write test successful!");
}

main()
  .catch((error) => {
    console.error("Database test failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });