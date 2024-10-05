import {
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
} from "@discordjs/builders";
import {
  ApplicationCommandType,
  InteractionResponse,
  PermissionFlagsBits,
} from "discord.js";
import { Logging } from "../helpers.js";
import { deleteUser, updateServer } from "../database.js";

let COMMAND_DEFINITION = new SlashCommandBuilder()
  .setName("delete")
  .setDescription(
    "BE CAREFUL! - Administrator reserved command to delete a user from the database.",
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("The user to delete")
      .setRequired(false),
  );

let CONTEXT_DEFINITION = new ContextMenuCommandBuilder()
  .setName("Delete this user")
  .setType(ApplicationCommandType.User)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

/**
 * Run /delete commands
 * @param {Interaction} interaction - The interaction object
 * @returns {InteractionResponse} ? - Reply to the user's request
 */
async function run(interaction) {
  try {
    let user = interaction.isUserContextMenuCommand()
      ? interaction.targetUser
      : interaction.options.getUser("user");

    if (user === null) {
      await deleteUser(interaction.guildId);
      await updateServer(interaction.guildId, new Date().getTime());

      Logging.warn(
        `All users have been deleted from the database by ${interaction.user.username} on the server ${interaction.guildId}`,
      );
      return interaction.reply({
        content: "All users have been deleted from the database!",
        ephemeral: true,
      });
    } else {
      await deleteUser(interaction.guildId, user.id);
      Logging.warn(
        `${user.username} has been deleted from the database by ${interaction.user.username} on the server ${interaction.guildId}`,
      );
      return interaction.reply({
        content: `${user.username} has been deleted from the database!`,
        ephemeral: true,
      });
    }
  } catch (error) {
    Logging.error({ code: Date.now(), error: error });
    return interaction.reply({
      content: `There was an error while executing the command, please contact an administrator with this code: ${Date.now()}`,
      ephemeral: true,
    });
  }
}

export { COMMAND_DEFINITION, CONTEXT_DEFINITION, run };
