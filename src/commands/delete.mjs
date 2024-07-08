import { SlashCommandBuilder } from '@discordjs/builders';
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
                logtail.info(`All users have been deleted from the database by ${interaction.user.username}!`);
                return interaction.reply({ content: 'All users have been deleted from the database!', ephemeral: true });
            } else {
                await deleteUser(user.username);
                logtail.info(`${user.username} has been deleted from the database by ${interaction.user.username}!`);
                return interaction.reply({ content: `${user.username} has been deleted from the database!`, ephemeral: true });
            }
        } else {
            logtail.info(`User ${interaction.user.username} tried to delete a user from the database without the necessary permissions!`);
            return interaction.reply({ content: 'You do not have the necessary permissions to run this command!', ephemeral: true });
        }
    } catch (error) {
        logtail.info(`Error while deleting from the database by ${interaction.user.username}!`);
        logtail.error(error);
        return interaction.reply({ content: 'There was an error while deleting from the database!', ephemeral: true });
    }
}

export { COMMAND_DEFINITION, run }