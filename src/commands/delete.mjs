import { SlashCommandBuilder } from '@discordjs/builders';
import { getUser } from '../database.mjs';
import { EmbedBuilder } from 'discord.js';
import { Logtail } from "@logtail/node";
import { deleteUser } from '../database.mjs';

const logtail = new Logtail(process.env.SOURCE_TOKEN);

let COMMAND_DEFINITION = new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Admin command to delete a user from the database.')
    .addUserOption(option => option.setName('user').setDescription('The user to delete').setRequired(false));

async function run(interaction) {
    try {
        if (interaction.member.permissions.has('ADMINISTRATOR')) {
            const user = interaction.options.getUser('user');
            if (user === null) {
                await deleteUser();
                return interaction.reply({ content: 'All users have been deleted from the database!', ephemeral: true });
            } else {
                await deleteUser(user.username);
                return interaction.reply({ content: `${user.username} has been deleted from the database!`, ephemeral: true });
            }
        } else {
            return interaction.reply({ content: 'You do not have the necessary permissions to run this command!', ephemeral: true });
        }
    } catch (error) {
        logtail.error(error);
        return interaction.reply({ content: 'There was an error while deleting from the database!', ephemeral: true });
    }
}

export { COMMAND_DEFINITION, run }