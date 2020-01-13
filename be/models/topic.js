const User = require('./user');
const Topic = require('./sequelize/topic');
const Errors = require('../models/validator/errors');
const Joi = require('joi');
const {
  attempt,
  assert
} = require('../models/validator');
const PrsUtil = require('prs-utility');
const util = require('../utils');
const config = require('../config');

const generateKey = () => {
  const {
    privateKey,
    publicKey,
    address
  } = PrsUtil.createKeyPair({
    dump: true
  });
  const aesEncryptedHexOfPrivateKey = util.crypto.aesCrypto(privateKey, config.encryption.aesKey256);
  return {
    aesEncryptedHexOfPrivateKey,
    publicKey,
    address,
  }
}

const packTopic = async (topic, options = {}) => {
  assert(topic, Errors.ERR_IS_REQUIRED('topic'));
  const topicJson = topic.toJSON();
  const {
    withKeys
  } = options;
  if (withKeys) {
    topicJson.privateKey = util.crypto.aesDecrypt(topicJson.aesEncryptedHexOfPrivateKey, config.encryption.aesKey256);
    delete topicJson.aesEncryptedHexOfPrivateKey;
  } else {
    delete topicJson.publicKey;
    delete topicJson.aesEncryptedHexOfPrivateKey;
  }
  const user = await User.get(topicJson.userId);
  topicJson.user = user;
  return topicJson;
}

exports.create = async topic => {
  attempt(topic, {
    userId: Joi.number().required(),
    name: Joi.string().required(),
  });

  const user = await User.get(topic.userId);
  assert(user, Errors.ERR_IS_REQUIRED('user'));

  const {
    address,
    publicKey,
    aesEncryptedHexOfPrivateKey
  } = generateKey();
  assert(address, Errors.ERR_IS_REQUIRED('address'));
  assert(publicKey, Errors.ERR_IS_REQUIRED('publicKey'));
  assert(aesEncryptedHexOfPrivateKey, Errors.ERR_IS_REQUIRED('aesEncryptedHexOfPrivateKey'));

  const insertedTopic = await Topic.create({
    userId: topic.userId,
    name: topic.name,
    address,
    publicKey,
    aesEncryptedHexOfPrivateKey
  })
  return insertedTopic.toJSON();
}

exports.getByAddress = async (address, options = {}) => {
  const {
    withKeys
  } = options;
  assert(address, Errors.ERR_IS_REQUIRED('address'));
  const topic = await Topic.findOne({
    where: {
      address,
    }
  });
  if (!topic) {
    return null
  }
  const derivedTopic = await packTopic(topic, {
    withKeys
  });
  return derivedTopic;
};