import { SlashCommandBuilder } from "@discordjs/builders";
import { EmbedBuilder } from "discord.js";
import { Logtail } from "@logtail/node";
import { getUser } from "../database.js";
import { timeFormatting } from "../helpers.js";

const logtail = new Logtail(process.env.SOURCE_TOKEN);

let COMMAND_DEFINITION = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription(
    "Replies with the leaderboard of the time spent in voice channels!",
  );

async function getLeaderboard(interaction) {
  try {
    const databaseUser = await getUser();
    let totalTime = 0

    const leaderboardEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`${interaction.guild.name}'s leaderboard`)
      .setThumbnail(interaction.guild.iconURL())
      .setTimestamp()
      .addFields(
        databaseUser.map((user, index) => {
          let formattedInfos = timeFormatting(user.time)
          totalTime += user.time
          return {
            name: `${index + 1}. ${user.discordname}`,
            value: `${formattedInfos.formattedTime} (${formattedInfos.avgTime}/day`,
          };
        }).concat([{
          name: "Total time spent",
          value: `The server spent a total of ${timeFormatting(totalTime).formattedTime} in voice channels. (${timeFormatting(totalTime).avgTime}/day)`,
        }])
      )
      .setFooter({
        text: "You need to quit the voice channel to update the time!",
        iconURL: interaction.guild.iconURL(),
      });
    return { embeds: [leaderboardEmbed] };
  } catch (error) {
    logtail.error(error);
  }
}

async function run(interaction) {
  const response = await getLeaderboard(interaction);
  if (response == null) {
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
    return;
  } else {
    await interaction.reply(response);
    logtail.info(`Leaderboard command executed by ${interaction.user.username}`,);
  }
}

export { COMMAND_DEFINITION, run };