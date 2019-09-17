const config = require('../config');
const Block = require('../models/sequelize/block');
const File = require('./file');
const socketIo = require('./socketIo');
const {
  assert,
  Errors
} = require('../models/validator');
const request = require('request-promise');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

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

exports.update = async (id, data) => {
  assert(id, Errors.ERR_IS_REQUIRED('id'));
  assert(data, Errors.ERR_IS_REQUIRED('data'));
  assert(data.blockNum, Errors.ERR_IS_REQUIRED('blockNum'));
  assert(data.blockTransactionId, Errors.ERR_IS_REQUIRED('blockTransactionId'));
  await Block.update({
    blockNum: data.blockNum,
    blockTransactionId: data.blockTransactionId
  }, {
    where: {
      id
    }
  });
  const file = await File.getByRId(id);
  socketIo.sendToUser(file.userId, socketIo.EVENTS.FILE_PUBLISHED, file);
  return true;
};

const getBlock = (rId) => {
  return request({
    uri: `${config.prsEndpoint}/api/v2/blocks/${rId}`,
    json: true,
    headers: {
      accept: 'application/json'
    },
  }).promise();
}

exports.getAllowBlockByAddress = async address => {
  const block = await Block.findOne({
    where: {
      data: {
        [Op.like]: `%"allow":"${address}"%`
      }
    }
  });
  return block ? block.toJSON() : null;
}

exports.sync = async () => {
  const dbUnSyncBlock = await Block.findOne({
    where: {
      blockNum: null,
      blockTransactionId: null,
      data: {
        [Op.like]: `%"allow":%`
      }
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