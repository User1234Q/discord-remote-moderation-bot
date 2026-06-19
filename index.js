require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const app = express();
app.use(express.json());

// Initialize the Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// 1. Web API listener for your external commands
app.get('/', (req, res) => res.send('Bot connection interface is active!'));

app.post('/mod-command', async (req, res) => {
    const { password, action, user_id, reason } = req.body;
    const modReason = reason || "Executed via external command";

    // Security password check
    if (password !== process.env.SECRET_PASSWORD) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    try {
        // Fetch the server using your Guild ID
        const guild = await client.guilds.fetch(process.env.GUILD_ID);

        if (action === 'kick') {
            const member = await guild.members.fetch(user_id);
            await member.kick(modReason);
            return res.status(200).json({ status: `Successfully kicked user ${user_id}` });
        } 
        else if (action === 'ban') {
            // Bans directly by user ID, even if they aren't in the server
            await guild.members.ban(user_id, { reason: modReason });
            return res.status(200).json({ status: `Successfully banned user ${user_id}` });
        }

        return res.status(400).json({ error: "Invalid action type. Use 'kick' or 'ban'" });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

// 2. Discord event listener
client.once('ready', () => {
    console.log(`🤖 Logged into Discord as ${client.user.tag}!`);
    
    // Start web listener on the port Render gives us
    const port = process.env.PORT || 8080;
    app.listen(port, () => console.log(`🌍 External terminal web listener active on port ${port}`));
});

// Log the bot into Discord
client.login(process.env.DISCORD_TOKEN);
