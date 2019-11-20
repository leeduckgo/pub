const mathjs = require('mathjs');
const uuidV1 = require('uuid/v1');
const Mixin = require('mixin-node');
const rfc3339nano = require('rfc3339nano');
const fs = require('fs');
const config = require('../config');
const User = require('./user');
const Wallet = require('./wallet');
const socketIo = require('./socketIo');
const Cache = require('./cache');

const Receipt = require('./sequelize/receipt');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const {
  Joi,
  assert,
  attempt,
  Errors,
  assertFault
} = require('./validator');

const parseAmount = (amount) => {
  return /^-?\d+(\.\d+)?$/.test(amount = String(amount)) &&
    mathjs.larger('1000000000000000000000000000000', amount) // max length = 30 // + 1 for checking
    &&
    mathjs.larger(amount, 0) && amount;
};

const currencyMapAsset = {
  CNB: '965e5c6e-434c-3fa9-b780-c50f43cd955c',
  BTC: 'c6d0c728-2624-429b-8e0d-d9d19b6592fa',
  ETH: '43d61dcd-e413-450d-80b8-101d5e903357',
  EOS: '6cfe566e-4aad-470b-8c9a-2fd35b49c68d',
  BOX: 'f5ef6b5d-cc5a-3d90-b2c0-a2fd386e7a3c',
  PRS: '3edb734c-6d6f-32ff-ab03-4eb43640c758',
  XIN: 'c94ac88f-4671-3976-b60a-09064f1811e8'
};

const transferTypes = new Set([
  'REWARD',
  'WITHDRAW',
  'RECHARGE'
]);

const transferObjectTypes = new Set(['FILE']);

const mixin = new Mixin({
  client_id: config.mixin.clientId,
  aeskey: config.mixin.aesKey,
  pin: config.mixin.pinCode,
  session_id: config.mixin.sessionId,
  privatekey: config.mixin.privateKeyFilePath
});

const create = async receipt => {
  receipt = attempt(receipt, {
    uuid: Joi.string().trim().optional(),
    fromAddress: Joi.string().trim().optional(),
    toAddress: Joi.string().trim().optional(),
    type: Joi.string().trim().required(),
    currency: Joi.string().trim().required(),
    amount: Joi.number().required(),
    status: Joi.string().trim().required(),
    provider: Joi.string().trim().required(),
    toSnapshotId: Joi.string().trim().optional(),
    toRaw: Joi.string().trim().optional(),
    memo: Joi.string().trim().optional(),
    toProviderUserId: Joi.string().trim().optional(),
    fromProviderUserId: Joi.string().trim().optional(),
    objectType: Joi.string().trim().optional(),
    objectRId: Joi.string().trim().optional(),
    viewToken: Joi.string().trim().optional()
  });
  receipt.amount = parseAmount(receipt.amount);
  assert((receipt.amount), Errors.ERR_IS_INVALID('amount'));
  assert(transferTypes.has(receipt.type), Errors.ERR_IS_INVALID('type'));
  assert(!receipt.objectType || transferObjectTypes.has(receipt.objectType), Errors.ERR_IS_INVALID('objectType'));
  assert(currencyMapAsset[receipt.currency], Errors.ERR_IS_INVALID('currency'));

  receipt.uuid = receipt.uuid || uuidV1();
  receipt.objectType = receipt.objectType || '';

  const newReceipt = await Receipt.create(receipt);
  return newReceipt.toJSON();
};

const getViewToken = (snapshotId) => {
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
  return ('https://mixin.one/pay' +
    '?recipient=' + encodeURIComponent(toMixinClientId) +
    '&asset=' + encodeURIComponent(asset) +
    '&amount=' + encodeURIComponent(amount) +
    '&trace=' + encodeURIComponent(trace) +
    '&memo=' + encodeURIComponent(memo));
};

