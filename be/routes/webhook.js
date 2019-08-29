const router = require('koa-router')();
const {
  mediumCallback,
} = require('../controllers/webhook');

router.post('/medium', mediumCallback);

module.exports = router;