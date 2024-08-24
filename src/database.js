import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function newUser(discordname, lastJoined, time = 0) {
  await prisma.user.create({
    data: {discordname: discordname, time: time, lastjoined: lastJoined,},
  });
}

async function getUser(discordname = null) {
  if (discordname === null) {
    const users = await prisma.user.findMany({
      orderBy: {time: "desc",},
    });
    return users;
  }
  const user = await prisma.user.findUnique({
    where: {discordname: discordname,},
  });
  return user;
}

async function updateUser(discordName, timestamp, time = null) {
  if (time === null) {
    await prisma.user.update({
      where: {discordname: discordName,},
      data: {lastjoined: timestamp,},
    });
  } else {
    await prisma.user.update({
      where: {discordname: discordName,},
      data: {time: time,lastjoined: timestamp,},
    });
  }
}

async function deleteUser(discordName = null) {
  if (discordName === null) {
    await prisma.user.deleteMany();
  } else {
    await prisma.user.delete({
      where: {discordname: discordName,},
    });
  }
}

export { newUser, getUser, updateUser, deleteUser };
