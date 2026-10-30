// multipart 上传保护。
//
// 背景：koa-better-body 在 server.js 里是全局注册的，它会把任何 multipart 请求里的文件先写进 upload/ 目录，
// 然后才轮到路由去判断"有没有登录"。结果是：任何人对任何路径发一个带文件的 POST，都能往服务器磁盘写文件。
// 而登录请求本身也是 multipart（前端用 FormData），所以不能简单地拒绝所有未登录的 multipart。
//
// 规则：
//   before（放在 body 解析器之前，依赖 session 已经注册）
//     - multipart 必须带 Content-Length（拒绝分块上传，否则无法提前限制大小）
//     - 未登录：请求体最大 ANON_MAX_BYTES（够放登录表单，放不下文件）；超过一律 401，此时还没有任何数据落盘
//     - 已登录：请求体最大 AUTH_MAX_BYTES
//   after（放在 body 解析器之后）
//     - 解析出了文件，但"未登录"或"不是允许上传的路径" => 立刻删除这些文件并拒绝
//     - 只有已登录用户访问 UPLOAD_PATHS 里的路径时，文件才会被保留

const fs = require('fs');

const ANON_MAX_BYTES = 64 * 1024;
const AUTH_MAX_BYTES = 10 * 1024 * 1024;
const UPLOAD_PATHS = { '/uploadImg': true };

function loggedIn(ctx) {
    return !!(ctx.session && ctx.session.user);
}

function reject(ctx, status, message) {
    ctx.status = status;
    ctx.set('Connection', 'close'); // 请求体没有读完，不要复用这条连接
    ctx.body = { error: message };
}

// 收集本次请求解析出来的所有文件（去重）
function collectFiles(ctx) {
    const seen = {};
    const out = [];
    function add(file) {
        if (file && typeof file.path === 'string' && !seen[file.path]) {
            seen[file.path] = true;
            out.push(file);
        }
    }
    const files = ctx.request.files;
    if (Array.isArray(files)) {
        files.forEach(add);
    } else if (files && typeof files === 'object') {
        Object.keys(files).forEach(function (k) { [].concat(files[k]).forEach(add); });
    }
    const fields = ctx.request.fields;
    if (fields && typeof fields === 'object') {
        Object.keys(fields).forEach(function (k) { [].concat(fields[k]).forEach(add); });
    }
    return out;
}

function removeFiles(files) {
    files.forEach(function (file) {
        fs.unlink(file.path, function () { /* 文件可能已经不存在，忽略 */ });
    });
}

async function before(ctx, next) {
    if (!ctx.is('multipart')) {
        return next();
    }
    const authed = loggedIn(ctx);
    const length = parseInt(ctx.get('content-length'), 10);
    if (!(length >= 0)) {
        return reject(ctx, 411, '缺少 Content-Length');
    }
    if (length > (authed ? AUTH_MAX_BYTES : ANON_MAX_BYTES)) {
        return authed ? reject(ctx, 413, '上传内容过大') : reject(ctx, 401, '请先登录后再上传');
    }
    return next();
}

async function after(ctx, next) {
    const files = collectFiles(ctx);
    if (files.length === 0) {
        return next();
    }
    if (loggedIn(ctx) && UPLOAD_PATHS[ctx.path]) {
        return next();
    }
    removeFiles(files);
    if (loggedIn(ctx)) {
        return reject(ctx, 400, '该接口不接受文件上传');
    }
    return reject(ctx, 401, '请先登录后再上传');
}

module.exports = {
    before: before,
    after: after,
    removeFiles: removeFiles,
    ANON_MAX_BYTES: ANON_MAX_BYTES,
    AUTH_MAX_BYTES: AUTH_MAX_BYTES
};
