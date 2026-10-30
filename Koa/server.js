const Koa =require('koa');
const Koa_better_body = require('koa-better-body');
const koa_router = require("koa-router");
const config = require("./config");
const db = require("./libs/database");
const static_cache = require("./router/staticCache");
const fs = require('fs');
const session = require("koa-session");
const uploadGuard = require("./libs/uploadGuard");

let server = new Koa();
console.log("Project start : ",config.HTTP_URL);

// 兜底：没被捕获的 Promise 异常只记录日志，不让进程崩溃重启
process.on("unhandledRejection", (reason) => {
    console.error("unhandledRejection:", reason);
});


//启动服务器 绑定端口
server.listen(config.HTTP_HOST);

server.context.db = db;  //注册全局 数据库连接对象
server.context.config = config; //注册全局 全局配置信息

//注册组件  session 滚动签名
//  必须放在 body 解析器之前：上传保护需要先知道请求者有没有登录
server.keys = fs.readFileSync('.keys').toString().split('\n');
server.use(session({
    key : "Session_ID",
    maxAge : config.SESSION_MAXAGE, // 20分钟
    renew : false, // 自动续期，在过期时间剩余一半的时候续期
    rolling: true // 每次设定新的过期时间 ，每次都会重新设置，这是个风险选项
},server));

//注册组件  multipart 上传保护（详见 libs/uploadGuard.js）
//  解析之前：未登录只允许体积很小的表单(登录请求)，超过的直接拒绝，不会写盘
server.use(uploadGuard.before);

//注册组件  自定义上传目录
server.use(Koa_better_body({
    uploadDir : config.UPLOAD_URL,
    keepExtensions : true
}));

//  解析之后：文件只允许"已登录用户 + 指定的上传接口"保留，其它情况立刻删除并拒绝
server.use(uploadGuard.after);

//配置 router 路由表
let router = new koa_router();

// 具体的路由表节点 
router.use('/admin',require("./router/admin"));
router.use('/',require("./router/client"));

// 注册koa-static 客户端静态文件缓存时间定义
// 开发阶段需要关闭(注释 即可)
static_cache(router,{js:7,css:7,img:7,html:7,other:7});

//注册路由表
server.use(router.routes());


