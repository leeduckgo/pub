'use strict';

const config = require('../config');
const auth = require('../models/auth');
const {
  assert,
  throws,
  Errors
} = require('../models/validator');
const User = require('../models/user');
const Profile = require('../models/profile');
const Wallet = require('../models/wallet');
const Token = require('../models/token');
const Block = require('../models/block');
const Log = require('../models/log');
const Permission = require('../models/permission');
const Chain = require('./chain');

const providers = config.settings['auth.providers'];

const DEFAULT_AVATAR = 'https://static.press.one/pub/avatar.png';

const oauth = (ctx, oauthType) => {
  const {
    authenticate
  } = auth;
  const {
    provider
  } = ctx.params;
  assert(provider === 'mixin' || providers.includes(provider), Errors.ERR_IS_INVALID(`provider: ${provider}`))
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
  const whitelist = config.auth.whitelist[provider];
  const isInWhiteList = whitelist && whitelist.includes(~~providerId);
  if (isInWhiteList) {
    return true;
  }
  const hasProviderPermission = await providerPermissionChecker[provider](profile);
  return hasProviderPermission;
}

const providerPermissionChecker = {
  mixin: async profile => {
    // can check mixin permission
    return true;
  },
  github: async profile => {
    // can check github permission
    return true;
  }
};

exports.oauthCallback = async ctx => {
  try {
    const {
      provider
    } = ctx.params;

    const user = await handleOauthCallback(ctx, provider);
    assert(user, Errors.ERR_NOT_FOUND(`${provider} user`));

    const profile = providerGetter[provider](user);

    const {
      oauthType
    } = ctx.session;
    assert(oauthType, Errors.ERR_IS_REQUIRED('oauthType'));

    if (oauthType === 'login') {
      if (config.settings['permission.isPrivate']) {
        const hasPermission = await checkPermission(provider, profile);
        const noPermission = !hasPermission;
        if (noPermission) {
          Log.createAnonymity(profile.id, `没有 ${provider} 权限，raw ${profile.raw}`);
          const clientHost = ctx.session.auth.redirect.split('/').slice(0, 3).join('/');
          ctx.redirect(`${clientHost}/permissionDeny`);
          return false;
        }
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
  } catch (err) {
    console.log(err);
    throws(Errors.ERR_FAIL_TO_LOGIN)
  }
}

const handleOauthCallback = async (ctx, provider) => {
  const {
    authenticate
  } = auth;
  assert(authenticate[provider], Errors.ERR_IS_INVALID(`provider: ${provider}`))
  assert(ctx.session, Errors.ERR_IS_REQUIRED('session'));
  assert(ctx.session.oauthType, Errors.ERR_IS_REQUIRED('session.oauthType'));
  assert(ctx.session.auth, Errors.ERR_IS_REQUIRED('session.auth'));
  assert(ctx.session.auth.redirect, Errors.ERR_IS_REQUIRED('session.auth.redirect'));
  assert(ctx.session.auth.provider === provider, Errors.ERR_IS_INVALID(`provider mismatch: ${provider}`));

  await authenticate[provider](ctx, () => {});
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
    Log.create(user.id, `我被创建了`);
    Log.create(user.id, `钱包不存在，初始化成功`);
  } else {
    insertedProfile = await Profile.get(profile.id);
    Log.create(insertedProfile.userId, `登录成功`);
    const {
      userId
    } = insertedProfile;
    const walletExists = await Wallet.exists(userId);
    if (walletExists) {
      Log.create(userId, `钱包已存在，无需初始化`);
    } else {
      await Wallet.tryCreateWallet(userId);
      Log.create(userId, `钱包不存在，初始化成功`);
    }
  }

  const topicAddress = config.topic.address;

  const insertedUser = await User.get(insertedProfile.userId);
  const allowBlock = await Block.getAllowBlockByAddress(insertedUser.address);

  if (topicAddress && !allowBlock) {
    Permission.setPermission({
      userId: insertedUser.id,
      topicAddress,
      type: 'allow',
    })

    const block = await Chain.pushTopic({
      userAddress: insertedUser.address,
      topicAddress,
      type: 'allow',
    });
    Log.create(insertedProfile.userId, `提交 allow 区块, blockId ${block.id}`);
  }

  const token = await Token.create({
    userId: insertedProfile.userId,
    providerId: insertedProfile.providerId
  });

  ctx.cookies.set(
    config.auth.tokenKey,
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
  }
}