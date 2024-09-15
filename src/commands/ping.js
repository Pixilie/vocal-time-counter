import { SlashCommandBuilder } from '@discordjs/builders';
import { Logtail } from "@logtail/node";

const logtail = new Logtail(process.env.SOURCE_TOKEN);

let COMMAND_DEFINITION = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Latency of the bot in ms.');

/**
 * Execute the /ping command
 * @param {Interaction} - The interaction object
 * @returns {Interaction.reply} - Reply to the user's request
 */
async function run(interaction) {
  try {
    await interaction.reply({ content: `Latency is ${Date.now() - interaction.createdTimestamp}ms.`, ephemeral: true });
  } catch (error) {
    logtail.error({ code: Date.now(), error: error })
    await interaction.reply({ content: `There was an error while executing the command, please contact @pixilie with this code: ${Date.now()}`, ephemeral: true });
  }
}

export { COMMAND_DEFINITION, run };