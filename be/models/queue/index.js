const BlockQueue = require('./block');

const queues = [];

exports.up = () => {
  console.log(` ------------- up queue ---------------`);
  queues.push(BlockQueue.create());
}

exports.down = () => {
  for (const queue of queues) {
    queue.close();
  }
}