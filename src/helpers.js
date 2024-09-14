import { Logtail } from "@logtail/node";
import { newUser, getUser, updateUser } from "./database.js";

const logtail = new Logtail(process.env.SOURCE_TOKEN);

/**
* Track when a user leaves the voice channel
* @param {Object} oldState - The old state of the user
*/
async function onLeft(oldState) {
  try {
    const lastLeft = new Date().getTime() / 1000;
    const databaseUser = await getUser(oldState.guild.id, oldState.member.user.username);
    const time = databaseUser.time + (lastLeft - databaseUser.lastjoined);

    await updateUser(oldState.member.user.username, lastLeft, oldState.guild.id, time);
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
    const lastJoined = new Date().getTime() / 1000;
    const databaseUser = await getUser(newState.guild.id, newState.member.user.username);

    if (databaseUser === null) {
      await newUser(newState.member.user.username, lastJoined, newState.guild.id);
    } else {
      await updateUser(newState.member.user.username, lastJoined, newState.guild.id);
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

      const lastLeft = new Date().getTime() / 1000;
      const databaseUser = await getUser(newState.guild.id, newState.member.user.username);
      const time = databaseUser.time + (lastLeft - databaseUser.lastjoined);

      await updateUser(newState.member.user.username, lastLeft, newState.guild.id, time);

    } else if (oldState.serverMute || oldState.serverDeafen || oldState.selfMute || oldState.selfDeafen) {

      const lastJoined = new Date().getTime() / 1000;

      await updateUser(oldState.member.user.username, lastJoined, oldState.guild.id);
    }
  } catch (error) {
    logtail.error(error);
  }
}

/**
* Format the time in hours, minutes, and seconds
* @param {Number} unformattedTime - The time in seconds
* @param {Int} timestamp - Date o which VTC joined the server
* @returns {Object} - The formatted time and the average time
*/
function timeFormatting(unformattedTime, joinedDate) {
  const date = new Date();
  let difference = Math.round((date.getTime() - joinedDate) / (1000 * 3600 * 24));

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

/**
* Format a date in the format d/m/y
* @param {Int} timestamp - Date on which VTC joined the server
* @returns {Object} formattedDate & difference - The formatted date in the format d/m/y and the difference to today
*/
function dateFormatting(date) {
  const formattedJoinedDate = new Date(date)

  let formattedJoinedDateDay = formattedJoinedDate.getDate()
  let formattedJoinedMonth = formattedJoinedDate.getMonth()
  let formattedJoinedYear = formattedJoinedDate.getFullYear()

  const difference = Math.round((new Date().getTime() - date) / (1000 * 3600 * 24));

  return { formattedDate: `${formattedJoinedDateDay}/${formattedJoinedMonth}/${formattedJoinedYear}`, difference: difference }
}

export { onLeft, onJoin, onMuteDeafen, timeFormatting, dateFormatting };
