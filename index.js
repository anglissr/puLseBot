// Load up the discord.js library
const { Client, RichEmbed } = require('discord.js');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const https = require( "https" ) // install using npm
const fetch = require( "node-fetch")
const config = require("./config.json");
const client = new Client();

var streamingDidNotify = false
// GET 'https://api.twitch.tv/helix/users?login=<username>'
// GET 'https://api.twitch.tv/helix/streams?user_id=71993201'

// Check twitch periodically to see if user's stream is live
async function checkTwitch() {
  const url = "https://api.twitch.tv/helix/streams?user_id=71993201"; // wwupuLse id
  const options = {
    headers: {
      'Client-ID': config.clientID // found in config file
    }
  };

  const response = await fetch(url, options);
  const myJson = await response.json();
  if (myJson.data[0] != undefined) { // if the user is currently streaming
    if (myJson.data[0].type == "live") { // if the type of stream is "live"
      if (streamingDidNotify == false) {
        console.log("live notify") // notify the discord (id = 635932635914305546)
        streamingDidNotify = true
      }
    }
  } else { // if the user is not streaming
    if (streamingDidNotify == true) {
      streamingDidNotify = false
    }
  }
}

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
  client.user.setActivity(`Rocket League`);
  console.log(client.channels.get('635932635914305546').send("Live"))
  setInterval( checkTwitch, 30 * 1000 );
});

client.on("message", async message => {
  if(message.author.bot) return;
  if(message.content.indexOf(config.prefix) !== 0) return;

  // Separate "command" name, and "arguments" for the command.
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if(command === "ping") {
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }

  if(command === "say") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use.
    // To get the "message" itself we join the `args` back into a string with spaces:
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o=>{});
    message.channel.send(sayMessage);
  }

  if(command === "rank") {
          url = "http://kyuu.moe/extra/rankapi.php?channel=$(wwupulse)&user=" + args[0] + "&plat=steam"
          var xmlHttp = new XMLHttpRequest();
          xmlHttp.open( "GET", url, false ); // false for synchronous request
          xmlHttp.send( null );
          response = xmlHttp.responseText
          if (response.includes("was not found on")) {
            message.channel.send("Steam ID not found...")
          } else {
            const embed = new RichEmbed()
              .setColor('#0099ff')
              .setTitle((response.split('|'))[0])
              .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/e/e0/Rocket_League_coverart.jpg')
              .addField('1v1', response.split('|')[1].replace("1v1: ",""))
              .addField('2v2', response.split('|')[2].replace("2v2: ",""))
              .addField('Solo 3v3', response.split('|')[3].replace("Solo 3v3: ",""))
              .addField('3v3', response.split('|')[4].replace("3v3: ",""))
              .setTimestamp()
              .setFooter("Usage: !rank [steam name]")
              message.channel.send(embed)
          }
      }
});

client.login(config.token);
