import { SlashCommandBuilder, ContextMenuCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandType, PermissionFlagsBits } from "discord.js"
import { Logtail } from "@logtail/node";
import { deleteUser } from '../database.js';

const logtail = new Logtail(process.env.SOURCE_TOKEN);

let COMMAND_DEFINITION = new SlashCommandBuilder()
  .setName('delete')
  .setDescription('BE CAREFUL! - Administrator reserved command to delete a user from the database.')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption(option => option.setName('user').setDescription('The user to delete').setRequired(false));

let CONTEXT_DEFINITION = new ContextMenuCommandBuilder()
  .setName("Delete this user")
  .setType(ApplicationCommandType.User)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

/**
* Run /delete commands
* @param {Interaction} - The interaction object
* @returns {Interaction.reply} - Reply to the user's request
*/
async function run(interaction) {
  try {
    let user = ""
    if (!interaction.isUserContextMenuCommand()) {
      user = interaction.options.getUser('user');
    } else {
      user = interaction.targetUser;
    }

    if (user === null) {
      await deleteUser(interaction.guildId);
      logtail.warn(`All users have been deleted from the database by ${interaction.user.username} on the server ${interaction.guildId}`);
      return interaction.reply({ content: 'All users have been deleted from the database!', ephemeral: true });
    } else {
      await deleteUser(interaction.guildId, user.username);
      logtail.warn(`${user.username} has been deleted from the database by ${interaction.user.username} on the server ${interaction.guildId}`);
      return interaction.reply({ content: `${user.username} has been deleted from the database!`, ephemeral: true });
    }
  } catch (error) {
    logtail.error({ code: Date.now(), error: error })
    return interaction.reply({ content: `There was an error while executing the command, please contact \`@pixilie\` with this code: ${Date.now()}`, ephemeral: true });
  }
}

export { COMMAND_DEFINITION, CONTEXT_DEFINITION, run }
