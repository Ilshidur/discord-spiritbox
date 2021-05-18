const axios = require('axios');
const querystring = require('querystring');

const BASE_URL = 'http://translate.google.com/translate_tts?';

module.exports = class TTS {
  /**
   * Outputs an MP3 audio stream.
   * 32kbps, 24kHz, Mono.
   */
  static async toSpeach(text) {
    const query = querystring.stringify({
      ie: 'UTF-8',
      client : 'tw-ob',
      tl : 'fr-FR',
      q: text,
      textLen: text.length,
    });

    const url = `${BASE_URL}${query}`;

    const response = await axios.get(url, {
      headers: {
        'Accept-Encoding': 'identity;q=1, *;q=0',
        'Range': 'bytes=0-'
      },
      responseType: 'stream',
    });

    return response.data;
  }
};
