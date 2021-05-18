require('./util/collection'); // Monkey patch the Collection object.
const Collection = require('@discordjs/collection');
const Discord = require('discord.js');
const path = require('path');
const prism = require('prism-media');

const Vosk = require('./vosk');
// const TTS = require('./tts');

const discord = new Discord.Client();

const voiceStreams = new Collection();

function listenToGuildMember(guildMember) {
  if (voiceStreams.get(guildMember.user.id)) {
    return;
  }

  const voiceConnection = discord.voice.connections.get(guildMember.guild.id);
  if (!voiceConnection) {
    return;
  }

  const stream = voiceConnection.receiver.createStream(guildMember, {
    mode: 'pcm',
    end: 'silence',
  });

  stream.on('error', (err) => {
    console.error(err);
  });
  stream.on('end', () => {
    voiceStreams.delete(guildMember.user.id);
    voiceStreams.set(guildMember.user.id, {
      guildMember,
      stream: listenToGuildMember(guildMember)
    });
  });

  return stream;
}

voiceStreams.on('set', async ([guildMemberId, { guildMember, stream }]) => {
  if (!stream) {
    return;
  }

  // Transcode the stream.
  const pcmToWavTrancoder = new prism.FFmpeg({
    args: [
      '-loglevel', '0',

      // Input.
      '-f', 's16le',
      '-ar', '48.0k',
      '-ac', '2', // TODO: Really ? 2 channels ?

      '-i', '-',

      // Output.
      '-f', 's16le',
      '-acodec', 'pcm_s16le',
      '-ar', '16.0k',
      '-ac', '1',
    ],
  });

  const formattedStream = stream
    .on('error', (err) => {
      console.error(err);
    })
    .pipe(pcmToWavTrancoder);

  let text;
  try {
    text = await Vosk.speechToText(formattedStream);
  } catch (err) {
    console.error(err);
    return;
  }

  if (!text) {
    return;
  }

  const voiceConnection = discord.voice.connections.get(guildMember.guild.id);

  console.log(text);

  switch (text) {
    case 'que voulez-vous':
      // "Attack".
      await voiceConnection.play(path.resolve(__dirname, '../sounds/attack.mp3'), { volume: 1 });
      break;
    case 'quel âge avez-vous':
      // "Adult".
      await voiceConnection.play(path.resolve(__dirname, '../sounds/adult.mp3'), { volume: 1 });
      break;
    case 'où êtes-vous':
      // "Behind".
      await voiceConnection.play(path.resolve(__dirname, '../sounds/behind.mp3'), { volume: 1 });
      break;
  }

  // if (text.includes('tonton')) {
  //   const stream = await TTS.toSpeach('Vas-y, BG.');
  //   await voiceConnection.play(stream, { volume: 1 });
  // }
  // if (text.includes('grafi')) {
  //   const stream = await TTS.toSpeach(`C'est le plus beau des hosts.`);
  //   await voiceConnection.play(stream, { volume: 1 });
  // }
});

(async () => {
  discord.on('ready', () => {
    console.log('Bot is connected.');
  });

  discord.on('voiceStateUpdate', async (oldState, newState) => {
    if (newState.channel) {
      // Someone connected or switched channels.
      await newState.member.voice.channel.join();
    } else {
      // Leave.
      // discord.voice.connections.get(oldState.channel.guild.id).disconnect();
    }
  });

  discord.voice.connections.on('set', ([guildId, voiceConnection]) => {
    console.log('Someone (or I) connected to my vocal.');

    for (const guildMember of voiceConnection.channel.members.values()) {
      if (guildMember.user.bot) {
        continue;
      }
      voiceStreams.set(guildMember.user.id, {
        guildMember,
        stream: listenToGuildMember(guildMember)
      });
    }
  });

  console.log('Starting the bot...');
  await discord.login(process.env.DISCORD_TOKEN);
})();