exports.recharge = async (data = {}) => {
  data.amount = parseAmount(data.amount);
  data.memo = data.memo || '飞帖充值';
  const {
    userId,
    currency,
    amount,
    memo
  } = data;
  assert(userId, Errors.ERR_IS_REQUIRED('userId'));
  assert(currency, Errors.ERR_IS_REQUIRED('currency'));
  assert(amount, Errors.ERR_IS_REQUIRED('amount'));
  const wallet = await Wallet.getByUserId(userId);
  assert(wallet, Errors.ERR_NOT_FOUND('user wallet'));
  assertFault(wallet.mixinClientId, Errors.ERR_WALLET_STATUS);
  const user = await User.get(userId, {
    withProfile: true
  });
  const receipt = await create({
    fromAddress: user.address,
    toAddress: user.address,
    type: 'RECHARGE',
    currency: currency,
    amount: amount,
    status: 'INITIALIZED',
    provider: 'MIXIN',
    memo,
    toProviderUserId: wallet.mixinClientId
  }, undefined);
  assertFault(receipt, Errors.ERR_RECEIPT_FAIL_TO_INIT);
  const paymentUrl = getMixinPaymentUrl({
    toMixinClientId: wallet.mixinClientId,
    asset: currencyMapAsset[receipt.currency],
    amount: parseAmount(amount),
    trace: receipt.uuid,
    memo
  });
  return paymentUrl;
};

exports.withdraw = async (data = {}) => {
  data.amount = parseAmount(data.amount);
  data.memo = data.memo || '飞帖提现';
  const {
    userId,
    currency,
    amount,
    memo = '飞帖提现'
  } = data;
  assert(amount, Errors.ERR_IS_INVALID('amount'));
  const wallet = await Wallet.getByUserId(userId);
  assert(wallet, Errors.ERR_NOT_FOUND('user wallet'));
  assertFault(wallet.mixinClientId, Errors.ERR_WALLET_STATUS);
  // @todo: 检查最大交易限额
  const asset = await getAsset({
    currency,
    clientId: wallet.mixinClientId,
    sessionId: wallet.mixinSessionId,
    privateKey: wallet.mixinPrivateKey,
  });
  assertFault(asset, Errors.ERR_WALLET_FAIL_TO_ACCESS_MIXIN_WALLET);
  console.log(` ------------- amount ---------------`, amount);
  console.log(` ------------- asset.balance ---------------`, asset.balance);
  assert(
    !mathjs.larger(amount, asset.balance) || mathjs.equal(amount, asset.balance),
    Errors.ERR_WALLET_NOT_ENOUGH_AMOUNT,
    402
  );
  const user = await User.get(userId, {
    withProfile: true
  });
  const toMixinClientId = user.mixinAccount.user_id;
  assert(toMixinClientId, Errors.ERR_NOT_FOUND('toMixinClientId'));
  const receipt = await create({
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
    traceId: receipt.uuid,
  });
  await updateReceiptByUuid(receipt.uuid, {
    status: tfRaw ? 'SUCCESS' : 'FAILED',
    raw: tfRaw || null,
    snapshotId: tfRaw.snapshot_id,
    uuid: tfRaw.trace_id,
    viewToken: tfRaw.viewToken
  });
  const latestAsset = await getAsset({
    currency,
    clientId: wallet.mixinClientId,
    sessionId: wallet.mixinSessionId,
    privateKey: wallet.mixinPrivateKey,
  });
  assertFault(latestAsset, Errors.ERR_WALLET_FETCH_BALANCE);
  return true;
}

