const Topic = require('../models/topic');

exports.create = async ctx => {
  const {
    user
  } = ctx.verification;
  const data = ctx.request.body.payload;
  const topic = await Topic.create({
    userId: user.id,
    ...data
  });
  ctx.body = topic;
}