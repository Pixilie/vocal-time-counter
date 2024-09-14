import { newUser, getUser, updateUser } from "./database.js";
import { Logtail } from "@logtail/node";

const logtail = new Logtail(process.env.SOURCE_TOKEN);


/**
* Track when a user leaves the voice channel
* @param {Object} oldState - The old state of the user
*/
async function onLeft(oldState) {
  try {
    const discordUser = oldState.member.user.username;
    const lastLeft = new Date().getTime() / 1000;

    const databaseUser = await getUser(discordUser);
    const time = databaseUser.time + (lastLeft - databaseUser.lastjoined);
    await updateUser(discordUser, lastLeft, time);
  } catch (error) {
    logtail.error(error);
  }
}

/**
* Track when a user joins the voice channel
* @param {Object} newState - The new state of the user
*/
async function onJoin(newState) {
  try {
    const discordUser = newState.member.user.username;
    const lastJoined = new Date().getTime() / 1000;

    const databaseUser = await getUser(discordUser);
    if (databaseUser === null) {
      await newUser(discordUser, lastJoined);
    } else {
      await updateUser(discordUser, lastJoined);
    }
  } catch (error) {
    logtail.error(error);
  }
}

/**
* Track when a user mutes or deafens themselves or gets muted or deafened by the server
* @param {Object} newState - The new state of the user
* @param {Object} oldState - The old state of the user
*/
async function onMuteDeafen(newState, oldState) {
  try {
    if (newState.serverMute || newState.serverDeafen || newState.selfMute || newState.selfDeafen) {

      const discordUser = newState.member.user.username;
      const lastLeft = new Date().getTime() / 1000;
      const databaseUser = await getUser(discordUser);
      const time = databaseUser.time + (lastLeft - databaseUser.lastjoined);

      await updateUser(discordUser, lastLeft, time);

    } else if (oldState.serverMute || oldState.serverDeafen || oldState.selfMute || oldState.selfDeafen) {

      const discordUser = oldState.member.user.username;
      const lastJoined = new Date().getTime() / 1000;

      await updateUser(discordUser, lastJoined);
    }
  } catch (error) {
    logtail.error(error);
  }
}

/**
* Format the time in hours, minutes, and seconds
* @param {Number} unformattedTime - The time in seconds
* @returns {Object} - The formatted time and the average time
*/
function timeFormatting(unformattedTime) {
  const date = new Date();
  const startDate = parseInt(process.env.START_DATE) * 1000;
  let difference = Math.round((date.getTime() - startDate) / (1000 * 3600 * 24));

  if (difference === 0) {
    difference = 1;
  }

  const hours = Math.floor(unformattedTime / 3600);
  const minutes = Math.floor((unformattedTime % 3600) / 60);
  const seconds = Math.floor(unformattedTime % 60);
  let formattedTime = "";

  if (minutes === 0 && hours === 0) {
    formattedTime = seconds + "sec";
  } else if (hours === 0) {
    formattedTime = minutes + "min " + seconds + "sec";
  } else {
    formattedTime = hours + "h " + minutes + "min " + seconds + "sec";
  }

  let avgTime = (hours * 3600 + minutes * 60 + seconds) / difference
  const avgHours = Math.floor(avgTime / 3600);
  const avgMinutes = Math.floor((avgTime % 3600) / 60);
  const avgSeconds = Math.floor(avgTime % 60);

  if (avgHours === 0 && avgMinutes === 0) {
    avgTime = avgSeconds + "sec";
  } else if (avgHours === 0) {
    avgTime = avgMinutes + "min " + avgSeconds + "sec";
  } else {
    avgTime = avgHours + "h " + avgMinutes + "min " + avgSeconds + "sec";
  }

  return { formattedTime, avgTime }
}

export { onLeft, onJoin, onMuteDeafen, timeFormatting };
