const Router = require('koa-router');
const {
  postImport,
} = require('../controllers/import');

const {
  ensureAuthorization,
} = require('../models/api');

const router = new Router();

router.post('/', ensureAuthorization(), postImport);

module.exports = router;
