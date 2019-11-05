const router = require('koa-router')();
const {
  oauthLogin,
  oauthCallback,
  oauthBind,
} = require('../controllers/apiAuth');

const {
  ensureAuthorization
} = require('../models/api');

router.get('/:provider/login', oauthLogin);
router.get('/:provider/callback', ensureAuthorization({
  strict: false
}), oauthCallback);
router.get('/:provider/bind', oauthBind);

module.exports = router;