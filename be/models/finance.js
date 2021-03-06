const mathjs = require('mathjs');
const Mixin = require('mixin-node');
const rfc3339nano = require('rfc3339nano');
const config = require('../config');
const User = require('./user');
const Wallet = require('./wallet');
const socketIo = require('./socketIo');
const Cache = require('./cache');
const Log = require('./log');
const {
  log
} = require('../utils');
const Receipt = require('./receipt');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const {
  Joi,
  assert,
  attempt,
  Errors,
  assertFault
} = require('./validator');
const {
  parseAmount,
  currencyMapAsset
} = Receipt;

const balanceCacheKey = `${config.serviceKey}_BALANCE_CACHE_KEY`;

const mixin = new Mixin({
  client_id: config.provider.mixin.clientId,
  aeskey: config.provider.mixin.aesKey,
  pin: config.provider.mixin.pinCode,
  session_id: config.provider.mixin.sessionId,
  privatekey: Buffer.from(config.provider.mixin.privateKey, 'utf8')
});

const getViewToken = snapshotId => {
  return mixin.getViewToken(`/network/snapshots/${snapshotId}`, {
    timeout: 60 * 60 * 24 * 365 * 100 // 100 years
  });
};

const getMixinPaymentUrl = (options = {}) => {
  const {
    toMixinClientId,
    asset,
    amount,
    trace,
    memo
  } = options;
  return (
    'https://mixin.one/pay' +
    '?recipient=' +
    encodeURIComponent(toMixinClientId) +
    '&asset=' +
    encodeURIComponent(asset) +
    '&amount=' +
    encodeURIComponent(amount) +
    '&trace=' +
    encodeURIComponent(trace) +
    '&memo=' +
    encodeURIComponent(memo)
  );
};

exports.recharge = async (data = {}) => {
  data.amount = parseAmount(data.amount);
  data.memo = data.memo || `飞帖充值（${config.settings['site.name']}）`;
  const {
    userId,
    currency,
    amount,
    memo
  } = data;
  assert(userId, Errors.ERR_IS_REQUIRED('userId'));
  assert(currency, Errors.ERR_IS_REQUIRED('currency'));
  assert(amount, Errors.ERR_IS_REQUIRED('amount'));
  const mixinClientId = await Wallet.getMixinClientIdByUserId(userId);
  assertFault(mixinClientId, Errors.ERR_WALLET_STATUS);
  const user = await User.get(userId, {
    withProfile: true
  });
  const receipt = await Receipt.create({
    fromAddress: user.address,
    toAddress: user.address,
    type: 'RECHARGE',
    currency: currency,
    amount: amount,
    status: 'INITIALIZED',
    provider: 'MIXIN',
    memo,
    toProviderUserId: mixinClientId
  });
  assertFault(receipt, Errors.ERR_RECEIPT_FAIL_TO_INIT);
  const paymentUrl = getMixinPaymentUrl({
    toMixinClientId: mixinClientId,
    asset: currencyMapAsset[receipt.currency],
    amount: parseAmount(amount),
    trace: receipt.uuid,
    memo
  });
  return paymentUrl;
};

