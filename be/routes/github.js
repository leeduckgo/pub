const router = require('koa-router')();
const {
  callback
} = require('../controllers/github');

router.get('/oauth/callback', callback);

module.exports = router;