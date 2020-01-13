'use strict';

const passport = require('koa-passport');
const GithubStrategy = require('passport-github2').Strategy;
const MixinStrategy = require('passport-mixin').Strategy;
const config = require('../config');

const buildPassport = () => {
  if (config.provider.github) {
    passport.use(new GithubStrategy({
      clientID: config.provider.github.clientID,
      clientSecret: config.provider.github.clientSecret,
      callbackURL: config.provider.github.callbackUrl
    }, (accessToken, refreshToken, profile, callback) => {
      profile.auth = {
        accessToken: accessToken,
        refreshToken: refreshToken
      };
      callback(null, profile);
    }));
  }

  if (config.provider.mixin) {
    passport.use(new MixinStrategy({
      clientID: config.provider.mixin.clientId,
      clientSecret: config.provider.mixin.clientSecret,
      callbackURL: config.provider.mixin.callbackUrl
    }, (accessToken, refreshToken, profile, callback) => {
      profile.auth = {
        accessToken: accessToken,
        refreshToken: refreshToken
      };
      callback(null, profile);
    }));
  }

  passport.serializeUser((user, callback) => {
    callback(null, user);
  });

  passport.deserializeUser((obj, callback) => {
    callback(null, obj);
  });

  return passport;
};

const authenticate = {
  github: passport.authenticate('github', {
    failureRedirect: config.provider.github.loginUrl,
    scope: ['read:user']
  }),

  mixin: passport.authenticate('mixin', {
    failureRedirect: config.provider.mixin.loginUrl,
    scope: 'PROFILE:READ'
  }),

  pressone: ctx => {
    ctx.redirect(`https://press.one/developer/apps/${config.provider.pressone.appAddress}/authorize?scope=user`);
  }
};

module.exports = {
  authenticate,
  buildPassport
};