exports.withdraw = async (data = {}) => {
  data.amount = parseAmount(data.amount);
  data.memo = data.memo || `飞帖提现（${config.settings['site.name']}）`;
  const {
    userId,
    currency,
    amount,
    memo = '飞帖提现'
  } = data;
  assert(amount, Errors.ERR_IS_INVALID('amount'));
  const wallet = await Wallet.getRawByUserId(userId);
  Log.create(userId, `钱包版本 ${wallet.version}`);
  assert(wallet, Errors.ERR_NOT_FOUND('user wallet'));
  assertFault(wallet.mixinClientId, Errors.ERR_WALLET_STATUS);
  const asset = await getAsset({
    currency,
    clientId: wallet.mixinClientId,
    sessionId: wallet.mixinSessionId,
    privateKey: wallet.mixinPrivateKey
  });
  assertFault(asset, Errors.ERR_WALLET_FAIL_TO_ACCESS_MIXIN_WALLET);
  assert(
    !mathjs.larger(amount, asset.balance) ||
    mathjs.equal(amount, asset.balance),
    Errors.ERR_WALLET_NOT_ENOUGH_AMOUNT,
    402
  );
  const user = await User.get(userId, {
    withProfile: true
  });
  const toMixinClientId = user.mixinAccount.user_id;
  assert(toMixinClientId, Errors.ERR_NOT_FOUND('toMixinClientId'));
  const receipt = await Receipt.create({
    fromAddress: user.address,
    toAddress: user.address,
    type: 'WITHDRAW',
    currency: currency,
    amount: amount,
    status: 'INITIALIZED',
    provider: 'MIXIN',
    memo,
    fromProviderUserId: wallet.mixinClientId,
    toProviderUserId: toMixinClientId
  });
  assertFault(receipt, Errors.ERR_WALLET_FAIL_TO_CREATE_WITHDRAW_RECEIPT);
  const tfRaw = await transfer({
    currency,
    toMixinClientId,
    amount,
    memo,
    mixinPin: wallet.mixinPin,
    mixinAesKey: wallet.mixinAesKey,
    mixinClientId: wallet.mixinClientId,
    mixinSessionId: wallet.mixinSessionId,
    mixinPrivateKey: wallet.mixinPrivateKey,
    traceId: receipt.uuid
  });
  await updateReceiptByUuid(receipt.uuid, {
    status: tfRaw ? 'SUCCESS' : 'FAILED',
    raw: tfRaw || null,
    snapshotId: tfRaw.snapshot_id,
    uuid: tfRaw.trace_id,
    viewToken: tfRaw.viewToken
  });
  return true;
};

const transfer = async (data = {}) => {
  data.amount = parseAmount(data.amount);
  data = attempt(data, {
    currency: Joi.string()
      .trim()
      .required(),
    toMixinClientId: Joi.string()
      .trim()
      .required(),
    amount: Joi.string()
      .trim()
      .required(),
    memo: Joi.string()
      .trim()
      .required(),
    mixinPin: Joi.string()
      .trim()
      .required(),
    mixinAesKey: Joi.string()
      .trim()
      .required(),
    mixinClientId: Joi.string()
      .trim()
      .required(),
    mixinSessionId: Joi.string()
      .trim()
      .required(),
    mixinPrivateKey: Joi.string()
      .trim()
      .required(),
    traceId: Joi.string()
      .trim()
      .required()
  });
  const {
    currency,
    toMixinClientId,
    amount,
    memo,
    mixinPin,
    mixinAesKey,
    mixinClientId,
    mixinSessionId,
    mixinPrivateKey,
    traceId
  } = data;
  const result = await mixin.account.transfer(
    currencyMapAsset[currency],
    toMixinClientId,
    amount,
    memo, {
      pin: mixinPin,
      aesKey: mixinAesKey,
      client_id: mixinClientId,
      session_id: mixinSessionId,
      privateKey: mixinPrivateKey
    },
    traceId
  );
  assertFault(
    result && result.data,
    `Errors.ERR_WALLET_FAIL_TO_ACCESS_MIXIN_WALLET: ${JSON.stringify(
      result.error
    )}`
  );
  result.data.viewToken = getViewToken(result.data.snapshot_id);
  return result.data;
};

const getBalanceByUserId = async (userId, currency) => {
  assert(userId, Errors.ERR_IS_REQUIRED('userId'));
  const wallet = await Wallet.getRawByUserId(userId);
  const resp = await getAsset({
    currency,
    clientId: wallet.mixinClientId,
    sessionId: wallet.mixinSessionId,
    privateKey: wallet.mixinPrivateKey
  });
  return Number(resp.balance);
};

