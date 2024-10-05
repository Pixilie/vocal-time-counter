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
import { getUser, getServer } from "../database.js";
import { timeFormatting, dateFormatting, Logging } from "../helpers.js";

let COMMAND_DEFINITION = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription(
    "User classification according to the time they spent in a voice channel",
  );

let CONTEXT_DEFINITION = new ContextMenuCommandBuilder()
  .setName("Server leaderboard")
  .setType(ApplicationCommandType.User);

/**
 * Fetch server leaderboard
 * @param {Interaction} interaction - The interection object
 * @returns {Embed} - The embed object
 */
async function getLeaderboard(interaction) {
  try {
    const databaseUsers = await getUser(interaction.guild.id);
    const server = await getServer(interaction.guild.id);
    let totalTime = 0;

    if (databaseUsers.length === 0) {
      return {
        state: 200,
        content:
          "No user ever joined a voice channel in this server therefore VTC doesn't have any data to show you.",
      };
    }

    const leaderboardEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`${interaction.guild.name}'s leaderboard`)
      .setThumbnail(interaction.guild.iconURL())
      .setTimestamp()
      .addFields(
        databaseUsers
          .map((user, index) => {
            let formattedInfos = timeFormatting(user.TIME, server.DATE);
            totalTime += user.TIME;
            return {
              name: `${index + 1}. ${user.USERNAME}`,
              value: `${formattedInfos.formattedTime} - ${formattedInfos.avgTime}/day`,
            };
          })
          .concat([
            {
              name: "Total time spent",
              value: `Total time since ${dateFormatting(server.DATE).formattedDate} (${dateFormatting(server.DATE).difference} day(s) ago): ${timeFormatting(totalTime, server.DATE).formattedTime} - ${timeFormatting(totalTime, server.DATE).avgTime}/day`,
            },
          ]),
      )
      .setFooter({
        text: "You need to quit the voice channel to update the time!",
        iconURL: interaction.guild.iconURL(),
      });
    return { state: 200, embeds: [leaderboardEmbed] };
  } catch (error) {
    return {
      state: 400,
      content: `There was an error while executing the command, please contact an administrator with this code: ${Date.now()} `,
      error: error,
      code: Date.now(),
    };
  }
}

/**
 * Run /leaderboard command
 * @param {Interaction} interaction - The interaction object
 * @returns {InteractionResponse} - Reply to the user's request
 */
async function run(interaction) {
  try {
    const response = await getLeaderboard(interaction);
    if (response.state === 200 && response.embeds != undefined) {
      await interaction.reply({ embeds: response.embeds, ephemeral: true });
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
