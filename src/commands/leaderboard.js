import { SlashCommandBuilder } from "@discordjs/builders";
import { Embed, EmbedBuilder } from "discord.js";
import { Logtail } from "@logtail/node";
import { getUser } from "../database.js";
import { timeFormatting, dateFormatting } from "../helpers.js";

const logtail = new Logtail(process.env.SOURCE_TOKEN);

let COMMAND_DEFINITION = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("User classification according to the time they spent in a voice channel",);

/**
* Fetch server leaderboard
* @param {Interaction} interaction - The interection object
* @returns {Embed} - The embed object
*/
async function getLeaderboard(interaction) {
  try {
    const databaseUser = await getUser(interaction.guild.id);
    const joinedDate = interaction.guild.joinedTimestamp
    let totalTime = 0

    const leaderboardEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`${interaction.guild.name}'s leaderboard`)
      .setThumbnail(interaction.guild.iconURL())
      .setTimestamp()
      .addFields(
        databaseUser.map((user, index) => {
          let formattedInfos = timeFormatting(user.time, joinedDate)
          totalTime += user.time
          return {
            name: `${index + 1}. ${user.discordname}`,
            value: `${formattedInfos.formattedTime} - ${formattedInfos.avgTime}/day`,
          };
        }).concat([{
          name: "Total time spent",
          value: `Total time since ${dateFormatting(joinedDate).formattedDate} (${dateFormatting(joinedDate).difference} day(s) ago): ${timeFormatting(totalTime, joinedDate).formattedTime} - ${timeFormatting(totalTime, joinedDate).avgTime}/day`,
        }])
      )
      .setFooter({
        text: "You need to quit the voice channel to update the time!",
        iconURL: interaction.guild.iconURL(),
      });
    return { state: 200, embeds: [leaderboardEmbed] };
  } catch (error) {
    return { state: 400, response: `There was an error while executing the command, please contact @pixilie with this code: ${Date.now()} `, error: error, code: Date.now() }
  }
}

/**
* Run /leaderboard command
* @param {Interaction} - The interaction object
* @returns {Interaction.reply} - Reply to the user's request
*/
async function run(interaction) {
  try {
    const response = await getLeaderboard(interaction);
    if (response.state === 200) {
      await interaction.reply(response);
    } else {
      await interaction.reply({ content: response.response, ephemeral: true, });
      logtail.error({ code: response.code, error: response.error })
    }
  } catch (error) {
    logtail.error({ code: Date.now(), error: error })
  }
}

export { COMMAND_DEFINITION, run };
