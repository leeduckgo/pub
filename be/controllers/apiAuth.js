'use strict';

const request = require('request-promise');
const config = require('../config');
const auth = require('../models/auth');
const {
  assert,
  Errors
} = require('../models/validator');
const User = require('../models/user');
const Profile = require('../models/profile');
const Wallet = require('../models/wallet');
const Token = require('../models/token');
const Block = require('../models/block');
const Log = require('../models/log');
const Chain = require('./chain');

const providers = ['pressone', 'github', 'mixin'];

const DEFAULT_AVATAR = 'https://static.press.one/pub/avatar.png';

const oauth = (ctx, oauthType) => {
  const {
    authenticate
  } = auth;
  const {
    provider
  } = ctx.params;
  assert(providers.includes(provider), Errors.ERR_IS_INVALID(`provider: ${provider}`))
  assert(authenticate[provider], Errors.ERR_IS_INVALID(`provider: ${provider}`));
  assert(ctx.query.redirect, Errors.ERR_IS_REQUIRED('redirect'));
  ctx.session.oauthType = oauthType;
  ctx.session.auth = {
    provider: ctx.params.provider,
    redirect: ctx.query.redirect
  };
  return authenticate[provider](ctx);
}

exports.oauthLogin = async ctx => {
  return oauth(ctx, 'login');
};

exports.oauthBind = async ctx => {
  return oauth(ctx, 'bind');
};

const checkPermission = async (provider, profile) => {
  const providerId = profile.id;
  const isInWhiteList = config.whitelist[provider].includes(~~providerId);
  if (isInWhiteList) {
    return true;
  }
  const hasProviderPermission = await providerPermissionChecker[provider](profile);
  return hasProviderPermission;
}

const providerPermissionChecker = {
  mixin: async profile => {
    const rawJson = JSON.parse(profile.raw);
    const IsInMixinBoxGroup = await checkIsInMixinBoxGroup(rawJson.user_id);
    return IsInMixinBoxGroup;
  },
  github: async profile => {
    const isPaidUserOfXue = await checkIsPaidUserOfXue(profile.name);
    return isPaidUserOfXue;
  },
};

const checkIsInMixinBoxGroup = async mixinUuid => {
  try {
    await request({
      uri: `https://xiaolai-ri-openapi.groups.xue.cn/v1/users/${mixinUuid}`,
      json: true,
      headers: {
        Authorization: `Bearer ${config.boxGroupToken}`
      },
    }).promise();
    return true;
  } catch (err) {
    return false;
  }
}

const checkIsPaidUserOfXue = async githubNickName => {
  try {
    const user = await request({
      uri: `${config.xueUserExtraApi}/${githubNickName}`,
      json: true,
      headers: {
        'x-po-auth-token': config.xueAdminToken
      },
    }).promise();
    const isPaidUser = user.balance > 0;
    return isPaidUser;
  } catch (err) {
    return false;
  }
}

exports.oauthCallback = async (ctx, next) => {
  const {
    provider
  } = ctx.params;

  let user;
  if (provider === 'pressone') {
    user = await handlePressOneCallback(ctx, provider);
  } else {
    user = await handleOauthCallback(ctx, next, provider);
  }
  assert(user, Errors.ERR_NOT_FOUND(`${provider} user`));

  const profile = providerGetter[provider](user);

  const {
    oauthType
  } = ctx.session;
  assert(oauthType, Errors.ERR_IS_REQUIRED('oauthType'));

  if (oauthType === 'login') {
    Log.createAnonymity(profile.id, `登陆 oauth 成功`);
    const hasPermission = await checkPermission(provider, profile);
    const noPermission = !hasPermission;
    if (noPermission) {
      Log.createAnonymity(profile.id, `没有 ${provider} 权限，raw ${profile.raw}`);
      ctx.redirect(config.permissionDenyUrl);
      return false;
    }
    await login(ctx, user, provider);
  } else if (oauthType === 'bind') {
    assert(provider === 'mixin', Errors.ERR_IS_INVALID('provider'))
    const {
      user
    } = ctx.verification;
    assert(user, Errors.ERR_NOT_FOUND(`user`));
    await User.update(user.id, {
      mixinAccountRaw: profile.raw
    });
  }

  ctx.redirect(ctx.session.auth.redirect);
}

const handlePressOneCallback = async (ctx) => {
  const {
    userAddress
  } = ctx.query;
  assert(userAddress, Errors.ERR_IS_REQUIRED('userAddress'));
  const user = await request({
    uri: `https://press.one/api/v2/users/${userAddress}`,
    json: true,
    headers: {
      accept: 'application/json'
    },
  }).promise();
  return user
}

