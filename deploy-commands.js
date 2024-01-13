const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

// Grab all command folders paths
const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// loop through folders and grab all command files' paths
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('js.'));
    // loop through each file and get each commands's data in json and store in array
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] THe command at ${filePath} is missing a required "data" or "execute" property`);
        }
    }
}

// construct instance of rest module
const rest = new REST().setToken(token);

// deploy commands with rest module
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        // put command used to fully refresh commands in guild with current set
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands},
        );
        console.log(`Successfully reload ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();