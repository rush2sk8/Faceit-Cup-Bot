# Faceit-Cup-Bot
Discord bot to ask people to play in a faceit cup

## Installation

`npm install`

## Necessary files

* `.env` with the following fields
  - `DISCORD_TOKEN` Discord api token
  - `CUP_ROLE` Discord cup role id
  - `CUP_CHANNEL` Channel to look in
  - `REACTION_EMOJI` Unicode emoji to react with
  - `NUM_PLAYERS` Number of players per team
  
## Launching the bot
Launch with [`pm2`](https://www.npmjs.com/package/pm2)

`pm2 start bot.js`
