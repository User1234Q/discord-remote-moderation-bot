require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// Serve the clean HTML5 visual page file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// JSON API Endpoint to fetch server context securely
app.get('/api/members', async (req, res) => {
    const { password } = req.query;
    if (password !== process.env.SECRET_PASSWORD) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const guild = client.guilds.cache.get(process.env.GUILD_ID) || await client.guilds.fetch(process.env.GUILD_ID).catch(() => null);
        if (!guild) return res.status(404).json({ error: "Guild not found" });

        const membersFetch = await guild.members.fetch().catch(() => []);
        const membersList = [];

        membersFetch.forEach(member => {
            if (member.user.bot) return;
            membersList.push({ id: member.id, username: member.user.username });
        });

        res.json({ serverName: guild.name, members: membersList });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// JSON API Endpoint to handle action submissions dynamically
app.post('/api/mod', async (req, res) => {
    const { password, action, user_id, reason } = req.body;
    if (password !== process.env.SECRET_PASSWORD) {
        return res.status(403).send("Invalid API Password");
    }

    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        if (action === 'kick') {
            let member = guild.members.cache.get(user_id) || await guild.members.fetch(user_id);
            await member.kick(reason);
        } else if (action === 'ban') {
            await guild.members.ban(user_id, { reason });
        }
        res.status(200).send("Success");
    } catch (error) {
        res.status(400).send(error.message);
    }
});

client.once('ready', () => {
    console.log(`🤖 Logged into Discord as ${client.user.tag}!`);
    const port = process.env.PORT || 10000;
    app.listen(port, () => console.log(`🌍 HTML5 Dashboard engine active on port ${port}`));
});

client.login(process.env.DISCORD_TOKEN);
