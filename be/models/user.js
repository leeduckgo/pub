const User = require('./sequelize/user');
const Profile = require('./profile');
const PrsUtil = require('prs-utility');
const util = require('../utils');
const config = require('../config');
const Wallet = require('./wallet');
const {
  assert,
  Errors
} = require('./validator')

const DEFAULT_AVATAR = 'https://static.press.one/pub/avatar.png';

const packUser = async (user, options = {}) => {
  assert(user, Errors.ERR_IS_REQUIRED('user'));

  let derivedUser = {
    id: user.id,
    address: user.address,
  };

  if (user.mixinAccountRaw) {
    const json = JSON.parse(user.mixinAccountRaw);
    derivedUser.mixinAccount = {
      user_id: json.user_id,
      full_name: json.full_name,
      avatar_url: json.avatar_url || DEFAULT_AVATAR,
      identity_number: json.identity_number
    };
  } else {
    derivedUser.mixinAccount = null;
  }

  const {
    withProfile,
    withKeys
  } = options;

  if (withProfile) {
    const profile = await Profile.getByUserId(user.id);
    assert(profile, Errors.ERR_NOT_FOUND('profile'));
    derivedUser = {
      ...derivedUser,
      name: profile.name,
      avatar: profile.avatar
    }
  }

  derivedUser.mixinWalletClientId = await Wallet.getMixinClientIdByUserId(user.id);

  if (withKeys) {
    derivedUser.privateKey = util.crypto.aesDecrypt(user.aesEncryptedHexOfPrivateKey, config.encryption.aesKey256);
  } else {
    delete derivedUser.publicKey;
  }
  delete derivedUser.aesEncryptedHexOfPrivateKey;
  return derivedUser;
}

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

exports.create = async (data) => {
  const {
    provider,
    providerId
  } = data;
  const {
    aesEncryptedHexOfPrivateKey,
    publicKey,
    address
  } = generateKey();

  assert(data, Errors.ERR_IS_REQUIRED('data'));
  assert(provider, Errors.ERR_IS_REQUIRED('provider'));
  assert(providerId, Errors.ERR_IS_REQUIRED('providerId'));
  assert(aesEncryptedHexOfPrivateKey, Errors.ERR_IS_REQUIRED('aesEncryptedHexOfPrivateKey'));
  assert(publicKey, Errors.ERR_IS_REQUIRED('publicKey'));
  assert(address, Errors.ERR_IS_REQUIRED('address'));

  const user = await User.create({
    providerId,
    provider,
    aesEncryptedHexOfPrivateKey,
    publicKey,
    address,
  });

  return packUser(user.toJSON());
}

exports.update = async (userId, data) => {
  assert(userId, Errors.ERR_IS_REQUIRED('userId'));
  assert(data, Errors.ERR_IS_REQUIRED('data'));

  await User.update(data, {
    where: {
      id: userId
    }
  });

  return true;
}

exports.get = async (id, options) => {
  return await get({
    id
  }, options);
}

exports.getByAddress = async (address, options) => {
  return await get({
    address
  }, options);
}

const get = async (query = {}, options = {}) => {
  const {
    withKeys,
    withProfile,
  } = options;
  const user = await User.findOne({
    where: query
  });
  if (!user) {
    return null;
  }
  const derivedUser = await packUser(user.toJSON(), {
    withKeys,
    withProfile,
  });
  return derivedUser;
}