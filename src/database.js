import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Create a new user in the database
 * @param {String} userID - The user's Discord ID
 * @param {String} username - The discord name of the user
 * @param {String} serverID - The serverID the user is on
 * @param {BigInt} lastJoined - The current timestamp
 * @param {Float} time - The user's total time in the voice channel
 */
async function newUser(userID, username, serverID, lastJoined) {
  await prisma.user.create({
    data: {
      USER_ID: userID,
      USERNAME: username,
      SERVER_ID: serverID,
      LAST_JOINED: lastJoined,
      TIME: 0,
      STREAMING_TIME: 0,
      MUTED_TIME: 0,
    },
  });
}

/**
 * Get the user's information from the database
 * @param {String} serverID - The serverID the user in on
 * @param {String | null} userID - The user's Discord ID
 */
async function getUser(serverID, userID = null) {
  if (userID === null) {
    const users = await prisma.user.findMany({
      where: { SERVER_ID: serverID },
      orderBy: { TIME: "desc" },
    });
    return users;
  }
  const user = await prisma.user.findUnique({
    where: { USER: { USER_ID: userID, SERVER_ID: serverID } },
  });
  return user;
}

/**
 * Update the user's time and lastjoined timestamp in the database
 * @param {String} userID - The user's Discord ID
 * @param {String} username - The Discord name of the user
 * @param {String} serverID - The serverID the user is on
 * @param {BigInt} timestamp - The current timestamp
 * @param {Float | null} time - The user's total time in the voice channel
 */
async function updateUser(userID, username, serverID, timestamp, time = null) {
  if (time === null) {
    await prisma.user.update({
      where: { USER: { USER_ID: userID, SERVER_ID: serverID } },
      data: { USERNAME: username, LAST_JOINED: timestamp },
    });
  } else {
    await prisma.user.update({
      where: { USER: { USER_ID: userID, SERVER_ID: serverID } },
      data: { USERNAME: username, TIME: time, LAST_JOINED: timestamp },
    });
  }
}

/**
 * Delete a user from the database
 * @param {String} - serverID - The serverID the user in on
 * @param {String | null} userID - The user's Discord ID
 */
async function deleteUser(serverID, userID = null) {
  if (userID === null) {
    await prisma.user.deleteMany({
      where: { SERVER_ID: serverID },
    });
  } else {
    await prisma.user.delete({
      where: { USER: { USER_ID: userID, SERVER_ID: serverID } },
    });
  }
}

export { newUser, getUser, updateUser, deleteUser };
