const Finance = require('../models/finance');
const Wallet = require('../models/wallet');
const Log = require('../models/log')
const {
  assert,
  Errors
} = require('../models/validator');
const {
  pTryLock,
  pUnLock
} = require('../models/cache');

const assertTooManyRequests = async (lockKey) => {
  const locked = await pTryLock(lockKey, 10);
  assert(!locked, 'too many request', 429);
};

exports.getBalance = async ctx => {
  const {
    user
  } = ctx.verification;
  const balanceMap = await Finance.getBalanceMap(user.id);
  ctx.ok(balanceMap);
}

exports.recharge = async ctx => {
  const data = ctx.request.body.payload;
  assert(data, Errors.ERR_IS_REQUIRED('payload'));
  const {
    user
  } = ctx.verification;
  const key = `RECHARGE_${user.id}`;
  try {
    await assertTooManyRequests(key);
    const paymentUrl = await Finance.recharge({
      userId: user.id,
      currency: data.currency,
      amount: data.amount,
      memo: data.memo
    });
    Log.create(user.id, `打算充值 ${data.amount} ${data.currency} ${data.memo || ''}`);
    Log.create(user.id, '获得充值二维码 url');
    ctx.ok({
      paymentUrl
    });
  } catch (err) {
    ctx.er(err);
  } finally {
    pUnLock(key);
  }
};

exports.withdraw = async ctx => {
  const data = ctx.request.body.payload;
  assert(data, Errors.ERR_IS_REQUIRED('payload'));
  const {
    user
  } = ctx.verification;
  const key = `WITHDRAW_${user.id}`;
  try {
    await assertTooManyRequests(key);
    Log.create(user.id, `开始提现 ${data.amount} ${data.currency} ${data.memo || ''}`);
    await Finance.withdraw({
      userId: user.id,
      currency: data.currency,
      amount: data.amount,
      memo: data.memo,
    });
    Log.create(user.id, `完成提现 ${data.amount} ${data.currency} ${data.memo || ''}`);
    ctx.ok({
      success: true
    });
  } catch (err) {
    ctx.er(err);
  } finally {
    pUnLock(key);
  }
};

exports.getReceipts = async ctx => {
  const {
    user
  } = ctx.verification;
  const {
    offset = 0, limit
  } = ctx.query;
  const receipts = await Finance.getReceiptsByUserAddress(user.address, {
    offset,
    limit: Math.min(~~limit || 10, 100),
    status: 'SUCCESS'
  });
  ctx.body = receipts;
}

exports.updateCustomPin = async ctx => {
  const {
    user
  } = ctx.verification;
  const data = ctx.request.body.payload;
  assert(data, Errors.ERR_IS_REQUIRED('payload'));
  const {
    pinCode,
    oldPinCode
  } = data;
  await Wallet.updateCustomPin(user.id, pinCode, {
    oldPinCode
  });
  Log.create(user.id, '更新 pin 成功');
  ctx.ok({
    success: true
  });
}

exports.isCustomPinExist = async ctx => {
  const {
    user
  } = ctx.verification;
  const customPin = await Wallet.getCustomPinByUserId(user.id);
  ctx.ok(!!customPin);
}

exports.validatePin = async ctx => {
  const {
    user
  } = ctx.verification;
  const data = ctx.request.body.payload;
  assert(data, Errors.ERR_IS_REQUIRED('payload'));
  const {
    pinCode
  } = data;
  const isValid = await Wallet.validatePin(user.id, pinCode);
  Log.create(user.id, `验证 pin ${isValid ? '成功' : '失败'}`);
  ctx.ok(isValid);
}