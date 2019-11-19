const {
  createQueue
} = require('./utils');
const Block = require('../block');
const config = require('../../config');

exports.create = () => {
  const queue = createQueue(`${config.serviceName}_SYNC_BLOCKS`, {
    limiter: {
      max: 1,
      duration: 60 * 1000 * 1
    }
  });

  queue.add(`${config.serviceName}_SYNC`, {}, {
    priority: 1,
    repeat: {
      every: 60 * 1000 * 1
    },
    removeOnComplete: true,
    removeOnFail: true
  });

  queue.process(`${config.serviceName}_SYNC`, Block.sync);

  return queue;
}