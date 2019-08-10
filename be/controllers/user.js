const User = require('../models/user');

exports.get = async ctx => {
  const {
    user
  } = ctx.verification;
  ctx.body = user;
};