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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint 1: Fetch ALL servers the bot is currently running inside
app.get('/api/guilds', (req, res) => {
    const { password } = req.query;
    if (password !== process.env.SECRET_PASSWORD) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const guildList = [];
    client.guilds.cache.forEach(guild => {
        guildList.push({ id: guild.id, name: guild.name });
    });

    res.json(guildList);
});

// Endpoint 2: Fetch members specifically for the selected server tab click
app.get('/api/members', async (req, res) => {
    const { password, guild_id } = req.query;
    if (password !== process.env.SECRET_PASSWORD) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const guild = client.guilds.cache.get(guild_id) || await client.guilds.fetch(guild_id).catch(() => null);
        if (!guild) return res.status(404).json({ error: "Server context missing" });

        const fetchedMembers = await guild.members.fetch().catch(() => []);
        const membersList = [];

        fetchedMembers.forEach(member => {
            if (member.user.bot) return;
            membersList.push({ id: member.id, username: member.user.username });
        });

        res.json(membersList);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Endpoint 3: Handle execution on the dynamically selected guild ID
app.post('/api/mod', async (req, res) => {
    const { password, action, guild_id, user_id, reason } = req.body;
    if (password !== process.env.SECRET_PASSWORD) {
        return res.status(403).send("Invalid API Password");
    }

    try {
        const guild = await client.guilds.fetch(guild_id);
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
    app.listen(port, () => console.log(`🌍 Dynamic Dashboard running on port ${port}`));
});

client.login(process.env.DISCORD_TOKEN);
