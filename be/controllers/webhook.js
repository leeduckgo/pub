const Block = require('../models/block');
const {
  assert,
  Errors
} = require('../models/validator');

const log = (message) => {
  console.log(`【同步区块】: ${message}`)
}

exports.mediumCallback = async (ctx) => {
  const {
    block
  } = ctx.request.body;
  assert(block, Errors.ERR_IS_REQUIRED('block'));
  const dbUnSyncBlock = await Block.get(block.id);
  assert(dbUnSyncBlock, Errors.ERR_NOT_FOUND('block'));
  log(`区块ID，${block.id}`);
  setTimeout(async () => {
    await Block.update(block.id, {
      blockNum: block.blockNum,
      blockTransactionId: block.blockTransactionId,
    });
  }, 1000 * 60 * 2);
  ctx.body = {
    success: true
  };
}