const transfer = async (data = {}) => {
  data.amount = parseAmount(data.amount);
  data = attempt(data, {
    currency: Joi.string().trim().required(),
    toMixinClientId: Joi.string().trim().required(),
    amount: Joi.string().trim().required(),
    memo: Joi.string().trim().required(),
    mixinPin: Joi.string().trim().required(),
    mixinAesKey: Joi.string().trim().required(),
    mixinClientId: Joi.string().trim().required(),
    mixinSessionId: Joi.string().trim().required(),
    mixinPrivateKey: Joi.string().trim().required(),
    traceId: Joi.string().trim().required(),
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
    currencyMapAsset[currency], toMixinClientId, amount, memo, {
      pin: mixinPin,
      aesKey: mixinAesKey,
      client_id: mixinClientId,
      session_id: mixinSessionId,
      privateKey: mixinPrivateKey
    },
    traceId
  );
  assertFault(result && result.data, `Errors.ERR_WALLET_FAIL_TO_ACCESS_MIXIN_WALLET: ${JSON.stringify(result.error)}`);
  result.data.viewToken = getViewToken(result.data.snapshot_id);
  return result.data;
};

const getBalanceByUserId = async (userId, currency) => {
  assert(userId, Errors.ERR_IS_REQUIRED('userId'));
  const wallet = await Wallet.getByUserId(userId);
  const resp = await getAsset({
    currency,
    clientId: wallet.mixinClientId,
    sessionId: wallet.mixinSessionId,
    privateKey: wallet.mixinPrivateKey,
  });
  return Number(resp.balance);
}

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
  })
  const derivedBalances = await Promise.all(tasks);
  const balanceMap = {};
  for (const derivedBalance of derivedBalances) {
    balanceMap[derivedBalance.currency] = derivedBalance.balance;
  }
  return balanceMap;
}
exports.getBalanceMap = getBalanceMap;

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
  const prevReceiptDB = await Receipt.findOne({
    where: {
      uuid
    }
  });
  if (prevReceiptDB.toJSON().viewToken) {
    delete data.viewToken;
  }
  console.log(` ------------- receipt data ---------------`, data);
  await Receipt.update(data, {
    where: {
      uuid
    }
  });
  const afterReceiptDB = await Receipt.findOne({
    where: {
      uuid
    }
  });
  const receipt = afterReceiptDB.toJSON();
  console.log(` ------------- receipt ---------------`, receipt);
  if (receipt.type === 'RECHARGE') {
    const user = await User.getByAddress(receipt.toAddress);
    socketIo.sendToUser(user.id, 'recharge', {
      receipt
    });
  }
};

