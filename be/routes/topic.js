const router = require('koa-router')();
const {
  create,
} = require('../controllers/topic');
const {
  ensureAuthorization
} = require('../models/api');

router.post('/', ensureAuthorization(), create);

module.exports = router;