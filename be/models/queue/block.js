const {
  createQueue
} = require('./utils');
const Block = require('../block');

exports.create = () => {
  const queue = createQueue('SYNC_BLOCKS', {
    limiter: {
      max: 1,
      duration: 2000 * 1
    }
  });

  queue.add('SYNC', {}, {
    priority: 1,
    removeOnComplete: true,
    removeOnFail: true
  });

  queue.process('SYNC', Block.sync);

  return queue;
}