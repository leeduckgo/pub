const config = require('../../config');
const BlockQueue = require('./block');
const {
  createSyncMixinSnapshotsQueue,
  createSyncInitializedQueue
} = require('./mixin');
const queues = [];

exports.up = () => {
  if (config.queue.syncBlock) {
    queues.push(BlockQueue.create());
  }
  if (config.provider.mixin.sync) {
    queues.push(createSyncMixinSnapshotsQueue());
    queues.push(createSyncInitializedQueue());
  }
}

exports.down = () => {
  for (const queue of queues) {
    queue.close();
  }
}