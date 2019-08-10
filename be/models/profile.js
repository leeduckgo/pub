const User = require('./sequelize/user');
const Profile = require('./sequelize/profile');
const Errors = require('../models/validator/errors');
const {
  assert
} = require('../models/validator');

exports.get = async profileId => {
  const profile = await Profile.findOne({
    profileId
  });
  return profile && profile.toJSON();
}

exports.getByUserId = async userId => {
  const profile = await Profile.findOne({
    userId
  });
  return profile && profile.toJSON();
}

exports.isExist = async (providerId, options = {}) => {
  const {
    provider
  } = options;
  assert(provider, Errors.ERR_IS_REQUIRED('provider'));
  assert(providerId, Errors.ERR_IS_REQUIRED('providerId'));

  const profile = await Profile.findOne({
    where: {
      provider,
      providerId
    }
  });
  return !!profile;
}

exports.createProfile = async (profile, options = {}) => {
  const {
    provider
  } = options;
  assert(provider, Errors.ERR_IS_REQUIRED('provider'));
  assert(profile, Errors.ERR_IS_REQUIRED('profile'));
  const pickedUpData = getPickedUpData(provider, profile);
  const user = await User.create({
    providerId: pickedUpData.providerId,
    provider
  });
  const insertedProfile = await Profile.create({
    userId: user.id,
    provider,
    providerId: pickedUpData.providerId,
    name: pickedUpData.name,
    avatar: pickedUpData.avatar,
    bio: pickedUpData.bio,
    raw: JSON.stringify(profile)
  })
  return insertedProfile.toJSON();
}

const getPickedUpData = (provider, profile) => {
  assert(['github', 'wechat'].includes(provider), Errors.ERR_IS_INVALID('provider'));
  if (provider === 'github') {
    return {
      providerId: profile.id,
      name: profile.name,
      avatar: profile.avatar_url,
      bio: profile.bio
    }
  }
}