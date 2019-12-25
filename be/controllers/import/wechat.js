const crypto = require('crypto')
const {
  JSDOM
} = require('jsdom');
const request = require('request-promise');
const TurndownService = require('turndown')
// const { Config, QingStor } = require('qingstor-sdk');
const {
  Config,
  QingStor
} = require('qingstor-sdk/dist/node/qingstor-sdk.js');
const {
  throws,
  Errors,
} = require('../../models/validator')
const config = require('../../config');

const qingConfig = new Config(config.qingCloud.accessKeyId, config.qingCloud.secretAccessKey);
const bucket = new QingStor(qingConfig).Bucket(config.qingCloud.bucketName, config.qingCloud.zone);

const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
})

turndownService.addRule('trim strong', {
  filter: ['strong', 'b'],

  replacement: (content, node, options) => {
    if (!content.trim()) return ''
    return options.strongDelimiter + content.trim() + options.strongDelimiter
  },
})

turndownService.addRule('img', {
  filter: 'img',

  replacement: (content, node) => {
    // 微信图片懒加载 src 为 data-src
    const src = node.getAttribute('src') || node.getAttribute('data-src') || ''
    return src ? `![](${src})` : ''
  },
})

const fetchWechatPost = async url => {
  let html
  try {
    html = await request({
      timeout: 10000,
      url,
    })
  } catch (e) {
    throws(Errors.ERR_IS_INVALID('url'))
  }

  const dom = new JSDOM(html)
  const titleElement = dom.window.document.querySelector('#activity-name')
  const contentElement = dom.window.document.querySelector('#js_content')

  if (!titleElement || !contentElement) {
    throws(Errors.ERR_IS_INVALID('url'))
  }

  const title = (titleElement.textContent || '标题').trim()

  let markdown = turndownService.turndown(contentElement)
    .split('\n')
    .map(v => v.trim()) // trim trailing space
    .join('\n')
    .replace(/\n{3,}/g, '\n\n') // 删除连续空行
    .replace(/\*{4}/g, '** **') // 防止两个粗体连起来

  const allImagesMatch = markdown.match(/!\[\]\((.+?)\)/g)

  if (allImagesMatch) {
    const promiseArr = Array.from(allImagesMatch)
      .map((v) => v.substring(4, v.length - 1))
      .filter((v, i, a) => a.indexOf(v) === i)
      .map(async imageUrl => {
        const imageResponse = await request({
          encoding: null,
          timeout: 10000,
          url: imageUrl,
          resolveWithFullResponse: true,
        })

        const imageBuffer = imageResponse.body
        const mimetype = imageResponse.headers['content-type'] || undefined

        const sha1 = crypto.createHash('sha1')
        sha1.update(imageBuffer)
        const imageHash = sha1.digest('hex')

        const response = await bucket.putObject(imageHash, {
          'Content-Type': mimetype,
          'body': imageBuffer,
        })

        if (response.status >= 300) {
          throw new Error('upload wechat post image put object failed')
        }

        const newImageUrl = `https://${config.qingCloudZone}.qingstor.com/${config.qingCloudBucketName}/${imageHash}`
        markdown = markdown.replace(
          new RegExp(imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          newImageUrl,
        )
      })

    await Promise.all(promiseArr)
  }

  return {
    title,
    content: markdown,
    mimeType: 'text/markdown',
  }
}

module.exports = fetchWechatPost;