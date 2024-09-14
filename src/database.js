import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
* Create a new user in the database
* @param {String} discordName - The user's Discord name
* @param {Float} timestamp - The current timestamp
* @param {BigInt} serverId - The serverID the user is on
* @param {Float} time - The user's total time in the voice channel
*/
async function newUser(discordName, lastJoined, serverId, time = 0) {
  await prisma.user.create({
    data: { discordname: discordName, time: time, lastjoined: lastJoined, server: parseInt(serverId), streamingtime: 0, mutedtime: 0, },
  });
}

/**
* Get the user's information from the database
* @param {BigInt} serverId - The serverID the user in on
* @param {String | null} discordName - The user's Discord name
*/
async function getUser(serverId, discordName = null) {
  if (discordName === null) {
    const users = await prisma.user.findMany({
      where: { server: parseInt(serverId), },
      orderBy: { time: "desc", },
    });
    return users;
  }
  const user = await prisma.user.findUnique({
    where: { user: { discordname: discordName, server: parseInt(serverId), }, },
  });
  return user;
}

/**
* Update the user's time and lastjoined timestamp in the database
* @param {String} discordName - The user's Discord name
* @param {Float} timestamp - The current timestamp
* @param {BigInt} serverid - The serverID the user is on
* @param {Float | null} time - The user's total time in the voice channel
*/
async function updateUser(discordName, timestamp, serverid, time = null) {
  if (time === null) {
    await prisma.user.update({
      where: { user: { discordname: discordName, server: parseInt(serverid), }, },
      data: { lastjoined: timestamp, },
    });
  } else {
    await prisma.user.update({
      where: { user: { discordname: discordName, server: parseInt(serverid), }, },
      data: { time: time, lastjoined: timestamp, },
    });
  }
}

/**
* Delete a user from the database
* @param {BigInt} - serverid - The serverID the user in on
* @param {String | null} discordName - The user's Discord name
*/
async function deleteUser(serverId, discordName = null) {
  if (discordName === null) {
    await prisma.user.deleteMany({
      where: { server: parseInt(serverId), }
    });
  } else {
    await prisma.user.delete({
      where: { user: { discordname: discordName, server: parseInt(serverId), }, },
    });
  }
}

export { newUser, getUser, updateUser, deleteUser };