const getAsset = async (data = {}) => {
  const {
    currency,
    clientId,
    sessionId,
    privateKey
  } = data;
  assert(currency, Errors.ERR_IS_REQUIRED('currency'));
  assert(clientId, Errors.ERR_IS_REQUIRED('clientId'));
  assert(sessionId, Errors.ERR_IS_REQUIRED('sessionId'));
  assert(privateKey, Errors.ERR_IS_REQUIRED('privateKey'));
  let raw = await mixin.account.readAssets(currencyMapAsset[currency], {
    client_id: clientId,
    session_id: sessionId,
    privateKey
  });
  assertFault(raw && raw.data, Errors.ERR_WALLET_FAIL_TO_ACCESS_MIXIN_WALLET);
  return {
    symbol: raw.data.symbol,
    name: raw.data.name,
    icon_url: raw.data.icon_url,
    balance: raw.data.balance,
    account_name: raw.data.account_name,
    account_tag: raw.data.account_tag,
    price_btc: raw.data.price_btc,
    price_usd: raw.data.price_usd,
    change_btc: raw.data.change_btc,
    change_usd: raw.data.change_usd,
    confirmations: raw.data.confirmations
  };
};

const getBalanceMap = async userId => {
  const tasks = Object.keys(currencyMapAsset).map(async currency => {
    const balance = await getBalanceByUserId(userId, currency);
    return {
      currency,
      balance
    };
  });
  const derivedBalances = await Promise.all(tasks);
  const balanceMap = {};
  for (const derivedBalance of derivedBalances) {
    balanceMap[derivedBalance.currency] = derivedBalance.balance;
  }
  return balanceMap;
};

const clearCachedBalance = async userId => {
  await Cache.pSet(balanceCacheKey, userId, null);
};

const refreshCachedBalance = async userId => {
  const balanceMap = await getBalanceMap(userId);
  await Cache.pSet(balanceCacheKey, userId, balanceMap);
  return balanceMap;
};

exports.getBalanceMap = async userId => {
  const cachedBalance = await Cache.pGet(balanceCacheKey, userId);
  if (cachedBalance) {
    return cachedBalance;
  }
  const balanceMap = await refreshCachedBalance(userId);
  return balanceMap;
};

const updateReceiptByUuid = async (uuid, data) => {
  assert(data && Object.keys(data).length, Errors.ERR_IS_INVALID('data'));
  assert(data.raw || data.toRaw, Errors.ERR_IS_INVALID('data raw'));
  if (data.raw) {
    data.raw = JSON.stringify(data.raw);
  }
  if (data.toRaw) {
    data.toRaw = JSON.stringify(data.toRaw);
  }
  assert(uuid, Errors.ERR_IS_REQUIRED('uuid'));
  const receipt = await Receipt.getByUuid(uuid);
  if (receipt.status === 'SUCCESS') {
    return null;
  }
  if (receipt.viewToken) {
    delete data.viewToken;
  }
  const lockKey = `${config.serviceKey}_UPDATE_RECEIPT_${uuid}`;
  const locked = await Cache.pTryLock(lockKey, 10); // 10s
  if (locked) {
    return null;
  }
  await Receipt.updateByUuid(uuid, data);
  Cache.pUnLock(lockKey);
  const updatedReceipt = await Receipt.getByUuid(uuid);
  Log.createAnonymity('更新收据', updatedReceipt.id);
  const user = await User.getByAddress(updatedReceipt.fromAddress);
  if (updatedReceipt.type === 'RECHARGE') {
    socketIo.sendToUser(user.id, 'recharge', {
      receipt: updatedReceipt
    });
  }
  await clearCachedBalance(user.id);
  refreshCachedBalance(user.id);
  return updatedReceipt;
};

const tryCreateRewardReceipt = async (uuid, data) => {
  const existedReceipt = await Receipt.getByUuid(uuid);
  if (existedReceipt) {
    return null;
  }
  const {
    toSnapshotId,
    fromProviderUserId,
    toProviderUserId,
    viewToken,
    status
  } = data;
  const snapshot = JSON.parse(data.toRaw);
  const userId = await Wallet.getUserIdByMixinClientId(toProviderUserId);
  const user = await User.get(userId);
  const lockKey = `${config.serviceKey}_CREATE_RECEIPT`;
  const locked = await Cache.pTryLock(lockKey, 10); // 10s
  if (locked) {
    return null;
  }
  const receipt = await Receipt.create({
    uuid,
    toAddress: user.address,
    type: 'REWARD',
    currency: snapshot.asset.symbol,
    amount: snapshot.amount,
    status,
    provider: 'MIXIN',
    toSnapshotId,
    toRaw: data.toRaw,
    memo: snapshot.data,
    toProviderUserId,
    fromProviderUserId,
    objectType: 'FILE',
    viewToken
  });
  Cache.pUnLock(lockKey);
  Log.createAnonymity(
    '收到打赏',
    `${fromProviderUserId} -> ${toProviderUserId}`
  );
  Log.createAnonymity('创建收据', receipt.id);
  await clearCachedBalance(user.id);
  refreshCachedBalance(user.id);
  return receipt;
};