const tryCreateRewardReceipt = async (uuid, data) => {
  console.log(` ------------- tryCreateRewardReceipt ---------------`);
  console.log(` ------------- data ---------------`, data);
  console.log(` ------------- uuid ---------------`, uuid);
  const receipt = await Receipt.findOne({
    where: {
      uuid
    }
  });
  if (receipt) {
    console.log(` ------------- receipt 已经存在 ---------------`);
    return;
  }
  const {
    toSnapshotId,
    fromProviderUserId,
    toProviderUserId,
    viewToken,
    status
  } = data;
  const snapshot = JSON.parse(data.toRaw);
  const wallet = await Wallet.getByMixinClientId(toProviderUserId);
  const user = await User.get(wallet.userId);
  await create({
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
}

const saveSnapshots = async (snapshots, options) => {
  const tasks = [];
  for (const snapshot of snapshots) {
    tasks.push(saveSnapshot(snapshot, options));
  }
  await Promise.all(tasks);
};

const saveSnapshot = async (snapshot, options) => {
  if (snapshot &&
    snapshot.type === 'snapshot' &&
    snapshot.source === 'TRANSFER_INITIALIZED') {
    const receipt = {
      status: 'SUCCESS'
    };
    const amount = Number(snapshot.amount);
    if (amount > 0) { // receive
      receipt.toRaw = JSON.stringify(snapshot);
      receipt.toSnapshotId = snapshot.snapshot_id;
      receipt.fromProviderUserId = snapshot.opponent_id;
      receipt.toProviderUserId = snapshot.user_id;
    } else if (amount < 0) { // pay
      receipt.raw = JSON.stringify(snapshot);
      receipt.snapshotId = snapshot.snapshot_id;
      receipt.fromProviderUserId = snapshot.user_id;
      receipt.toProviderUserId = snapshot.opponent_id;
    } else {
      return snapshot;
    }

    receipt.viewToken = getViewToken(snapshot.snapshot_id);

    try {
      await tryCreateRewardReceipt(snapshot.trace_id, receipt);
    } catch (e) {
      console.log(e);
    }
  }
  return snapshot;
};

exports.syncMixinSnapshots = () => {
  const syncKey = `${config.serviceName}_SYNC_MIXIN_SNAPSHOTS`;
  return new Promise((resolve) => {
    (async () => {
      const isLock = await Cache.pTryLock(syncKey, 15) // 15s
      if (isLock) {
        console.log(` ------------- 锁住了，请返回 ---------------`);
        resolve();
        return;
      }
      console.log(new Date().toString());
      const timerId = setTimeout(() => {
        try {
          Cache.pUnLock(syncKey);
        } catch (err) {
          console.log(` ------------- pUnLock err ---------------`, err);
        }
        console.log(` ------------- 超时，不再等待，准备开始下一次 ---------------`);
        resolve();
        stop = true;
      }, 10 * 1000)
      let stop = false;
      try {
        let session = {};
        const currencies = Object.keys(currencyMapAsset);
        try {
          session = JSON.parse(fs.readFileSync('session.json', 'utf8'));
        } catch (err) {
          const current = new Date();
          for (const currency of currencies) {
            session[currency] = {
              offset: current.toISOString()
            }
          }
          const json = JSON.stringify(session);
          fs.writeFileSync('session.json', json, 'utf8');
        };
        const snapshots = [];
        const tasks = currencies.map(async currency => {
          try {
            const result = await mixin.readSnapshots(
              rfc3339nano.adjustRfc3339ByNano(session[currency].offset, 1),
              currencyMapAsset[currency],
              '50',
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
            console.log(` ------------- ERROR: 失败，准备开始下一次 ---------------`);
          }
        })
        console.log(` ------ step1: 开始发请求 --------`);
        await Promise.all(tasks);
        console.log(` ------ step2: 请求结束 --------`);
        await saveSnapshots(snapshots);
        console.log(` ------ step3: 更新数据库 --------`);
        const json = JSON.stringify(session);
        fs.writeFileSync('session.json', json, 'utf8');
      } catch (err) {
        console.log(` ------------- ERROR: 失败，准备开始下一次 ---------------`);
      }
      console.log(` ------ step4: 完成，准备开始下一次 --------`);
      clearTimeout(timerId);
      if (stop) {
        return;
      }
      try {
        Cache.pUnLock(syncKey);
      } catch (err) {
        console.log(` ------------- pUnLock err ---------------`, err);
      }
      resolve();
    })();
  });
}

exports.getReceiptsByUserAddress = async (userAddress, options = {}) => {
  assert(userAddress, Errors.ERR_IS_REQUIRED('userAddress'));
  const {
    offset = 0, limit, status
  } = options;
  const receipts = await Receipt.findAll({
    where: {
      [Op.or]: [{
        fromAddress: userAddress
      }, {
        toAddress: userAddress
      }],
      status
    },
    offset,
    limit,
    order: [
      ['updatedAt', 'DESC']
    ]
  });
  return receipts.map(receipt => receipt.toJSON());
}

const getReceiptsByFileRId = async (fileRId, options = {}) => {
  assert(fileRId, Errors.ERR_IS_REQUIRED('fileRId'));
  const {
    offset = 0, limit
  } = options;
  const receipts = await Receipt.findAll({
    where: {
      objectRId: fileRId,
      status: 'SUCCESS'
    },
    offset,
    limit
  });
  return receipts.map(receipt => receipt.toJSON());
}
exports.getReceiptsByFileRId = getReceiptsByFileRId;