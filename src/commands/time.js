import { SlashCommandBuilder } from "@discordjs/builders";
import { Embed, EmbedBuilder } from "discord.js";
import { Logtail } from "@logtail/node";
import { getUser } from "../database.js";
import { timeFormatting } from "../helpers.js";

const logtail = new Logtail(process.env.SOURCE_TOKEN);

let COMMAND_DEFINITION = new SlashCommandBuilder()
  .setName("time")
  .setDescription("Replies with the time you have spent in voice channels!");

/**
* Get the time spent in voice channels by a user
* @param {Interaction} - The interaction object
* @returns {Embed} - The embed object
*/
async function getTime(interaction) {
  try {
    const discordUser = interaction.user.username;
    const databaseUser = await getUser(discordUser);
    const lastJoined = new Date(databaseUser.lastjoined * 1000);

    if (databaseUser === null) {
      return "You have not joined any voice channels yet!";
    }

    let formattedInfos = timeFormatting(databaseUser.time)

    const timeCommand = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`${discordUser}'s stats`)
      .setTimestamp()
      .setThumbnail(interaction.user.avatarURL())
      .addFields(
        {
          name: "Time spent in voice channels",
          value: formattedInfos.formattedTime,
        },
        {
          name: `Last time ${discordUser} was in a voice channel`,
          value: `On ${lastJoined.getDate()}/${String(parseInt(lastJoined.getMonth()) + 1)}/${lastJoined.getFullYear()} at ${lastJoined.getHours()}:${lastJoined.getMinutes()}`,
        },
        {
          name: "Average time spent in voice channels",
          value: `${formattedInfos.avgTime}/day`
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

/**
* Run the time command
* @param {Interaction} - The interaction object
* @returns {Interaction.reply} - Reply to the user's request
*/
async function run(interaction) {
  const response = getTime(interaction);
  if (response === null) {
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
    return;
  } else {
    await interaction.reply(response);
  }
}

export { COMMAND_DEFINITION, run };
