const config = require('../../config');
const BlockQueue = require('./block');
const {
  createSyncMixinSnapshotsQueue,
  createSyncInitializedQueue
} = require('./mixin');
const queues = [];

exports.up = () => {
  if (config.syncBlock) {
    console.log(` ------------- 队列开始同步区块 ---------------`);
    queues.push(BlockQueue.create());
  }
  if (config.mixin.sync) {
    console.log(` ------------- 队列开始同步 Mixin 交易 ---------------`);
    queues.push(createSyncMixinSnapshotsQueue());
    queues.push(createSyncInitializedQueue());
  }
}

exports.down = () => {
  for (const queue of queues) {
    queue.close();
  }
}