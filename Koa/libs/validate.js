// 请求参数校验。所有限制必须与数据库列宽一致（见 noderce.sql），否则会出现"校验通过但写库必然失败"。
//   posts.pname    varchar(64)    标题
//   posts.pcentent varchar(10000) 正文
//   posts.prefer   varchar(2000)  参考文献（JSON 数组字符串，含方括号）
//   reply.rcontent varchar(10000) 回复
//   theme.tname    varchar(16)    主题名
// 数据库字符集是 utf8（最多 3 字节），4 字节字符（emoji、部分生僻字）写入会报错，见下方 encodeAstral / assertNoAstral。

const LIMITS = {
    THEME_NAME_MAX : 10,
    TITLE_MAX : 40,
    CONTENT_MIN : 10,
    CONTENT_MAX : 10000,
    REPLY_MAX : 10000,
    REFER_MAX : 2000,
    REFER_ITEMS_MAX : 10,
    REFER_NAME_MAX : 70,
    REFER_URL_MAX : 300
};

// 业务错误：带 HTTP 状态码，路由里转换成 JSON 返回给前端
class AppError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

// 取字符串并去掉首尾空白；不是字符串（缺少字段、数组、文件……）一律当作空串
function text(value) {
    return typeof value === 'string' ? value.trim() : '';
}

// 数字 id，最多 10 位
function id(value, message) {
    if (typeof value === 'number') {
        value = String(value);
    }
    if (typeof value !== 'string' || !/^\d{1,10}$/.test(value)) {
        throw new AppError(400, message || '参数错误');
    }
    return parseInt(value, 10);
}

// 是否包含 4 字节字符（在 JS 里是代理对）
function hasAstral(str) {
    return /[\ud800-\udfff]/.test(str);
}

// 作为"纯文本"显示的字段（标题、主题名、参考名称）：含 4 字节字符直接拒绝
function assertNoAstral(str, label) {
    if (hasAstral(str)) {
        throw new AppError(400, label + ' 含有暂不支持的特殊字符（如 emoji），请删除后再提交');
    }
}

// 作为 HTML 显示的字段（正文、回复）：把 4 字节字符换成数字字符引用 &#128512;，
// 浏览器渲染结果完全一样，数据库里只有 ASCII，不会再因为字符集写入失败。
function encodeAstral(html) {
    return html
        .replace(/[\ud800-\udbff][\udc00-\udfff]/g, function (pair) {
            return '&#' + pair.codePointAt(0) + ';';
        })
        .replace(/[\ud800-\udfff]/g, ''); // 残缺的代理字符直接丢弃
}

// 拒绝明显的脚本注入（正文、回复是 HTML，前端用 v-html 渲染）。
// 注意这只是"次防线"：黑名单挡不住所有变形写法，真正的防线是前端渲染时用 DOMPurify 过滤（Vue/src/utils/sanitize.js）。
// 正常的编辑器内容不会触发：代码示例里的 < > 会被 TinyMCE 编码成 &lt; &gt;，不是真正的标签。
const DANGEROUS_TAG = /<\s*\/?\s*(script|iframe|frame|frameset|object|embed|applet|svg|math|style|link|meta|base|form|input|button|textarea|select)\b/i;
const EVENT_ATTR = /<\s*[a-z][^>]*[\s"'\/]on[a-z]+\s*=/i;
const SCRIPT_URL = /<[^>]*\b(href|src|action|formaction|xlink:href|data|poster|background)\s*=\s*["']?[\s\u0000-\u001f]*(javascript|vbscript|data\s*:\s*text\/html)/i;
function assertSafeHtml(html, label) {
    if (DANGEROUS_TAG.test(html) || EVENT_ATTR.test(html) || SCRIPT_URL.test(html)) {
        throw new AppError(400, label + ' 含有不允许的脚本或危险标签，请删除后再提交');
    }
}

// 参考文献：前端发来的是 '{"name":"..","url":".."},{...}'，这里解析、校验并规范化成 JSON 数组字符串
function parseRefer(raw) {
    if (Array.isArray(raw)) {
        raw = raw.join(',');
    }
    raw = text(raw);
    if (raw.length === 0) {
        return '[]';
    }
    let list;
    try {
        list = JSON.parse('[' + raw + ']');
    } catch (e) {
        throw new AppError(400, '参考列表格式不正确');
    }
    if (!Array.isArray(list) || list.length > LIMITS.REFER_ITEMS_MAX) {
        throw new AppError(400, '参考列表数量超标');
    }
    const clean = list.map(function (item) {
        const name = item && typeof item.name === 'string' ? item.name.trim() : '';
        const url = item && typeof item.url === 'string' ? item.url.trim() : '';
        if (name.length === 0 || name.length > LIMITS.REFER_NAME_MAX) {
            throw new AppError(400, '参考列表的名称不能为空且不能超过 ' + LIMITS.REFER_NAME_MAX + ' 个字');
        }
        assertNoAstral(name, '参考列表的名称');
        // 只允许 http / https，防止 javascript: 之类的链接
        if (url.length === 0 || url.length > LIMITS.REFER_URL_MAX || !/^https?:\/\/[^\s<>"']+$/i.test(url)) {
            throw new AppError(400, '参考列表的链接必须是 http(s) 地址且不能超过 ' + LIMITS.REFER_URL_MAX + ' 个字符');
        }
        return { name: name, url: url };
    });
    const out = JSON.stringify(clean);
    if (out.length > LIMITS.REFER_MAX) {
        throw new AppError(400, '参考列表字数超标 请减少');
    }
    return out;
}

// 创建文章的参数
function parseArticleInput(fields) {
    fields = fields || {};
    const tid = id(fields.tid, '非法请求');
    const title = text(fields.titleName);
    if (title.length === 0) {
        throw new AppError(400, '名称或标题 不能为空');
    }
    if (title.length > LIMITS.TITLE_MAX) {
        throw new AppError(400, '名称或标题 长度超标');
    }
    assertNoAstral(title, '名称或标题');
    let content = text(fields.titleContext);
    if (content.length === 0) {
        throw new AppError(400, '内容不能为空');
    }
    if (content.length < LIMITS.CONTENT_MIN) {
        throw new AppError(400, '内容太少');
    }
    assertSafeHtml(content, '内容');
    content = encodeAstral(content);
    if (content.length > LIMITS.CONTENT_MAX) {
        throw new AppError(400, '内容过长 请减少');
    }
    return { tid: tid, title: title, content: content, refer: parseRefer(fields.refer) };
}

// 回复的参数
function parseReplyInput(fields) {
    fields = fields || {};
    const tid = id(fields.tid, '参数错误');
    const pid = id(fields.pid, '参数错误');
    let content = text(fields.reply);
    if (content.length === 0) {
        throw new AppError(400, '内容不能为空');
    }
    assertSafeHtml(content, '内容');
    content = encodeAstral(content);
    if (content.length > LIMITS.REPLY_MAX) {
        throw new AppError(400, '内容过长');
    }
    return { tid: tid, pid: pid, content: content };
}

module.exports = {
    LIMITS: LIMITS,
    AppError: AppError,
    text: text,
    id: id,
    hasAstral: hasAstral,
    assertNoAstral: assertNoAstral,
    assertSafeHtml: assertSafeHtml,
    encodeAstral: encodeAstral,
    parseRefer: parseRefer,
    parseArticleInput: parseArticleInput,
    parseReplyInput: parseReplyInput
};