const saveSnapshots = async snapshots => {
  const tasks = [];
  for (const snapshot of snapshots) {
    tasks.push(saveSnapshot(snapshot));
  }
  const updatedReceipts = await Promise.all(tasks);
  return updatedReceipts;
};

const saveSnapshot = async snapshot => {
  let retReceipt = null;
  if (
    snapshot &&
    snapshot.type === 'snapshot' &&
    snapshot.source === 'TRANSFER_INITIALIZED'
  ) {
    const receipt = {
      status: 'SUCCESS'
    };
    const amount = Number(snapshot.amount);
    if (amount > 0) {
      // receive
      receipt.toRaw = JSON.stringify(snapshot);
      receipt.toSnapshotId = snapshot.snapshot_id;
      receipt.fromProviderUserId = snapshot.opponent_id;
      receipt.toProviderUserId = snapshot.user_id;
    } else if (amount < 0) {
      // pay
      receipt.raw = JSON.stringify(snapshot);
      receipt.snapshotId = snapshot.snapshot_id;
      receipt.fromProviderUserId = snapshot.user_id;
      receipt.toProviderUserId = snapshot.opponent_id;
    }

    receipt.viewToken = getViewToken(snapshot.snapshot_id);

    try {
      if (amount > 0) {
        // receive reward
        retReceipt = await tryCreateRewardReceipt(snapshot.trace_id, receipt);
      } else if (amount < 0) {
        // withdraw
        retReceipt = await updateReceiptByUuid(snapshot.trace_id, receipt);
      }
    } catch (e) {
      log(e);
    }
  }
  return retReceipt;
};

exports.syncMixinSnapshots = () => {
  const syncKey = `${config.serviceKey}_SYNC_MIXIN_SNAPSHOTS`;
  const lockKey = `${syncKey}_LOCK`;
  return new Promise(resolve => {
    (async () => {
      const isLock = await Cache.pTryLock(lockKey, 5); // 15s
      if (isLock) {
        resolve();
        return;
      }
      const timerId = setTimeout(() => {
        try {
          Cache.pUnLock(lockKey);
        } catch (err) {}
        resolve();
        stop = true;
      }, 10 * 1000);
      let stop = false;
      try {
        let session = {};
        const sessionString = await Cache.pGet(syncKey, 'session');
        const currencies = Object.keys(currencyMapAsset);
        if (sessionString) {
          session = JSON.parse(sessionString);
        } else {
          session = {};
          const current = new Date();
          for (const currency of currencies) {
            session[currency] = {
              offset: current.toISOString()
            };
          }
          await Cache.pSet(syncKey, 'session', JSON.stringify(session));
        }
        const snapshots = [];
        const tasks = currencies.map(async currency => {
          try {
            const result = await mixin.readSnapshots(
              rfc3339nano.adjustRfc3339ByNano(session[currency].offset, 1),
              currencyMapAsset[currency],
              '100',
              'ASC'
            );
            const {
              data
            } = result;
            for (const i in data) {
              session[currency].offset = data[i].created_at;
              if (data[i].user_id) {
                snapshots.push(data[i]);
              }
            }
          } catch (err) {
            log(err);
          }
        });
        await Promise.all(tasks);
        await saveSnapshots(snapshots);
        await Cache.pSet(syncKey, 'session', JSON.stringify(session));
      } catch (err) {
        log(err);
      }
      clearTimeout(timerId);
      if (stop) {
        return;
      }
      try {
        Cache.pUnLock(lockKey);
      } catch (err) {
        log(err);
      }
      resolve();
    })();
  });
};

