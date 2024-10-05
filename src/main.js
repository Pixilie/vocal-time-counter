import "dotenv/config";
import { REST, Routes } from "discord.js";
import { Client, GatewayIntentBits } from "discord.js";

import { stopActivity, startActivity, Logging } from "./helpers.js";
import * as pingCommand from "./commands/ping.js";
import * as timeCommand from "./commands/time.js";
import * as leaderboardCommand from "./commands/leaderboard.js";
import * as deleteCommand from "./commands/delete.js";
import * as registerCommand from "./commands/register.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});
const commands = [
  pingCommand.COMMAND_DEFINITION,
  timeCommand.COMMAND_DEFINITION,
  timeCommand.CONTEXT_DEFINITION,
  leaderboardCommand.COMMAND_DEFINITION,
  leaderboardCommand.CONTEXT_DEFINITION,
  deleteCommand.COMMAND_DEFINITION,
  deleteCommand.CONTEXT_DEFINITION,
  registerCommand.COMMAND_DEFINITION,
].map((command) => command.toJSON());
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

if (process.env.IS_DEV === "True") {
  console.log("DEVELOPER MODE ON");
  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.DEV_GUILD,
    ),
    { body: commands },
  );
} else {
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
    body: commands,
  });
}

client.on("ready", () => {
  Logging.info(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand() && !interaction.isUserContextMenuCommand())
    return;

  switch (interaction.commandName) {
    case "ping":
      pingCommand.run(interaction);
      break;

    case "time":
      timeCommand.run(interaction);
      break;
    case "User's stats":
      timeCommand.run(interaction);
      break;

    case "leaderboard":
      leaderboardCommand.run(interaction);
      break;
    case "Server leaderboard":
      leaderboardCommand.run(interaction);
      break;

    case "delete":
      deleteCommand.run(interaction);
      break;
    case "Delete this user":
      deleteCommand.run(interaction);
      break;

    case "register":
      registerCommand.run(interaction);
      break;

    default:
      break;
  }
});

let voiceIsMuteOrDeaf = (state) =>
  state.selfMute || state.selfDeafen || state.serverMute || state.serverDeafen;

client.on("voiceStateUpdate", (oldState, newState) => {
  const userID = oldState.member.user.id;
  const serverID = oldState.guild.id;
  const username = oldState.member.user.displayName;

  // Auxiliary data
  if (oldState.selfVideo !== newState.selfVideo) {
    if (newState.selfVideo) {
      Logging.info(`User ${newState.id} started self video`);
    } else {
      Logging.info(`User ${newState.id} stopped self video`);
    }
  }
  if (oldState.streaming !== newState.streaming) {
    if (newState.streaming) {
      Logging.info(`User ${newState.id} started streaming`);
    } else {
      Logging.info(`User ${newState.id} stopped streaming`);
    }
  }

  // Start activity on join channel
  if (oldState.channelId === null && !voiceIsMuteOrDeaf(newState)) {
    startActivity(userID, username, serverID);
    return;
  }

  // Stop activity on leave channel or muting/deafening
  if (newState.channelId === null) {
    stopActivity(userID, username, serverID);
    return;
  }

  // Start/Stop activity on user mute/deafen
  if (voiceIsMuteOrDeaf(oldState) !== voiceIsMuteOrDeaf(newState)) {
    if (voiceIsMuteOrDeaf(oldState)) {
      startActivity(userID, username, serverID);
    } else {
      stopActivity(userID, username, serverID);
    }
    return;
  }

  Logging.warn("Untracked voice state change detected");
});

client.login(process.env.TOKEN);
