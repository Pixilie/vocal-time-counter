import { newUser, getUser, updateUser } from "./database.mjs";
import { Logtail } from "@logtail/node";

const logtail = new Logtail(process.env.SOURCE_TOKEN);

async function onLeft(oldState) {
  try {
    const discordUser = oldState.member.user.username;
    const lastLeft = new Date().getTime() / 1000;
    logtail.info(`${discordUser} left`);

    const databaseUser = await getUser(discordUser);
    const time = databaseUser.time + (lastLeft - databaseUser.lastjoined);
    await updateUser(discordUser, lastLeft, time);
  } catch (error) {
    logtail.error(error);
  }
}

async function onJoin(newState) {
  try {
    const discordUser = newState.member.user.username;
    const lastJoined = new Date().getTime() / 1000;
    logtail.info(`${discordUser} joined`);

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

async function onMuteDeafen(newState, oldState) {
  try {
    if (
      newState.serverMute ||
      newState.serverDeafen ||
      newState.selfMute ||
      newState.selfDeafen
    ) {
      const discordUser = newState.member.user.username;
      const lastLeft = new Date().getTime() / 1000;
      const databaseUser = await getUser(discordUser);
      const time =
        databaseUser.time + lastLeft - databaseUser.lastjoined / 1000;
      await updateUser(discordUser, lastLeft, time);
      logtail.info(`${discordUser} muted or deafened`);
    } else if (
      oldState.serverMute ||
      oldState.serverDeafen ||
      oldState.selfMute ||
      oldState.selfDeafen
    ) {
      const discordUser = oldState.member.user.username;
      const lastJoined = new Date().getTime();
      await updateUser(discordUser, lastJoined);
      logtail.info(`${discordUser} unmuted or undeafened`);
    }
  } catch (error) {
    logtail.error(error);
  }
}

export { onLeft, onJoin, onMuteDeafen };
