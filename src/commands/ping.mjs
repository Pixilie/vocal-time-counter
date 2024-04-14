import { SlashCommandBuilder } from '@discordjs/builders';

let COMMAND_DEFINITION = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with the latency of the bot!');

/**
 * Execute the /ping command
 * @param {object} interaction Interaction object
 */
async function run(interaction) {
    await interaction.reply(`Latency is ${Date.now() - interaction.createdTimestamp}ms.`);
}

export { COMMAND_DEFINITION, run };