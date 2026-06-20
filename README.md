# Discord Remote Moderation bot for only Kick/Ban
if you want to contact me on discord
Discord username: inshoock

## Disclaimer
This tool was made for educational/test purposes only. 
The developer is not responsible for bad actions that originate from this tool. 
Publishing this tool under your name will result in a DMCA takedown. 
You can distribute copies of it, but just don't change the code as if it was your own.

## Features
- **External CLI Control**: Kick or ban users directly from your computer's terminal.
- **Fast Execution**: Uses Discord.js memory caching for near-instantaneous moderation actions.
- **Secure Web Endpoint**: Protected via an explicit custom API password check.

## Project Structure
- `index.js` - Core application logic handling Discord connections and Express web routing.
- `package.json` - Project dependency registration configuration.
- `.env` - (Hidden/Ignored) Local storage for sensitive API tokens and passwords.

## requirements
- your own discord bot/bot token
- Render
- "curl" Command

# installation

## 1. Create the new folder (Example: ~/DiscordBot)

## 1.2 Create a new .env (Local Configuration)

``` nano .env```

and copy and paste this

```
DISCORD_TOKEN=your_discord_bot_token
GUILD_ID=your_discord_server_id
SECRET_PASSWORD=your_api_security_password
PORT=10000
```
### just press ```Ctrl+O``` to save a file and then press ```y``` and now ```Enter``` then press ```Ctrl+X```

## Create a file package.JSON

type
``` nano package.json``
then copy and paste this

```
{
  "name": "EXAMPLE",
  "version": "1.0.0",
  "description": "Discord bot with external kick and ban commands",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "discord.js": "^14.18.0",
    "dotenv": "^16.4.7",
    "express": "^4.21.2"
  }
}
```
### just press ```Ctrl+O``` to save a file and then press ```y``` and now ```Enter``` then press ```Ctrl+X```

## 1.3 almost finished. Create a just new index.js
``` nano index.js```
then copy and paste this
```
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const app = express();

// CRITICAL: This line MUST come before any routes are declared!
app.use(express.json()); 

// Initialize the Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// Now declare your mod command route
app.post('/mod-command', async (req, res) => {
    const { password, action, user_id, reason } = req.body;
    const modReason = reason || "Executed via external command";

    if (password !== process.env.SECRET_PASSWORD) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);

        if (action === 'kick') {
            let member = guild.members.cache.get(user_id);
            if (!member) member = await guild.members.fetch(user_id);
            
            await member.kick(modReason);
            return res.status(200).json({ status: `Successfully kicked user ${user_id}` });
        } 
        else if (action === 'ban') {
            await guild.members.ban(user_id, { reason: modReason });
            return res.status(200).json({ status: `Successfully banned user ${user_id}` });
        }

        return res.status(400).json({ error: "Invalid action" });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

app.get('/', (req, res) => res.send('Bot connection interface is active!'));

client.once('ready', () => {
    console.log(`🤖 Logged into Discord as ${client.user.tag}!`);
    const port = process.env.PORT || 10000;
    app.listen(port, () => console.log(`🌍 Web listener active on port ${port}`));
});

client.login(process.env.DISCORD_TOKEN);
```
then its done

## 2. Create your own Repository after start setting up on render from other step

first create your own repository on github privately nor public

<img width="330" height="383" alt="image" src="https://github.com/user-attachments/assets/c55bb880-d873-4909-8db7-a8f122df07ec" />

## 2.1 Generate your new Token access
Go to Settings in github, at the bottom of the navigation sidebar from the settings page there's a section named Developer Settings.

Then click Personal Access Token then select Tokens (classic)
And then you need to click this dropdown

<img width="822" height="508" alt="image" src="https://github.com/user-attachments/assets/fa04547e-902b-4074-b490-5d97e25a9a66" />

(then select the classic ones, not the fine-grained)
Remember to make sure you only need the ```repo``` permission, since that's the only permission that needed

and now its done. you can copy your new token

*Coming soon*

# Donations Support

Monero/XMR address: 42JDxFhoqZ2ACHQ2DUqGgeikwZFffQC2NAXgyUQqTxsXbWPMAdJSndK6zvihK1dhqeTev2zwnuipS1KGodUHHa2UCYk2SdC

<img width="240" height="240" alt="image" src="https://github.com/user-attachments/assets/a85184c8-80d6-41c3-8b8e-353cce16c39c" />

so by the way have a nice tip. so thanks for our support donations! ^^
