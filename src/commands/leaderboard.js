import { SlashCommandBuilder } from "@discordjs/builders";
import { getUser } from "../database.js";
import { EmbedBuilder } from "discord.js";
import { Logtail } from "@logtail/node";

const logtail = new Logtail(process.env.SOURCE_TOKEN);

let COMMAND_DEFINITION = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription(
    "Replies with the leaderboard of the time spent in voice channels!",
  );

async function getLeaderboard(interaction) {
  try {
    const users = await getUser();

    const date = new Date();
    const startDate = parseInt(process.env.START_DATE) * 1000;
    let difference = Math.round((date.getTime() - startDate) / (1000 * 3600 * 24));

    if (difference === 0) {
      difference = 1;
    }

    const leaderboardEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`${interaction.guild.name}'s leaderboard`)
      .setThumbnail(interaction.guild.iconURL())
      .setTimestamp()
      .addFields(
        users.map((user, index) => {
          const hours = Math.floor(user.time / 3600);
          const minutes = Math.floor((user.time % 3600) / 60);
          const seconds = Math.floor(user.time % 60);
          let time = "";

          if (minutes === 0 && hours === 0) {
            time = seconds + "sec";
          } else if (hours === 0) {
            time = minutes + "min " + seconds + "sec";
          } else {
            time = hours + "h " + minutes + "min " + seconds + "sec";
          }

          let avgTime = (hours * 3600 + minutes*60 + seconds)/difference
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

          return {
            name: `${index + 1}. ${user.discordname}`,
            value: time + " (" + avgTime + "/day)",
          };
        }),
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
    logtail.info(
      `Leaderboard command executed by ${interaction.user.username}`,
    );
  }
}

export { COMMAND_DEFINITION, run };
