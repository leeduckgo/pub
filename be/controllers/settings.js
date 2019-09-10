const config = require('../config');

exports.get = async ctx => {
  ctx.body = config.settings;
}