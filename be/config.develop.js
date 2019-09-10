'use strict';

const serviceRoot = 'http://localhost:8097';

const config = {
  env: 'development',

  serviceRoot,

  host: '127.0.0.1',

  port: '8097',

  mysql: {
    host: '127.0.0.1',
    port: 3306,
    database: 'pub',
    user: 'root',
    password: '632330abc',
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
    },
    timezone: 'utc',
  },

  redis: {
    host: '127.0.0.1',
    port: 6379,
    connectTimeout: 1000 * 3,
  },

  sessionKeys: ['0b06684a4a6274df375aa1e128c4ab69'],

  session: {
    key: 'pub:sess',
    maxAge: 1000 * 60 * 60 * 24,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: false,
    renew: false,
  },

  github: {
    clientID: 'a269deced07c748a3526',
    clientSecret: '8cf2b9c75e540588be69ecbd498fee808abbeadd',
    loginUrl: '/api/auth/github/login',
    callbackUrl: `${serviceRoot}/api/auth/github/callback`
  },

  mixin: {
    clientId: '73542b48-ebaa-48da-9587-302cc4095c37',
    clientSecret: 'daf786d6738c2b44a3f884f23fcf68db99103128241bcbc0345d1660155c8d5b',
    pinCode: '106379',
    sessionId: 'f639296b-e456-45b1-b480-ae2ec8f2c11a',
    pinToken: 'QFXR1XbcQJcJnHenTHJsFYJ1VKfHMvcUenbLryBboEdWpsaAsU2l8xKZib/fF2Oz6Z5OA2vHqdePGw/5mZcHk4Y9XiAs8X62AQKvrVh/NcqHycizQvNONQG1hjMKl0XoCMGf8K35pslLNQlvvqxwsgDNuOA2z8aeVQtFHAcplyQ=',
    privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQDRmlgAnT2onmaXJnxJZLxnLtHe941udiTrqQ9Zk/a4Y6bTFF0O
qNt5GxgvFRUzoVBhg6CjQHWFHPqYtCDYzAlqA9QwgCTEH9EfZyLa0rjqVfVGnirs
RUR7GWzhvGRmtMcnwA3rhCAiKK7ArkgIu4PuDscFq1COd2Mau/s1Sa2ajQIDAQAB
AoGBAIN12lwIQvPO5WlHqgweMkxFATxm5z2wu9dSYV49fzCGz8rzqqnXHlAGvlRJ
VNLdCh0fAVFizFKAqmu8Dh3rWrsQpSMY7IbSqseGlspA6dwtBm0M1khtm2AQAgKK
4eny2lA9B/RLht/kQMUidL5JCQ407SWsUD4eGtYH5twwgCYBAkEA7R5o+ppGUQnV
muVGf9AlJv76g23/71YTl5GU4WvtDqYNt7pCoOOgsZNQDXjd1OMNoS61Ccl8NQFF
Ue+4IombuQJBAOJLCAHOdD8S2+AuU+b2ij9jWdX1fczKJXfg9uCF8pgNWg+/3vnJ
id2+An7EZprZVTrm+OFdwFuJqvJJDAEyZ3UCQEjQZtJV37Pw/iwzreN/6njAIfOM
KuS3HQsVRI+4kbJG4b2CsAUyAV2mbBXHAO/nzX6qliNsQP0R59SSdYv9j9kCQEFm
yAiln4k/LRcMrKka5ffOAf/JdLNEVTHhbdiUPfneGgJlRM9ShSr2KIh0wObOG0jr
ylBwJREPp71giTyrUaUCQCwzp85Fyab1I8G0ISCsbuVf2lNQ6bhqQDQZUhBWeDeI
Xr2NSYgymfIZVuVBSKrC0nc1yD4/4Krl1WzPoa5sKNo=
-----END RSA PRIVATE KEY-----`,
    loginUrl: '/api/auth/mixin/login',
    callbackUrl: `${serviceRoot}/api/auth/mixin/callback`,
  },

  pressone: {
    appAddress: '9f5d563e5246367cb718bcb2583cff39fcc65ff6',
    loginUrl: '/api/auth/pressone/login',
    callbackUrl: `${serviceRoot}/api/auth/pressone/callback`,
  },

  tokenPrivateKey: 'kCtfo6go2PQYgXUAYJIqdLkKIxD8C7EwYAFC58kezgQsCzbu+NchwZx+tS/+rQGMFw+kzZHQkkcCz1reSdUgcg==',

  authTokenKey: 'pub_token',

  aesKey256: [
    11, 19, 1, 2, 30, 5, 0, 13, 8, 6, 27, 3, 21, 26, 7,
    25, 9, 20, 31, 17, 22, 14, 24, 23, 29, 15, 4, 16, 18,
    28, 12, 10,
  ],

  testPort: 8092,

  queuePort: 8093,

  prsEndpoint: 'http://127.0.0.1:8090',

  sync: false,

  sentryDsn: 'https://d2fcc4193e3548b28f191e97c97c4ff8@sentry.xue.cn/9',

  permissionDenyUrl: 'http://localhost:4201/permissionDeny',

  whitelist: {
    mixin: [
      1095057
    ],
    github: []
  },

  settings: {
    title: 'BOX 定投践行社群写作工具 | 自学网',
    postsEndpoint: 'http://localhost:4008',
    slogan: '分享你的定投笔记',
    authProviders: ['mixin'],
    topicAddress: '982c3165cd167532a9924d048fec0a7eda9ad2a0',
    denyText: '您需要加入【BOX 定投践行群】才能使用这个写作工具',
    denyActionText: '如何加入？',
    denyActionLink: 'https://support.exinone.com/hc/zh-cn/articles/360032511651-关于加入-BOX-定投践行群-的说明'
  },
  
  boxGroupToken: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',

  xueUserExtraApi: 'https://dev.prsdev.club/hub/api/users-extra',

  xueAdminToken: '06d60bd1df9d5bd240b19c37313f822fd996b61912099e4d843fc0a29caf5895b997e93bbdbe1835359acb8a45f67e07c04d953794784f8ff7a2fd1a4b0103cd'
};

module.exports = config;