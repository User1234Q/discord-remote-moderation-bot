# Discord Remote Moderation bot for only Kick/Ban
> [!NOTE]
> If you want to contact me on discord
> Discord username: inshoock

> [!CAUTION]
> This tool was made for educational/test purposes only. The developer is not responsible for bad actions that originate from this tool. 
>
> Publishing this tool under your name will result in a **DMCA takedown**. 
>
> You can distribute copies of it, as long you don't change the code as if it was your own.

## Features
- **External CLI Control**: Kick or ban users directly from your computer's terminal.
- **Fast Execution**: Uses Discord.js memory caching for near-instantaneous moderation actions.
- **Secure Web Endpoint**: Protected via an explicit custom API password check.

## Project Structure
- `index.js` - Core application logic handling Discord connections and Express web routing.
- `package.json` - Project dependency registration configuration.
- `.env` - (Hidden/Ignored) Local storage for sensitive API tokens and passwords.

## Requirements
- Your own discord bot and a bot token (Get a new token via [Discord Developer Portal](https://discord.dev))
- Render (Hosting/Deploying platform) or any hosting platform (somewhat supported, but it's not even quite tested yet)
- Knows how to use `curl` command
- Has `git` installed (may be optional if you're planning to host locally)

> [!NOTE]
> `curl` is preinstalled on Windows and MacOS, but some Linux distributions (such as Fedora) has it pre-installed,
> otherwise you may need to install the corresponding packages.
>
> Oh also, `git` is not even pre-installed anywhere, you need to install manually. For MacOS, simply try running `git` and it should gives a prompt to install Xcode command tools, otherwise you already have it installed.


# Installation

## 1. Create the new folder (Example: ~/DiscordBot)

To create a new folder, you need to run the following:

```bash
$ mkdir -p ~/DiscordBot # You can name it yourself if you want
$ cd ~/DiscordBot # Enters the following directory
```

> [!NOTE]
> On Windows, some commands may be different depeneding if you're inside Powershell or CMD. 


## 1.2 Create a new .env (Local Configuration)

Create a new file named `.env` and write (or copy-paste) the following:
```env
DISCORD_TOKEN=your_discord_bot_token
GUILD_ID=your_discord_server_id
SECRET_PASSWORD=your_api_security_password
PORT=10000
```

## 1.3 Create a file package.json

Create a new file named `package.json` and write (or copy-paste) the following:

```json
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

## 1.4 Create `.gitignore`

> [!CAUTION]
> This is the most important file where it tells git what to don't commit files/folders. Otherwise it may end up to the repository (and eventually leaking the whole token, which may lead to Discord to automatically revoke the token as a security measure)
>
> It is obviously advised to don't skip this section.

Create a new file named `.gitignore` with the following content:
```gitignore
node_modules
.env
```


## 1.5 Almost finished, simply create `index.js`

Create a new file named `index.js` and write (or copy-paste) the following

```js
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

Then you're done setting up the bot, the next section will be teaching how to create a new repository on Github,
how to commit change and push to your repository.

## 2. Create your own Repository after start setting up on render from other step

First create your own repository on github either public or private

<img width="330" height="383" alt="image" src="https://github.com/user-attachments/assets/c55bb880-d873-4909-8db7-a8f122df07ec" />

## 2.1 Generate your new Token access
> [!NOTE]
> If you're using Github's CLI, you can skip this section since it manages the ssh and the access token automatically by itself.

Go to Settings in github, at the bottom of the navigation sidebar from the settings page there's a section named Developer Settings.

Then click Personal Access Token then select Tokens (classic)
And then you need to click this dropdown

<img width="822" height="508" alt="image" src="https://github.com/user-attachments/assets/fa04547e-902b-4074-b490-5d97e25a9a66" />

(then select the classic ones, not the fine-grained)
Remember to make sure you only need the `repo` permission, since that's the only permission that needed

When you're done, remember to copy the token and save somewhere that *is* safe to store here (as long you don't accidentally leak your own token) if need to constantly push changes.

> [!TIP]
> You can use `ssh` instead, which can remove the annoyances but it requires settings up ssh.
> Please refer to Github Docs:
>
> https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent
>
> https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account

### 2.1 Commiting changes

To commit changes, we need to tell Git which files to be added as commit, you need to run the following:
```
git add .
```

Then do `git commit`, the editor will open depeneding what have you configured Git.

> And remember to save then exit to ensure it writes the commit so we could push changes to the repository.

### 2.2 Pushing changes to Github repository

To push changes, you need to add the remote origin pointing to your repository. To do that you need to run the following:
```bash
# Add a new remote
$ git remote add origin https://github.com/OWNER/REPOSITORY.git

# Verify if the new remote was added and most have (fetch) and (push)
$ git remote -v
> origin  https://github.com/OWNER/REPOSITORY.git (fetch)
> origin  https://github.com/OWNER/REPOSITORY.git (push)
```

> For more information check ["Manage remote repositories"](https://docs.github.com/en/get-started/git-basics/managing-remote-repositories) on Github Docs

The last step is to simply run `git push -u origin`, which tells Git to push changes to the remote (origin) repository. And it's good to go.

## 3. Sign up and Setting up on a Host website

Go to ["Render"](https://render.com) Website and then click Start for Free and now you can register/Create a new account

*if you cannot click "Start For Free", you can click this ["Start For Free"](https://dashboard.render.com/register) and they can take you to Redirect to right here (to the Sign up Render website)*

if you done creating your new account on render. then skip the survey and select Web Service then connect to your Github Repository

if you done connecting to your Git Repository. well Select the repository since that you've created a new Repository when you want to deploy it

### 3.1 Create a new Project on Render for the Web Service since you just selected your new git repository

Give your project a unique name and then Set your runtime and commands: *Ensure the correct Branch (e.g., main), Build Command* and Start Command are set. Render will usually auto-detect your framework

### 3.2 Add Environment Variables on your new project

Under the Advanced or Environment tab, add/import your `.env` keys (like API keys or database strings)

and done thats it!

## 4. Deploy your project (Final Step)

Click Deploy [Service] and Render will automatically compile and build your code from your new project

then Once your service is successfully deployed, and now Render provides you with a live URL (e.g., XXXX-XXXXXX-XX.XXXX.onrender.com). Every time you push new changes to your connected Git branch, Render automatically triggers a new build and updates your live site with zero downtime

now congrats you may able to execute the command either to ban or kick people from outside of discord!

# Example:
```
curl -X POST "https://XXXXXX-XXXX-XXXXXX-XXX.onrender.com/mod-command" -H "Content-Type: application/json" -d '{"password":"example123","action":"kick","user_id":"1234567890","reason":"Testing external mod"}'
```

```
curl -X POST "https://XXXXXX-XXXX-XXXXXX-XXX.onrender.com/mod-command" -H "Content-Type: application/json" -d '{"password":"example123","action":"ban","user_id":"1234567890","reason":"Testing external mod"}'
```

*(make sure to replace `https://XXXXXX-XXXX-XXXXXX-XXX.onrender.com` to your actual hosted live site render and also user id, your actual secret passwort too)* 

# Donations Support

Monero/XMR address: 42JDxFhoqZ2ACHQ2DUqGgeikwZFffQC2NAXgyUQqTxsXbWPMAdJSndK6zvihK1dhqeTev2zwnuipS1KGodUHHa2UCYk2SdC

<img width="240" height="240" alt="image" src="https://github.com/user-attachments/assets/a85184c8-80d6-41c3-8b8e-353cce16c39c" />

so by the way have a nice tip. so thanks for our support donations! ^^
