import "dotenv/config";
import { Application, REST, Routes } from "discord.js";
import { Client, GatewayIntentBits } from "discord.js";
import { Logtail } from "@logtail/node";
import { onLeft, onJoin, onMuteDeafen } from "./helpers.js";
import * as pingCommand from "./commands/ping.js";
import * as timeCommand from "./commands/time.js";
import * as leaderboardCommand from "./commands/leaderboard.js";
import * as deleteCommand from "./commands/delete.js";

const logtail = new Logtail(process.env.SOURCE_TOKEN);
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
].map((command) => command.toJSON());
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

if (process.env.IS_DEV) {
  console.log("DEVELOPER MODE ON")
  await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD), { body: commands });
} else {
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  logtail.info(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand() && !interaction.isUserContextMenuCommand()) return;

  switch (interaction.commandName) {
    case "ping":
      pingCommand.run(interaction);
      break;

    case "time":
      timeCommand.run(interaction);
      break;
    case "time-menu":
      timeCommand.run(interaction);
      break;

    case "leaderboard":
      leaderboardCommand.run(interaction);
      break;
    case "leaderboard-menu":
      leaderboardCommand.run(interaction);
      break;

    case "delete":
      deleteCommand.run(interaction);
      break;
    case "delete-menu":
      deleteCommand.run(interaction);
      break;

    default:
      break;
  }
});

client.on("voiceStateUpdate", (oldState, newState) => {
  if (newState.channelId === null) {
    if (oldState.channelId !== oldState.guild.afkChannelId) {
      if (newState.serverMute || newState.serverDeafen || newState.selfMute || newState.selfDeafen) {
        return;
      } else {
        onLeft(oldState);
      }
    } else {
      return;
    }
  } else if (oldState.channelId === null) {
    if (newState.channelId !== newState.guild.afkChannelId) {
      if (newState.serverMute || newState.serverDeafen || newState.selfMute || newState.selfDeafen) {
        return;
      } else {
        onJoin(newState);
      }
    } else {
      return;
    }
  } else {
    if (oldState.channelId !== newState.channelId) {
      if (newState.channelId === newState.guild.afkChannelId) {
        onLeft(oldState);
      } else {
        return;
      }
    } else if (oldState.serverDeaf !== newState.serverDeaf || oldState.serverMute !== newState.serverMute || oldState.selfDeaf !== newState.selfDeaf || oldState.selfMute !== newState.selfMute) {
      onMuteDeafen(newState, oldState);
    } else if (oldState.selfVideo !== newState.selfVideo) {
      console.log("Self video");
    } else if (oldState.streaming !== newState.streaming) {
      console.log("Streaming");
    } else {
      logtail.warn("Untracked voice state change detected.");
    }
  }
});

client.login(process.env.TOKEN);
