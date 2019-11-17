const Topic = require('../models/topic');
const config = require('../config')


exports.get = async ctx => {
  const user = ctx.verification.user;
  let isTopicOwner = false

  const topic = await Topic.getByAddress(config.settings.topicAddress)

  if (topic && topic.userId === user.id) {
    isTopicOwner = true
  }

  ctx.body = {
    ...user,
    isTopicOwner,
  };
};