const handleOauthCallback = async (ctx, next, provider) => {
  const {
    authenticate
  } = auth;
  assert(authenticate[provider], Errors.ERR_IS_INVALID(`provider: ${provider}`))
  assert(ctx.session, Errors.ERR_IS_REQUIRED('session'));
  assert(ctx.session.oauthType, Errors.ERR_IS_REQUIRED('session.oauthType'));
  assert(ctx.session.auth, Errors.ERR_IS_REQUIRED('session.auth'));
  assert(ctx.session.auth.redirect, Errors.ERR_IS_REQUIRED('session.auth.redirect'));
  assert(ctx.session.auth.provider === provider, Errors.ERR_IS_INVALID(`provider mismatch: ${provider}`));

  await authenticate[provider](ctx, next);
  assert(ctx.session, Errors.ERR_IS_REQUIRED('session'));
  assert(ctx.session.passport, Errors.ERR_IS_REQUIRED('session.passport'));
  assert(ctx.session.passport.user, Errors.ERR_IS_REQUIRED('session.passport.user'));
  assert(ctx.session.passport.user.auth, Errors.ERR_IS_REQUIRED('session.passport.user.auth'));
  assert(ctx.session.passport.user.auth.accessToken, Errors.ERR_IS_REQUIRED('session.passport.user.auth.accessToken'));
  assert(ctx.session.passport.user.provider === provider, Errors.ERR_IS_INVALID(`provider mismatch: ${provider}`));

  const {
    user
  } = ctx.session.passport;
  return user;
}

const login = async (ctx, user, provider) => {
  const profile = providerGetter[provider](user);
  const isNewUser = !await Profile.isExist(profile.id, {
    provider,
  });
  let insertedProfile = {};
  if (isNewUser) {
    const userData = {
      providerId: profile.id,
      provider
    };
    if (provider === 'mixin') {
      userData.mixinAccountRaw = provider.raw;
    }
    const user = await User.create(userData);
    insertedProfile = await Profile.createProfile({
      userId: user.id,
      profile,
      provider
    });
    await Wallet.tryCreateWallet(user.id);
    const wallet = await Wallet.getByUserId(user.id, {
      isRaw: true
    });
    Log.create(user.id, `我被创建了`);
    const walletStr = JSON.stringify(wallet);
    Log.create(user.id, `钱包 ${walletStr.slice(0, 3500)}`);
    Log.create(user.id, `钱包 ${walletStr.slice(3500)}`);
  } else {
    insertedProfile = await Profile.get(profile.id);
    Log.create(insertedProfile.userId, `登陆成功`);
    const {
      userId
    } = insertedProfile;
    const wallet = await Wallet.getByUserId(userId, {
      isRaw: true
    });
    if (!wallet) {
      await Wallet.tryCreateWallet(userId);
    } else {
      console.log(`${userId}： 钱包已存在，无需初始化`);
      const walletStr = JSON.stringify(wallet);
      Log.create(userId, `钱包已存在，无需初始化`);
      Log.create(userId, `钱包 ${walletStr.slice(0, 3500)}`);
      Log.create(userId, `钱包 ${walletStr.slice(3500)}`);
    }
  }

  // 暂时只给 mixin, github 登陆的账号授权，其他账号可以用来测试【无授权】的情况
  const isProduction = config.env === 'production';
  const {
    topicAddress
  } = config.settings;
  if (topicAddress && isProduction && ['mixin', 'github'].includes(provider)) {
    const insertedUser = await User.get(insertedProfile.userId);
    const allowBlock = await Block.getAllowBlockByAddress(insertedUser.address);
    if (!allowBlock) {
      const block = await Chain.pushTopic({
        userAddress: insertedUser.address,
        topicAddress
      });
      Log.create(insertedProfile.userId, `提交 allow 区块, blockId ${block.id}`);
    }
  }

  const token = await Token.create({
    userId: insertedProfile.userId,
    providerId: insertedProfile.providerId
  });

  ctx.cookies.set(
    config.authTokenKey,
    token, {
      expires: new Date('2100-01-01')
    }
  )
}

const providerGetter = {
  github: user => {
    return {
      id: user._json.id,
      name: user.username,
      avatar: user._json.avatar_url || DEFAULT_AVATAR,
      bio: user._json.bio,
      raw: user._raw,
    };
  },

  mixin: user => {
    return {
      id: user._json.identity_number,
      name: user._json.full_name,
      avatar: user._json.avatar_url || DEFAULT_AVATAR,
      bio: '',
      raw: JSON.stringify(user._json)
    }
  },

  pressone: user => {
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar || DEFAULT_AVATAR,
      bio: user.bio,
      raw: JSON.stringify(user)
    }
  }
}