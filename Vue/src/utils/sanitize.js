// 渲染前的 HTML 过滤（防存储型 XSS）。
//
// 文章、回复、签名都是 HTML，页面用 v-html 渲染。内容在入库时无法保证安全（也有早已入库的旧内容），
// 所以在"渲染这一刻"用 DOMPurify 做白名单过滤：旧内容、新内容都受保护。
//
// 白名单依据：线上现有 89 篇文章 / 69 条回复实际用到的标签和属性（见 scan 结果），再加上 TinyMCE 常见的少量标签。
// 脚本、iframe、表单、svg、style 标签，所有 on* 事件属性，javascript: 链接 一律去掉。

import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
  'p', 'br', 'span', 'div', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'ins', 'sub', 'sup', 'small', 'mark',
  'code', 'pre', 'kbd', 'samp', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'hr',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption', 'colgroup', 'col', 'a', 'img', 'figure', 'figcaption'
]
const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'width', 'height', 'class', 'style', 'target', 'rel', 'colspan', 'rowspan', 'align', 'valign', 'cellspacing', 'cellpadding', 'border']

// style 属性只保留这些 CSS 属性。没有 position / z-index / background(url) / filter 等，避免覆盖整个页面、外联请求。
const STYLE_PROPS = {
  'color': 1, 'background-color': 1, 'font-size': 1, 'font-family': 1, 'font-weight': 1, 'font-style': 1,
  'text-align': 1, 'text-decoration': 1, 'text-indent': 1, 'line-height': 1, 'letter-spacing': 1, 'white-space': 1, 'word-break': 1,
  'width': 1, 'height': 1, 'max-width': 1, 'max-height': 1, 'min-width': 1, 'min-height': 1,
  'margin': 1, 'margin-top': 1, 'margin-right': 1, 'margin-bottom': 1, 'margin-left': 1,
  'padding': 1, 'padding-top': 1, 'padding-right': 1, 'padding-bottom': 1, 'padding-left': 1,
  'border': 1, 'border-top': 1, 'border-right': 1, 'border-bottom': 1, 'border-left': 1, 'border-collapse': 1, 'border-color': 1,
  'border-style': 1, 'border-width': 1, 'border-radius': 1, 'float': 1, 'vertical-align': 1, 'list-style-type': 1, 'display': 1
}
const SAFE_DISPLAY = /^(block|inline|inline-block|table|table-cell|table-row)$/i
const SAFE_FLOAT = /^(left|right|none)$/i
const BAD_STYLE_VALUE = /url\s*\(|expression|javascript|vbscript|@import|behavior|binding|\\|<|>/i

function cleanStyle (style) {
  return String(style).split(';').map(function (d) { return d.trim() }).filter(function (d) {
    const i = d.indexOf(':')
    if (i < 1) return false
    const prop = d.slice(0, i).trim().toLowerCase()
    const val = d.slice(i + 1).trim()
    if (!STYLE_PROPS[prop] || val.length === 0 || val.length > 200 || BAD_STYLE_VALUE.test(val)) return false
    if (prop === 'display' && !SAFE_DISPLAY.test(val)) return false
    if (prop === 'float' && !SAFE_FLOAT.test(val)) return false
    return true
  }).join('; ')
}

// a[href]：http(s)、mailto、站内绝对路径、锚点，以及没有协议的相对地址（第一个 / ? # 之前不能出现冒号）
const SAFE_LINK = /^(https?:\/\/|mailto:|#|\/(?!\/)|[^:/?#]*([/?#]|$))/i
// 浏览器解析 URL 时会忽略这些控制字符和空白（例如 jav<TAB>ascript:），所以判断之前先去掉
function stripUrlNoise (s) {
  let out = ''
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    const noise = c <= 0x20 || c === 0xA0 || c === 0x1680 || c === 0x180E || (c >= 0x2000 && c <= 0x2029) || c === 0x205F || c === 0x3000
    if (!noise) out += s.charAt(i)
  }
  return out
}
const SAFE_IMG = /^(https?:\/\/|\/\/|\/(?!\/)|data:image\/(png|jpe?g|gif|webp);base64,)/i   // img[src]

// 传入 DOMPurify 实例（浏览器里是全局的；测试里用 jsdom 创建），返回 sanitize(html) 函数
export function buildSanitizer (purify) {
  if (!purify || !purify.isSupported) {
    // 没有 DOM 环境（理论上只会出现在非浏览器环境）：宁可什么都不显示，也不返回未过滤的 HTML
    return function () { return '' }
  }
  purify.addHook('afterSanitizeAttributes', function (node) {
    if (!node.getAttribute) return
    const tag = node.nodeName.toLowerCase()
    if (node.hasAttribute('style')) {
      const cleaned = cleanStyle(node.getAttribute('style'))
      if (cleaned) node.setAttribute('style', cleaned)
      else node.removeAttribute('style')
    }
    if (tag === 'a') {
      const href = stripUrlNoise(node.getAttribute('href') || '')
      if (href && !SAFE_LINK.test(href)) node.removeAttribute('href')
      const target = node.getAttribute('target')
      if (target && target !== '_blank' && target !== '_self') node.removeAttribute('target')
      if (node.getAttribute('target') === '_blank') {
        // 保留已有的 rel，只确保包含 noopener（防止新窗口通过 window.opener 操作本页）
        const rel = (node.getAttribute('rel') || '').split(/\s+/).filter(Boolean)
        if (rel.indexOf('noopener') < 0) rel.push('noopener')
        node.setAttribute('rel', rel.join(' '))
      }
    }
    if (tag === 'img') {
      const src = stripUrlNoise(node.getAttribute('src') || '')
      if (!SAFE_IMG.test(src)) node.removeAttribute('src')
    }
  })
  return function sanitize (html) {
    if (html === null || html === undefined) return ''
    return purify.sanitize(String(html), {
      ALLOWED_TAGS: ALLOWED_TAGS,
      ALLOWED_ATTR: ALLOWED_ATTR,
      ALLOW_DATA_ATTR: false,
      ALLOW_ARIA_ATTR: false,
      KEEP_CONTENT: true
    })
  }
}

// 只允许 http(s) 链接（参考文献）
export function safeUrl (url) {
  return /^https?:\/\//i.test(String(url || '').trim()) ? String(url).trim() : ''
}

export default buildSanitizer(DOMPurify)
