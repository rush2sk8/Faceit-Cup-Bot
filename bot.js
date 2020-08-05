require('dotenv').config()
var Discord = require('discord.js')
const bot = new Discord.Client()
bot.login(process.env.DISCORD_TOKEN)

let CUP_CHANNEL = process.env.CUP_CHANNEL
let CUP_CHANNEL2 = process.env.CUP_CHANNEL2
let CUP_ROLE = process.env.CUP_ROLE
let REACTION_EMOJI = process.env.REACTION_EMOJI
let NUM_PLAYERS = parseInt(process.env.NUM_PLAYERS)

var messages = []
var activeTeams = {}
var time = Date.now()
var pingTime = Date.now()
var firstRun = true
var firstPing = true

bot.on('ready', function(evt) {
    bot.user.setActivity("!!help | rush2sk8", { type: "STREAMING", url: "https://www.twitch.tv/rush2sk8" })
})

bot.on('message', (message) => {
    if (message.author.bot) return
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
        } else if (content == "!!help") {
            message.channel.send("```!cup - Will start a cup \n!ping - Will ping all active teams. A team is active for 1 hour from creation```")
        } else if (content == "!ping") {
            pingTeams(message)
        }
    }
})

bot.on('messageReactionAdd', (reaction, user) => {
    if (!user || user.bot || !reaction.message.channel.guild) return;

    if (messages.includes(reaction.message.id)) {
        if (reaction.emoji.name != REACTION_EMOJI) reaction.remove(user)
        if (reaction.emoji.name == REACTION_EMOJI && reaction.count > NUM_PLAYERS) {
            reaction.remove(user)
            return
        }

        if (reaction.count == NUM_PLAYERS) {

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

            activeTeams[message.id] = [Date.now(), reaction.users.map(u => u.id).slice(1)]

            firstRun = true
        }
    }
})

bot.on('messageReactionRemove', (reaction, user) => {
    if (!user || user.bot || !reaction.message.channel.guild) return;

    let message = reaction.message

    if (message.id in activeTeams) {
        delete activeTeams[message.id]
    }
})

function pingTeams(message) {

    console.log(activeTeams)
    var team_num = 1
    var ping_message = ""

    for (var key in activeTeams) {
        ping_message += "Team " + team_num + "\n"

        for (var i = 0; i < activeTeams[key][1].length; i++) {
            ping_message += "<@" + activeTeams[key][1][i] + ">\n"
        }

        team_num += 1
    }

    if (ping_message == "") {
        message.channel.send("`There are no active teams playing.`")
    } else {
        if ((Date.now() - pingTime) >= 30000 || firstPing || message.author.id == 142457707289378816) {
            message.channel.send(ping_message)
            pingTime = Date.now()
            firstPing = false
        } else {
        	if(message.author.id == 131876531223003138){
        		message.author.send("`YOOOO AAYUSH CHILLL BRO. Please wait " + ((30000 - (Date.now() - pingTime)) / 1000).toFixed(2) + " seconds before using !ping again.`")
        	} 
        	else {
        		message.author.send("`Please wait " + ((30000 - (Date.now() - pingTime)) / 1000).toFixed(2) + " seconds before using !ping again.`")
        	}
        }
    }
}

setInterval(() => {
    messages.shift()
}, 21600000)

//kill a team 1 hour after its creation. check every 30 seconds
setInterval(() => {
    console.log(activeTeams)
    for (var key in activeTeams) {
        if (Date.now() - activeTeams[key][0] >= 1000 * 60 * 60 * 8) {
            delete activeTeams[key]
        }
    }
}, 1000 * 30)
