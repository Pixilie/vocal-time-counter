import {
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
} from "@discordjs/builders";
import {
  Embed,
  EmbedBuilder,
  ApplicationCommandType,
  InteractionResponse,
} from "discord.js";
import { getUser } from "../database.js";
import { timeFormatting, dateFormatting, Logging } from "../helpers.js";

let COMMAND_DEFINITION = new SlashCommandBuilder()
  .setName("time")
  .setDescription("Detailed user profile.");

let CONTEXT_DEFINITION = new ContextMenuCommandBuilder()
  .setName("User's stats")
  .setType(ApplicationCommandType.User);

/**
 * Get the time spent in voice channels by a user
 * @param {Interaction} - The interaction object
 * @returns {Embed} - The embed object
 */
async function getTime(interaction) {
  try {
    let databaseUser = await getUser(
      interaction.guild.id,
      interaction.isUserContextMenuCommand()
        ? interaction.targetUser.id
        : interaction.user.id,
    );
    let username = interaction.isUserContextMenuCommand()
      ? interaction.targetUser.username
      : interaction.user.username;
    let userAvatar = interaction.isUserContextMenuCommand()
      ? interaction.targetUser.avatarURL()
      : interaction.user.avatarURL();

    if (databaseUser === null) {
      let message =
        username === interaction.user.username
          ? "You never joined a voice channel before therefore VTC doesn't have any data on you."
          : `${interaction.targetUser.username} never joined a voice channel before therefore VTC doesn't have any data on this user.`;
      return {
        state: 200,
        content: message,
      };
    }

    const lastJoined = new Date(databaseUser.LAST_JOINED);
    let joinedDate = interaction.guild.joinedTimestamp;

    let formattedInfos = timeFormatting(databaseUser.TIME, joinedDate);

    const timeCommand = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`${username}'s stats`)
      .setTimestamp()
      .setThumbnail(userAvatar)
      .addFields(
        {
          name: "Time spent in voice channels",
          value: `${formattedInfos.formattedTime} since the ${dateFormatting(joinedDate).formattedDate} - ${dateFormatting(joinedDate).difference} day(s) ago`,
        },
        {
          name: "Streaming time",
          value: "Coming soon",
        },
        {
          name: "Muted/Deafen time",
          value: "Coming soon",
        },
        {
          name: `Last time ${interaction.user.username} was in a voice channel`,
          value: `On ${lastJoined.getDate()}/${String(parseInt(lastJoined.getMonth()) + 1)}/${lastJoined.getFullYear()} at ${lastJoined.getHours()}:${lastJoined.getMinutes()}`,
        },
        {
          name: "Average time spent in voice channels",
          value: `${formattedInfos.avgTime}/day`,
        },
      )
      .setFooter({
        text: "You need to quit the voice channel to update the time!",
        iconURL: interaction.guild.iconURL(),
      });
    return { state: 200, embeds: [timeCommand] };
  } catch (error) {
    return {
      state: 400,
      content: `There was an error while executing the command, please contact an administrator with this code: ${Date.now()}`,
      error: error,
      code: Date.now(),
    };
  }
}

/**
 * Run the time command
 * @param {Interaction} interaction - The interaction object
 * @returns {InteractionResponse} - Reply to the user's request
 */
async function run(interaction) {
  try {
    const response = await getTime(interaction);
    if (response.state === 200 && response.embeds != undefined) {
      await interaction.reply({
        embeds: response.embeds,
        ephemeral: true,
      });
    } else if (response.state === 400) {
      await interaction.reply({ content: response.content, ephemeral: true });
      Logging.error({ code: response.code, error: response.error });
    } else {
      await interaction.reply({
        content: response.content,
        ephemeral: true,
      });
    }
  } catch (error) {
    Logging.error({ code: Date.now(), error: error });
  }
}

export { COMMAND_DEFINITION, CONTEXT_DEFINITION, run };
