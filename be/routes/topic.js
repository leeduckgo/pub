const router = require('koa-router')();
const {
  create,
} = require('../controllers/apiTopic');
const {
  ensureAuthorization
} = require('../models/api');

router.post('/', ensureAuthorization(), create);

module.exports = router;