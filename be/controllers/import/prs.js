const request = require('request-promise');
const {
  throws,
  Errors,
} = require('../../models/validator')

const fetchPressOnePost = async id => {
  let file
  try {
    file = await request({
      timeout: 10000,
      url: `https://press.one/api/v2/files/${id}`,
      json: true,
    })
  } catch (e) {
    if (e.statusCode === 404) {
      throws(Errors.ERR_IS_INVALID('url'))
    }
    throw e
  }

  const title = file.cache.title
  const cacheUrl = file.cache.cacheUrl

  const fileContent = await request({
    timeout: 10000,
    url: cacheUrl,
  })

  return {
    title,
    content: fileContent,
    mimeType: 'text/markdown',
  };
}

module.exports = fetchPressOnePost;
