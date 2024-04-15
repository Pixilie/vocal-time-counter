import { SlashCommandBuilder } from '@discordjs/builders';
import { Logtail } from "@logtail/node";

const logtail = new Logtail(process.env.SOURCE_TOKEN);

let COMMAND_DEFINITION = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with the latency of the bot!');

/**
 * Execute the /ping command
 * @param {object} interaction Interaction object
 */
async function run(interaction) {
    try {
        await interaction.reply(`Latency is ${Date.now() - interaction.createdTimestamp}ms.`);
    } catch (error) {
        logtail.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
}

export { COMMAND_DEFINITION, run };