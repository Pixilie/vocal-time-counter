import { SlashCommandBuilder } from "@discordjs/builders";
import { getUser } from "../database.mjs";
import { EmbedBuilder } from "discord.js";
import { Logtail } from "@logtail/node";

const logtail = new Logtail(process.env.SOURCE_TOKEN);

let COMMAND_DEFINITION = new SlashCommandBuilder()
  .setName("time")
  .setDescription("Replies with the time you have spent in voice channels!");

async function getTime(interaction) {
  try {
    const startDate = parseInt(process.env.START_DATE) * 1000;
    const discordUser = interaction.user.username;
    const databaseUser = await getUser(discordUser);

    if (databaseUser === null) {
      return "You have not joined any voice channels yet!";
    }

    const lastJoined = new Date(databaseUser.lastjoined * 1000);
    const date = new Date();
    let difference = Math.round((date.getTime() - startDate) / (1000 * 3600 * 24));

    const hours = Math.floor(databaseUser.time / 3600);
    const minutes = Math.floor((databaseUser.time % 3600) / 60);
    const seconds = Math.floor(databaseUser.time % 60);
    let time = "";

    if (minutes === 0 && hours === 0) {
      time = seconds + "sec";
    } else if (hours === 0) {
      time = minutes + "min " + seconds + "sec";
    } else {
      time = hours + "h " + minutes + "min " + seconds + "sec";
    }

    if (difference === 0) {
      difference = 1;
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

    const timeCommand = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`${discordUser}'s stats`)
      .setTimestamp()
      .setThumbnail(interaction.user.avatarURL())
      .addFields(
        {
          name: "Time spent in voice channels",
          value: time,
        },
        {
          name: `Last time ${discordUser} was in a voice channel`,
          value:
            "On " +
            lastJoined.getDate() +
            "/" +
            String(parseInt(lastJoined.getMonth()) + 1) +
            "/" +
            lastJoined.getFullYear() +
            " at " +
            lastJoined.getHours() +
            ":" +
            lastJoined.getMinutes(),
        },
        {
          name: "Average time spent in voice channels",
          value: avgTime + "/day",
        },
      )
      .setFooter({
        text: "You need to quit the voice channel to update the time!",
        iconURL: interaction.guild.iconURL(),
      });
    return { embeds: [timeCommand] };
  } catch (error) {
    logtail.error(error);
  }
}

async function run(interaction) {
  const response = await getTime(interaction);
  if (response === null) {
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
    return;
  } else {
    await interaction.reply(response);
    logtail.info(`Time command executed by ${interaction.user.username}`);
  }
}

export { COMMAND_DEFINITION, run };