const syncReceiptLog = message => {
  log(`【同步初始化收据队列】 ${message}`);
};

const syncInitializedReceipt = async receipt => {
  try {
    const date = new Date(receipt.createdAt);
    const diffTime = 1 * 1000;
    date.setTime(date.getTime() - diffTime);
    const offset = date.toISOString();
    const {
      data
    } = await mixin.readSnapshots(
      offset,
      currencyMapAsset[receipt.currency],
      '100',
      'ASC'
    );
    const snapshots = [];
    for (const i in data) {
      if (data[i].user_id) {
        snapshots.push(data[i]);
      }
    }
    const updatedReceipts = await saveSnapshots(snapshots);
    const thisReceipt = await Receipt.getByUuid(receipt.uuid);
    if (thisReceipt.status === 'INITIALIZED') {
      const now = new Date();
      const minutes = 10;
      if (now - date.getTime() > minutes * 60 * 1000) {
        await Receipt.updateByUuid(receipt.uuid, {
          status: 'TIMEOUT'
        });
        const timeoutReceipt = await Receipt.getByUuid(receipt.uuid);
        Log.createAnonymity(
          '这条收据过期了，状态已设置为 TIMEOUT',
          timeoutReceipt.id
        );
      } else {
        syncReceiptLog(`${thisReceipt.id} 处于 ${minutes} 分钟等待期`);
      }
    }
    for (const updatedReceipt of updatedReceipts) {
      if (updatedReceipt && updatedReceipt.status === 'SUCCESS') {
        Log.createAnonymity(
          '同步初始化收据',
          `INITIALIZED -> SUCCESS ${updatedReceipt.id}`
        );
      }
    }
  } catch (err) {
    syncReceiptLog(`失败了`);
    log(err);
  }
};

exports.syncInitializedReceipts = async () => {
  return new Promise(resolve => {
    (async () => {
      const timerId = setTimeout(() => {
        syncReceiptLog('超时，不再等待，准备开始下一次');
        resolve();
        stop = true;
      }, 20 * 1000);
      let stop = false;
      try {
        let receipts = await Receipt.list({
          where: {
            status: 'INITIALIZED'
          }
        });
        if (receipts.length === 0) {
          syncReceiptLog('没有初始化的收据');
          return;
        }
        syncReceiptLog(`初始化收据的总数：${receipts.length}`);
        const limit = 5;
        while (receipts.length > 0) {
          let tasks = [];
          if (receipts.length <= limit) {
            tasks = receipts.map(syncInitializedReceipt);
            receipts = [];
          } else {
            tasks = receipts.slice(0, limit).map(syncInitializedReceipt);
            receipts = receipts.slice(limit);
          }
          syncReceiptLog(`当前请求收据数量：${tasks.length}`);
          syncReceiptLog(`本次剩余收据数量：${receipts.length}`);
          await Promise.all(tasks);
        }
      } catch (err) {
        syncReceiptLog('失败，准备开始下一次');
        syncReceiptLog(err);
      }
      clearTimeout(timerId);
      if (stop) {
        return;
      }
      resolve();
    })();
  });
};

exports.getReceiptsByUserAddress = async (userAddress, options = {}) => {
  assert(userAddress, Errors.ERR_IS_REQUIRED('userAddress'));
  const {
    offset = 0, limit, status
  } = options;
  const receipts = await Receipt.list({
    where: {
      [Op.or]: [{
          fromAddress: userAddress
        },
        {
          toAddress: userAddress
        }
      ],
      status
    },
    offset,
    limit,
    order: [
      ['updatedAt', 'DESC']
    ]
  });
  return receipts;
};

const getReceiptsByFileRId = async (fileRId, options = {}) => {
  assert(fileRId, Errors.ERR_IS_REQUIRED('fileRId'));
  const {
    offset = 0, limit
  } = options;
  const receipts = await Receipt.list({
    where: {
      objectRId: fileRId,
      status: 'SUCCESS'
    },
    offset,
    limit
  });
  return receipts;
};
exports.getReceiptsByFileRId = getReceiptsByFileRId;