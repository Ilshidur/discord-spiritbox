const Collection = require('@discordjs/collection');
const EventEmitter = require('events');

Object.defineProperties(Collection.prototype, {
  emit: {
    value: EventEmitter.prototype.emit,
    writable: true,
  },
  on: {
    value: EventEmitter.prototype.on,
    writable: true,
  },
});

const EMIT_FUNCTIONS = ['set', 'delete', 'clear'];

EMIT_FUNCTIONS.forEach((funcName) => {
  const func = Collection.prototype[funcName];
  Collection.prototype[funcName] = function emitWrapper(...args) {
    func.call(this, ...args);
    this.emit(funcName, args);
    return this;
  }
});
