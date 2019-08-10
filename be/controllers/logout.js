const Token = require('../models/token');
const config = require('../config');

exports.logout = async (ctx) => {
  const {
    token
  } = ctx.verification;
  await Token.delFromRedis(token);
  ctx.cookies.set(config.authTokenKey)
  ctx.body = true;
}