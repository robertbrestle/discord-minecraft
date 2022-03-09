const { Client, Intents } = require('discord.js');
const client = new Client({
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
	intents: ['DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILDS']
});
const config = require("./config.json");
const request = require('request');

function startstopec2(channel, cmd) {
    request({
		headers: {
			'x-api-key': config[config["id"]].key
		},
		url: config[config["id"]].startstopurl,
		method: "POST",
		json: {"command":cmd,"purpose":config[config["id"]].purpose}
	},function(error, resp, body) {
		if(!error && resp.statusCode === 200) {
			if(body.error == '') {
				var respstr = 'State: **' + body.state + '**';
				if(body.hasOwnProperty('type')) {
					respstr += '\nSize: **' + body.type + '**';
				}
				if(body.hasOwnProperty('ip')) {
					respstr += '\nIP: **' + body.ip + '**';
				}
				// send message
				channel.send(respstr);
				// if pending, wait
				if(cmd === 'start' && body.state == 'pending') {
					setTimeout(function() {
						startstopec2(channel, 'status');
					}, config[config["id"]].startwait);
				}
			}else {
				channel.send('Start/Stop error: ' + body.error);
			}
		}else {
			console.log(error);
			channel.send("An error occurred.");
		}
	});
}//startstopec2

// client handlers
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (msg) => {
	// prevent bot spam
	if(msg.author.bot) {
		return;
	}
	// check prefix
	if(msg.content.startsWith(config.prefix)) {
		var cmd = msg.content.toLowerCase().slice(1).split(' ');
		if(cmd[0] === config["id"]) {
			// grab the current channel
			client.channels.fetch(msg.channel.id)
				.then(channel => {
					if(cmd[1] === 'help' || cmd[1] === '?') {
						channel.send(config[config["id"]].helptext);
					}else if(cmd[1] === 'start') {
						startstopec2(channel, "start");
					}else if(cmd[1] === 'stop') {
						startstopec2(channel, "stop");
					}else {
						startstopec2(channel, "status");
					}
				})
				.catch(console.error);
		}//if starts with config.id
	}//if starts with prefix
});

client.login(config.token);