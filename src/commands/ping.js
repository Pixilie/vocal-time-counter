import { SlashCommandBuilder } from '@discordjs/builders';

let COMMAND_DEFINITION = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');

/**
 * Execute the /ping command
 * @param {object} interaction Interaction object
 */
async function run(interaction) {
    await interaction.reply('Pong!');
}

export { COMMAND_DEFINITION, run };