import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
* Create a new user in the database
* @param {String} discordname - The user's Discord name
* @param {Number} timestamp - The current timestamp
* @param {Number} time - The user's total time in the voice channel
*/
async function newUser(discordname, lastJoined, time = 0) {
  await prisma.user.create({
    data: { discordname: discordname, time: time, lastjoined: lastJoined, },
  });
}

/**
* Get the user's information from the database
* @param {String} discordname - The user's Discord name
*/
async function getUser(discordname = null) {
  if (discordname === null) {
    const users = await prisma.user.findMany({
      orderBy: { time: "desc", },
    });
    return users;
  }
  const user = await prisma.user.findUnique({
    where: { discordname: discordname, },
  });
  return user;
}

/**
* Update the user's time and lastjoined timestamp in the database
* @param {String} discordName - The user's Discord name
* @param {Number} timestamp - The current timestamp
* @param {Number} time - The user's total time in the voice channel
*/
async function updateUser(discordName, timestamp, time = null) {
  if (time === null) {
    await prisma.user.update({
      where: { discordname: discordName, },
      data: { lastjoined: timestamp, },
    });
  } else {
    await prisma.user.update({
      where: { discordname: discordName, },
      data: { time: time, lastjoined: timestamp, },
    });
  }
}

/**
* Delete a user from the database
* @param {String} discordName - The user's Discord name
*/
async function deleteUser(discordName = null) {
  if (discordName === null) {
    await prisma.user.deleteMany();
  } else {
    await prisma.user.delete({
      where: { discordname: discordName, },
    });
  }
}

export { newUser, getUser, updateUser, deleteUser };
