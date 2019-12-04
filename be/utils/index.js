const config = require('../config');

exports.crypto = require('./crypto');
exports.mimeTypes = require('./mimeTypes');

exports.log = message => {
  if (config.debug) {
    console.log(message);
  }
}