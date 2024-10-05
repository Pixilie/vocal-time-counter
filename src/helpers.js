import "dotenv/config";
import { Logtail } from "@logtail/node";
import { newUser, getUser, updateUser, getServer } from "./database.js";

const logtail = new Logtail(process.env.SOURCE_TOKEN);

/**
 * Track when a user is active in a voice channel
 * @param {String} userID - Discord ID of the user
 * @param {String} username - Discord name of the user
 * @param {String} serverID - Server ID the user is on
 */
async function startActivity(userID, username, serverID) {
  try {
    const lastJoined = new Date().getTime();
    const databaseUser = await getUser(serverID, userID);

    if (databaseUser === null) {
      await newUser(userID, username, serverID, lastJoined);
    } else {
      await updateUser(userID, username, serverID, lastJoined);
    }
  } catch (error) {
    Logging.error(error);
  }
}

/**
 * Track when a user is inactive in a voice channel
 * @param {String} userID - Discord ID of the user
 * @param {String} username - Discord name of the user
 * @param {String} serverID - Server ID the user is on
 */
async function stopActivity(userID, username, serverID) {
  try {
    const lastLeft = new Date().getTime();
    const databaseUser = await getUser(serverID, userID);
    const time = databaseUser.TIME + (lastLeft - databaseUser.LAST_JOINED);

    await updateUser(userID, username, serverID, lastLeft, time);
  } catch (error) {
    Logging.error(error);
  }
}

/**
 * Format the time in hours, minutes, and seconds
 * @param {Number} unformattedTime - The time in seconds
 * @param {Float} joinedDate - Date on which VTC joined the server
 * @returns {Object} ? - The formatted time and the average time
 */
function timeFormatting(unformattedTime, joinedDate) {
  const date = new Date().getTime();
  let difference = Math.round((date - joinedDate) / (1000 * 3600 * 24));

  difference === 0 ? (difference = 1) : difference;

  const hours = Math.floor(unformattedTime / 1000 / 3600);
  const minutes = Math.floor(((unformattedTime / 1000) % 3600) / 60);
  const seconds = Math.floor((unformattedTime / 1000) % 60);
  let formattedTime = "";

  if (minutes === 0 && hours === 0) {
    formattedTime = seconds + "sec";
  } else if (hours === 0) {
    formattedTime = minutes + "min " + seconds + "sec";
  } else {
    formattedTime = hours + "h " + minutes + "min " + seconds + "sec";
  }

  const avgHours = Math.floor(unformattedTime / 1000 / 3600 / difference);
  const avgMinutes = Math.floor(
    ((unformattedTime / 1000) % 3600) / 60 / difference,
  );
  const avgSeconds = Math.floor(((unformattedTime / 1000) % 60) / difference);
  let avgTime = "";

  if (avgHours === 0 && avgMinutes === 0) {
    avgTime = avgSeconds + "sec";
  } else if (avgHours === 0) {
    avgTime = avgMinutes + "min " + avgSeconds + "sec";
  } else {
    avgTime = avgHours + "h " + avgMinutes + "min " + avgSeconds + "sec";
  }

  return { formattedTime, avgTime };
}

/**
 * Format a date in the format d/m/y
 * @param {Float} date - Date on which VTC joined the server
 * @returns {Object} ? - The formatted date in the format d/m/y and the difference to today
 */
function dateFormatting(date) {
  const formattedJoinedDate = new Date(date);

  let formattedJoinedDateDay = formattedJoinedDate.getDate();
  let formattedJoinedMonth = formattedJoinedDate.getMonth();
  let formattedJoinedYear = formattedJoinedDate.getFullYear();

  const difference = Math.round(
    (new Date().getTime() - date) / (1000 * 3600 * 24),
  );

  return {
    formattedDate: `${formattedJoinedDateDay}/${formattedJoinedMonth}/${formattedJoinedYear}`,
    difference: difference,
  };
}

const Logging =
  process.env.IS_DEV === "True"
    ? {
        error: console.error,
        info: console.log,
        warn: console.warn,
      }
    : {
        error: (msg) => logtail.error(msg),
        info: (msg) => logtail.info(msg),
        warn: (msg) => logtail.warn(msg),
      };

export { stopActivity, startActivity, timeFormatting, dateFormatting, Logging };
