import { Client as Discord } from 'discord.js';
import express from 'express';
import nconf from 'nconf';
import R from 'ramda';

import './lib/config/init';
import commands from './lib';

// Init
const bot = new Discord();

// Start health check endpoint
const web = express();
web.use('/', (req, res) => {
  res.json({status: 'okay'});
});
web.listen(process.env.PORT || 5000);

// Listen for events
bot.on('ready', () => console.log(`Started successfully. Serving in ${bot.servers.length} servers`));
bot.on('disconnected', () => {
  console.log(`[${Date().toString()}] Disconnected. Attempting to reconnect...`);
  setTimeout(() => {
    bot.login(nconf.get('EMAIL'), nconf.get('PASSWORD'));
  }, 5000);
});

bot.on('message', msg => {
  // Checks for PREFIX
  if (msg.content[0] === nconf.get('PREFIX')) {
    let command = msg.content.toLowerCase().split(' ')[0].substring(1);
    let suffix = msg.content.substring(command.length + 2);
    let cmd = commands[command];

    if (cmd) cmd(bot, msg, suffix);
    return;
  }

  // Checks if bot was mentioned
  if (msg.mentions.get('username', nconf.get('USERNAME'))) {
    let msg_split = msg.content.split(' ');
    let suffix = R.join(' ', R.slice(2, msg_split.length, msg_split));
    let cmd = commands[msg_split[1]];

    if (cmd) cmd(bot, msg, suffix);
    return;
  }
});

bot.login(nconf.get('EMAIL'), nconf.get('PASSWORD'));
