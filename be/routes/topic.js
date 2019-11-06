const router = require('koa-router')();
const {
  create,
  allow,
  deny,
  getAllowPermissionList,
  getDenyPermissionList,
  updatescript,
} = require('../controllers/topic');
const {
  ensureAuthorization,
  ensureTopicOnwer,
} = require('../models/api');

router.post('/', ensureAuthorization(), create);
router.get('/allow', ensureAuthorization(), ensureTopicOnwer(), getAllowPermissionList);
router.get('/deny', ensureAuthorization(), ensureTopicOnwer(), getDenyPermissionList);
router.post('/allow/:userid', ensureAuthorization(), ensureTopicOnwer(), allow);
router.post('/deny/:userid', ensureAuthorization(), ensureTopicOnwer(), deny);
router.get('/updatescript', ensureAuthorization(), ensureTopicOnwer(), updatescript);

module.exports = router;
