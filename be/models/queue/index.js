const BlockQueue = require('./block');
const {
  createSyncMixinSnapshotsQueue,
  createSyncInitializedQueue
} = require('./mixin');
const queues = [];

exports.up = () => {
  queues.push(BlockQueue.create());
  queues.push(createSyncMixinSnapshotsQueue());
  queues.push(createSyncInitializedQueue());
}

exports.down = () => {
  for (const queue of queues) {
    queue.close();
  }
}