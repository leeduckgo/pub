const request = require('request-promise');

const fetchPressOnePost = async id => {
  const file = await request({
    timeout: 10000,
    url: `https://press.one/api/v2/files/${id}`,
    json: true,
  })

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
