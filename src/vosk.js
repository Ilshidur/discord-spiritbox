const WebSocket = require('ws');

const VOSK_URL = `ws://vosk:2700`;

module.exports = class Vosk {
  static speechToText(stream) {
    return new Promise((resolve, reject) => {
      let ws;
      try {
        ws = new WebSocket(VOSK_URL);
      } catch (err) {
        return reject(err);
      }

      ws.on('open', () => {
        stream.on('data', (chunk) => {
          ws.send(chunk);
        });
        stream.on('end', () => {
          ws.send('{"eof" : 1}');
        });
      });

      let text;

      ws.on('message', (data) => {
        const parsedData = JSON.parse(data);
        if (parsedData.partial) {
          return;
        }
        if (!parsedData.text) {
          return;
        }
        text = parsedData.text;
      });

      ws.on('error', (err) => {
        reject(err);
      });

      ws.on('close', () => {
        resolve(text);
      });
    });
  }
};
