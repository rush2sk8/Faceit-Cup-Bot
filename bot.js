require('dotenv').config()
var Discord = require('discord.js')
const bot = new Discord.Client()
bot.login(process.env.DISCORD_TOKEN)

let CUP_CHANNEL = process.env.CUP_CHANNEL
let CUP_CHANNEL2 = process.env.CUP_CHANNEL2
let CUP_ROLE = process.env.CUP_ROLE
let REACTION_EMOJI = process.env.REACTION_EMOJI

var messages = []
var time = Date.now()
var firstRun = true

bot.on('ready', function(evt) {
    bot.user.setActivity("Created by rush2sk8", { type: "STREAMING", url: "https://www.twitch.tv/rush2sk8" })
})

bot.on('message', (message) => {
    console.log(message.content)

    const channelName = message.channel.name
    const content = message.content

    //view all of the messages and look for a twitch clip link
    if (channelName == CUP_CHANNEL) {
        if (content.startsWith("!cup")) {
            if (Date.now() - time >= 300000 || firstRun) {
                message.channel.send("<@&" + CUP_ROLE + "> Please react to this if you want to play in the cup.").then((m) => {
                    m.react(REACTION_EMOJI)
                    messages.push(m.id)
                    time = Date.now()
                    firstRun = false
                })
            } else {
                message.channel.send("**Please wait " + ((300000 - (Date.now() - time)) / 60000.0).toFixed(2) + " mins before starting a new cup**")
            }
        }
    }
})

bot.on('messageReactionAdd', (reaction, user) => {
    if (messages.includes(reaction.message.id)) {
        if (reaction.emoji.name != REACTION_EMOJI) reaction.remove(user)
        if (reaction.emoji.name == REACTION_EMOJI && reaction.count > 2) {
            reaction.remove(user)
            return
        }

        if (reaction.count == 2) {
            let message = reaction.message
            const users = reaction.users.map(u => u.tag.toString().slice(0, -5)).slice(1).toString()
            
            let msgJump = "https://discordapp.com/channels/" + message.guild.id + "/" + message.channel.id + "/" + message.id

            const embed = new Discord.RichEmbed()
                .setTitle("Faceit Cup Team ")
                .setColor("#ffbb00")
                .setDescription("The [team](" + msgJump + ") will consist of: \n" + users)
                .setThumbnail("https://res-3.cloudinary.com/crunchbase-production/image/upload/xtrxobrlttwixe1kfzo5")
                .setTimestamp()
            message.channel.send(embed)
            firstRun = true
        }
    }
})

setInterval(() => {
    messages.shift()
}, 21600000)
