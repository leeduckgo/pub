const Topic = require('../models/topic');
const Log = require('../models/log');

exports.create = async ctx => {
  const {
    user
  } = ctx.verification;
  const data = ctx.request.body.payload;
  const topic = await Topic.create({
    userId: user.id,
    ...data
  });
  Log.create(user.id, `创建 Topic，id ${topic.id}`);
  ctx.body = topic;
}