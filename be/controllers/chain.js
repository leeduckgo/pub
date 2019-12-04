const request = require('request-promise');
const {
  mimeTypes
} = require('../utils')
const config = require('../config');
const User = require('../models/user');
const PrsUtil = require('prs-utility');
const {
  assert,
  Errors
} = require('../models/validator');
const Block = require('../models/block');
const Topic = require('../models/topic');

const SIGN_URL = `${config.prsEndpoint}/api/v2/datasign`;

const signBlock = (data) => {
  return request({
    method: 'post',
    uri: SIGN_URL,
    json: true,
    headers: {
      accept: 'application/json'
    },
    body: data
  }).promise();
}

const getPostfix = mimeType => {
  let postfix;
  for (const key in mimeTypes) {
    if (mimeTypes[key] === mimeType) {
      postfix = key;
      break;
    }
  }
  return postfix;
}

const getFileUrl = file => {
  const name = file.msghash;
  const postfix = getPostfix(file.mimeType);
  return `${config.serviceRoot}/api/storage/${name}.${postfix}`;
}

const getFilePayload = ({
  file,
  user,
  topic,
}, options = {}) => {

  assert(file, Errors.ERR_IS_REQUIRED('file'));
  assert(user, Errors.ERR_IS_REQUIRED('user'));
  assert(topic, Errors.ERR_IS_REQUIRED('topic'));

  const data = {
    file_hash: file.msghash,
    topic
  };

  const {
    updatedFile
  } = options;
  if (updatedFile) {
    assert(updatedFile.block, Errors.ERR_IS_REQUIRED('updatedFile.block'));
    const {
      blockTransactionId,
      blockNum
    } = updatedFile.block;
    assert(blockTransactionId, Errors.ERR_IS_REQUIRED('blockTransactionId'));
    assert(blockNum, Errors.ERR_IS_REQUIRED('blockNum'));
    data.updated_file_id = `${blockTransactionId}@${blockNum}`;
  }

  assert(user.mixinClientId, Errors.ERR_NOT_FOUND('user.mixinClientId'));

  const payload = {
    user_address: user.address,
    type: 'PIP:2001',
    meta: {
      uris: [getFileUrl(file)],
      mime: `${file.mimeType};charset=UTF-8`,
      encryption: "aes-256-cbc",
      payment_url: `mixin://transfer/${user.mixinClientId}`
    },
    data,
    hash: PrsUtil.hashBlockData(data),
    signature: PrsUtil.signBlockData(data, user.privateKey).signature
  };
  return payload;
}

const getTopicPayload = (options = {}) => {
  const {
    userAddress,
    topic,
    type,
  } = options;
  const data = {
    [type]: userAddress,
    topic: topic.address,
  }
  const payload = {
    user_address: topic.address,
    type: 'PIP:2001',
    meta: [],
    data,
    hash: PrsUtil.hashBlockData(data),
    signature: PrsUtil.signBlockData(data, topic.privateKey).signature
  };
  return payload;
}

const packBlock = block => {
  const result = {};
  delete block['createdAt'];
  for (const key in block) {
    const value = block[key];
    const isObj = typeof value === 'object';
    result[key] = isObj ? JSON.stringify(value) : value;
  }
  return result;
}

exports.pushFile = async (file, options = {}) => {
  const user = await User.get(file.userId, {
    withKeys: true,
  });
  const {
    updatedFile
  } = options;
  const payload = getFilePayload({
    file,
    user,
    topic: config.settings.topicAddress,
  }, {
    updatedFile
  });
  const block = await signBlock(payload);
  assert(block, Errors.ERR_NOT_FOUND('block'));
  const packedBlock = packBlock(block);
  const dbBlock = await Block.create(packedBlock);
  return dbBlock;
}

/**
 * @param {object} options
 * @param {number} options.userAddress
 * @param {string} options.topicAddress
 * @param {'allow' | 'deny'} [options.type]
 */
exports.pushTopic = async (options = {}) => {
  const {
    userAddress,
    topicAddress,
    type = 'allow',
  } = options;
  assert(userAddress, Errors.ERR_IS_REQUIRED('userAddress'));
  assert(topicAddress, Errors.ERR_IS_REQUIRED('topicAddress'));
  assert(['allow', 'deny'].includes(type), Errors.ERR_IS_INVALID('type'));
  const topic = await Topic.getByAddress(topicAddress, {
    withKeys: true
  });
  const payload = getTopicPayload({
    userAddress,
    type,
    topic
  });
  const block = await signBlock(payload);
  assert(block, Errors.ERR_NOT_FOUND('block'));
  const packedBlock = packBlock(block);
  const dbBlock = await Block.create(packedBlock);
  return dbBlock;
}
