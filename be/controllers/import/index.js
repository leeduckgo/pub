const {
  assert,
  throws,
  Errors,
} = require('../../models/validator')
const {
  createFile
} = require('../apiFile')

const fetchPressOnePost = require('./prs')
const fetchWechatPost = require('./wechat')

const pressOneLinkRegexp = /^https:\/\/press\.one\/files\/([a-f0-9]+)$/
const wechatLinkRegexp = /^https:\/\/mp\.weixin\.qq\.com\/s.*$/

/** 从 press.one 和微信导入文章到草稿 */
exports.postImport = async ctx => {
  const url = ctx.query.url
  assert(url, Errors.ERR_IS_INVALID('url'));
  let data

  try {
    if (pressOneLinkRegexp.test(url)) {
      const match = url.match(pressOneLinkRegexp)
      const id = match[1]
      data = await fetchPressOnePost(id)
    } else if (wechatLinkRegexp.test(url)) {
      data = await fetchWechatPost(url)
    } else {
      throws(Errors.ERR_IS_INVALID('url'))
    }
  } catch (e) {
    ctx.er(e)
    return
  }

  const {
    user
  } = ctx.verification;

  const file = await createFile(user, data, {
    isDraft: true,
  });

  ctx.body = file;
}