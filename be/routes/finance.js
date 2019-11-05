const router = require('koa-router')();
const {
  getBalance,
  recharge,
  withdraw,
  getReceipts,
  updateCustomPin,
  isCustomPinExist,
  validatePin
} = require('../controllers/apiFinance');

const {
  ensureAuthorization
} = require('../models/api');

router.get('/balance', ensureAuthorization(), getBalance);
router.post('/recharge', ensureAuthorization(), recharge);
router.post('/withdraw', ensureAuthorization(), withdraw);
router.get('/receipts', ensureAuthorization(), getReceipts);
router.post('/pin', ensureAuthorization(), updateCustomPin);
router.get('/pin/exist', ensureAuthorization(), isCustomPinExist);
router.post('/pin/validate', ensureAuthorization(), validatePin);

module.exports = router;