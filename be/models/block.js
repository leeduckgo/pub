const config = require('../config');
const Block = require('../models/sequelize/block');
const {
  assert,
  Errors
} = require('../models/validator');
const request = require('request-promise');

exports.get = async id => {
  assert(id, Errors.ERR_IS_REQUIRED('id'));
  const block = await Block.findOne({
    where: {
      id,
    }
  });
  return block ? block.toJSON() : null;
};


const log = (message) => {
  console.log(`【同步区块】: ${message}`)
}

exports.create = async (block) => {
  const dbBlock = await Block.create(block);
  return dbBlock.toJSON();
}

const getBlock = (rId) => {
  return request({
    uri: `${config.prsEndpoint}/api/v2/blocks/${rId}`,
    json: true,
    headers: {
      accept: 'application/json'
    },
  }).promise();
}

exports.sync = async () => {
  const dbUnSyncBlock = await Block.findOne({
    where: {
      blockNum: null,
      blockTransactionId: null
    }
  });
  if (!dbUnSyncBlock) {
    log('暂时没有需要同步的区块');
    return;
  }
  const unSyncBlock = dbUnSyncBlock.toJSON();
  const latestBlocks = await getBlock(unSyncBlock.id);
  const latestBlock = latestBlocks[0];
  assert(latestBlock, Errors.ERR_NOT_FOUND('latestBlock'));
  log(`区块ID，${latestBlock.id}`)
  const {
    blockNum,
    blockTransactionId
  } = latestBlock;
  const isUnSynced = !blockNum || !blockTransactionId;
  if (isUnSynced) {
    log('区块没有 blockNum 或者 blockTransactionId，本次同步失败，开始尝试下一次...');
    return;
  }
  await Block.update({
    blockNum,
    blockTransactionId
  }, {
    where: {
      id: unSyncBlock.id
    }
  })
}