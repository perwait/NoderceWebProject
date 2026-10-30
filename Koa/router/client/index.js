const Koa_router = require("koa-router");
const Crypto = require('../../libs/md5');
const getUploadToken = require('../../libs/uploadToken');
const V = require('../../libs/validate');
const throttle = require('../../libs/throttle');
const service = require('../../libs/articleService');
const Q = require('../../libs/queries');
let router = new Koa_router();
//具体的路由表

// 数据库暂时不可用 / 过载 时返回 503，而不是 500
const BUSY = {ETIMEDOUT:true, ECONNREFUSED:true, PROTOCOL_CONNECTION_LOST:true, POOL_ENQUEUELIMIT:true, ER_CON_COUNT_ERROR:true};

// 分页偏移量。页码限制在 [1, 1000000]：page=0 会算出负的 LIMIT 偏移，MySQL 直接报语法错误(500)；
// 页码特别大又会超出 MySQL 能接受的数值范围。
function pageOffset(page, pageSize) {
    let p = parseInt(page, 10);
    if (!(p >= 1)) {
        p = 1;
    }
    if (p > 1000000) {
        p = 1000000;
    }
    return (p - 1) * pageSize;
}

// 统一的错误响应。业务错误按它自带的状态码返回；其它错误记录日志后返回通用提示，不把内部信息暴露给前端。
// throttleKey：操作失败时释放频率限制，让用户可以马上重试
function fail(ctx, err, throttleKey) {
    if (err instanceof V.AppError) {
        ctx.status = err.status;
        ctx.body = {error: err.message};
        if (throttleKey && err.status !== 429) {
            throttle.clear(throttleKey);
        }
        return;
    }
    console.error(err);
    if (throttleKey) {
        throttle.clear(throttleKey);
    }
    if (BUSY[err && err.code]) {
        ctx.status = 503;
        ctx.body = {error: "服务器繁忙，请稍后再试"};
    } else {
        ctx.status = 500;
        ctx.body = {error: "服务器内部错误，请稍后再试"};
    }
}

router.all('(.*)', async (ctx,next) =>{
    //处理跨域  此表示 跨域白名单 ，您可以自定。不在列表内的名单或者名单内为false的地址，不做跨域处理
    let allowOrigin = {
        "https://www.noderce.com":true,
        "https://noderce.com":true,
        /** 
        "http://localhost:80":true,
        "http://localhost:8080":true,
        "http://localhost":true,
        "http://127.0.0.1":true,
        "http://127.0.0.1:8081":true,
        "http://localhost:1024":true
        */
    }
    let {origin} = ctx.headers;
    //当您的 接口服务器 和 媒体资源服务器 是同一台机器是，您只需要设定设定接口请求的跨域设置
    if(allowOrigin[origin]){
        ctx.set('Access-Control-Allow-Origin', origin);  
        ctx.set('Access-Control-ALLOW-Credentials', true);  
    }
    //仅管他看上去没什么用 ，实际上会触发 session的 续期和重新设置 开关
    // ctx.session.views;
    try {
        await next()
    } catch (err) {
        // koa 默认的错误处理会清空已设置的响应头，导致 500 时浏览器只显示 CORS 错误；这里自己处理，保留 CORS 头
        fail(ctx, err);
    }
    // 如果你希望 接口服务器 和 媒体资源服务器分离，那么应该使用以下方案，来提高性能和安全性
    /* 
    console.log(ctx.header )
    if(allowOrigin[origin]){
        ctx.set('Access-Control-Allow-Origin', origin);  
        ctx.set('Access-Control-ALLOW-Credentials', true);  
        await next();
    }  else{
        ctx.status = 404;
        ctx.set('Access-Control-Allow-Origin', '*');  
        ctx.body=`${origin} 您的权限不足 禁止访问`;
        ctx.body=ctx.header;
    }
    */

});

//获取 Nav上推荐的主题类目
router.get("topThemeList", async (ctx,next)=>{
    ctx.status = 200;
    let data = await ctx.db.query(`select tid,tname,turl from theme 
        where ttop_hidden =? 
        order by ttop asc
    `,[1]);
    ctx.body = data;
})

//获取 个人主页的文章 页数
router.get("myIndexPage/:uid",async (ctx,next) => {
    let {uid} = ctx.params;
    if((uid.search(/\D/)!=-1)){
        ctx.status = 404;
        ctx.body= JSON.stringify({status:404,msg:`Error: ${uid}   is not found!`});
    } else {
        let data = await ctx.db.query("select count(pid) as n from posts where p_uid=? and phidden=?",[uid,0]);
        let pages = Math.ceil (data[0].n/ctx.config.PAGE_VIEW_VALUE );
        ctx.body = pages;
    }
});

//获取 个人主页的 文章
router.get("myIndex/:uid/:page", async (ctx,next)=> {
    let {uid,page} = ctx.params;
    if((uid.search(/\D/)!=-1)|(page.search(/\D/)!=-1)){
        ctx.status = 404;
        ctx.body= JSON.stringify({status:404,msg:`Error: ${uid} | ${page}  is not found!`});
    } else {
        ctx.status = 200;
        let start = pageOffset(page,ctx.config.PAGE_VIEW_VALUE);
        let data = await ctx.db.query(Q.MY_INDEX,[0,uid,start,ctx.config.PAGE_VIEW_VALUE]);
        ctx.body = data;
    }
});


// 获取文章内容
router.get("artcle/:tid/:pid", async (ctx,next) => {
    let {tid,pid} = ctx.params;
    if((tid.search(/\D/)!=-1)|(pid.search(/\D/)!=-1)){
        ctx.status = 404;
        ctx.body = JSON.stringify({status:404,msg:`Error: ${tid}  is not found!`});
    } else {
        ctx.status = 200;
        let data = await ctx.db.query(Q.ARTICLE,[0,tid,pid]);
        ctx.body = data;
    }
});

//获取文章的回复内容
router.get("reply/:tid/:pid/:page", async (ctx,next)=> {
    let {tid,pid,page} = ctx.params ;
    if((tid.search(/\D/)!=-1)|(pid.search(/\D/)!=-1)|(page.search(/\D/)!=-1)){
        ctx.status = 404;
        ctx.body = JSON.stringify({status:404,msg:`Error: ${tid} | ${pid} | ${page} is not found!`})
    } else {
        ctx.status = 200;
        let start =  pageOffset(page,ctx.config.PAGE_VIEW_VALUE);
        let data = await ctx.db.query(`select rid,rcontent,rcreatetime,r_uid,uname,uurl,ulogo from reply
            left join user on reply.r_uid = user.uid 
            where r_tid = ? and r_pid = ? and rhidden = ?
            order by rid asc 
            limit ? , ?
        `,[tid,pid,0,start,ctx.config.PAGE_VIEW_VALUE]);
        ctx.body = data;
    }
});


//获取 主题 名称 和文章数量
router.get("themeName/:tid", async (ctx,next) => {
    let {tid} = ctx.params;
    if(tid.search(/\D/)!=-1){
        ctx.status = 404;
        ctx.body = JSON.stringify({status:404,msg:`Error: ${tid}  is not found!`});
    } else {
        ctx.status = 200;
        let data = await ctx.db.query(Q.THEME_NAME,[tid]);
        ctx.body = data;
    }
})

//获取 指定主题的 文章
router.get("artcleList/:tid/:page", async (ctx,next) =>{
    let {tid,page} =  ctx.params;
    if((tid.search(/\D/)!=-1)|(page.search(/\D/)!=-1)){
        ctx.status = 404;
        ctx.body= JSON.stringify({status:404,msg:`Error: ${tid} | ${page} is not found!`});
    } else  {
        ctx.status = 200;
        let start = pageOffset(page,ctx.config.PAGE_VIEW_VALUE);
        let data = await ctx.db.query(Q.ARTICLE_LIST,[0,tid,start,ctx.config.PAGE_VIEW_VALUE]);
        ctx.body=data;
    }
});

//获取 最新文章 页数
router.get("newArtclePage", async (ctx,next)=> {
    let data = await ctx.db.query(Q.NEW_ARTICLES_COUNT,[0]);
    ctx.body = Math.ceil(data[0].n/ctx.config.PAGE_VIEW_VALUE);
});

//获取 最新文章 列表
router.get("newArtcle/:page", async (ctx,next)=> {
    let page = ctx.params.page;
    if(page.search(/\D/)!=-1){
        ctx.status = 404;
        ctx.body= JSON.stringify({status:404,msg:`Error: ${page} is not found!`});
    } else {
        ctx.status = 200;
        let start = pageOffset(page,ctx.config.PAGE_VIEW_VALUE);
        let data = await ctx.db.query(Q.NEW_ARTICLES,[0,start,ctx.config.PAGE_VIEW_VALUE]);
        ctx.body = data;
    }
});



//获取 主题类别 页数
router.get("allThemePage",async (ctx,next) => {
    let data = await ctx.db.query("select count(*) as n from theme");
    let pages = Math.ceil (data[0].n/ctx.config.PAGE_VIEW_VALUE );
    ctx.body = pages;
});

//获取 主题类别 列表， 
router.get("allTheme/:page",async (ctx,next) => {
    let page = ctx.params.page;
    if(page.search(/\D/)!=-1){
        ctx.status = 404;
        ctx.body= JSON.stringify({status:404,msg:`Error: ${page} is not found!`});
    } else {
        ctx.status = 200;
        let start = pageOffset(page,ctx.config.PAGE_VIEW_VALUE);
        let data = await ctx.db.query(Q.THEME_LIST,[start,ctx.config.PAGE_VIEW_VALUE]);
        ctx.body = data;
    }
});


//登录请求
router.post("login",async (ctx,next) => {
   

    //ctx.res.setHeader('access-control-allow-origin','*');
    //获取post 参数
    let {username,password} = ctx.request.fields || {};
    username = V.text(username);
    password = V.text(password);
    let msg=null;
    if(username.length===0){
        //用户名未输入
        ctx.status = 401;
        msg="\u7528\u6237\u540d\u672a\u8f93\u5165"
        ctx.body={error:msg};
    } else if(password.length===0){
        //密码未输入
        ctx.status = 401;
        msg="\u5bc6\u7801\u672a\u8f93\u5165"
        ctx.body={error:msg};
    } else if(username.length>16){
        //用户名格式不正确 最大长度为16
        ctx.status = 401;
        msg="\u7528\u6237\u540d\u683c\u5f0f\u4e0d\u6b63\u786e\u0020\u6700\u5927\u957f\u5ea6\u4e3a\u0031\u0036"
        ctx.body={error:msg};
    } else if(password.length>16){
        //密码格式不正确 最大长度为16
        ctx.status = 401;
        msg="\u5bc6\u7801\u683c\u5f0f\u4e0d\u6b63\u786e\u0020\u6700\u5927\u957f\u5ea6\u4e3a\u0031\u0036"
        ctx.body={error:msg};
    } else if(username.search(/\W/g)!==-1){
        //用户名格式不正确 用户名只能为 英文字母和阿拉伯数字
        ctx.status = 401;
        msg="\u7528\u6237\u540d\u683c\u5f0f\u4e0d\u6b63\u786e\u0020\u7528\u6237\u540d\u53ea\u80fd\u4e3a\u0020\u82f1\u6587\u5b57\u6bcd\u548c\u963f\u62c9\u4f2f\u6570\u5b57"
        ctx.body={error:msg};
    } else if(password.search(/[^0-9A-Za-z\`\~\!\@\#\$\%\^\*\&\(\)\_\+\-\=\[\]\{\}\\\|\;\'\:\"\,\.\/\<\>\?]/)!==-1){
        //密码格式不正确 用户名只能为 英文字母 阿拉伯数字 半角符号
        ctx.status = 401;
        msg="\u5bc6\u7801\u683c\u5f0f\u4e0d\u6b63\u786e\u0020\u7528\u6237\u540d\u53ea\u80fd\u4e3a\u0020\u82f1\u6587\u5b57\u6bcd\u0020\u963f\u62c9\u4f2f\u6570\u5b57\u0020\u534a\u89d2\u7b26\u53f7"
        ctx.body={error:msg};
    } else  {  
        //数据合法性验证成功 开始验证身份
        //密码转换 MD5
        password = Crypto.md5(password+ctx.config.USER_PW_AFTER);
        
        let data = await ctx.db.query("select uid,uname,upw,uurl,ulogo,uartcles,utxt from user where uname = ?",[username])
        if(data.length===0){
            //用户不存在
            ctx.status = 401;
            msg="\u7528\u6237\u4e0d\u5b58\u5728"
            ctx.body={error:msg};
        } else if(data.length>1){
            //账户异常
            ctx.status = 500;
            msg="\u7528\u6237\u5f02\u5e38"
            ctx.body={error:msg};
        } else if(data[0].uname === username){
            if(data[0].upw !== password){
                //账号 或 密码错误
                ctx.status = 402;
                msg="\u8d26\u53f7\u0020\u6216\u0020\u5bc6\u7801\u9519\u8bef"
                ctx.body={error:msg};
            } else {
                // 验证完成 账号密码都正确
                ctx.status = 200;
                //存储session
                //客户端返回cookie数组，由客户端自行设置cookie
                if(!ctx.session["user"]) {
                    ctx.session["user"] = {uid:data[0].uid,uname:data[0].uname};
                    data[0].cookieAge = (new Date().getTime()+ctx.config.SESSION_MAXAGE);
                } 
                delete data[0].upw;
                ctx.body = data[0];
            }
        }
        
      }
    });

// 验证是否有登录session ，如果没有 要求重新登录，不能设置为all，除非将图片做额外的路由接口
router.post("(.*)",async (ctx,next)=>{
    if(ctx.session["user"]) {
        await next();
    } else {
        ctx.status = 403 ;
        // 请保存数据，登陆后再操作
        let msg="\u8bf7\u4fdd\u5b58\u6570\u636e\uff0c\u767b\u9646\u540e\u518d\u64cd\u4f5c";
        ctx.body = {error:msg};
    }
})

//获取上传凭证
router.post('getUploadToken',async (ctx,next)=>{
    if(ctx.session["user"]) {
        ctx.status = 200;
        ctx.body =  {uploadToken : getUploadToken(ctx.config.QINIU_CONFIG)};
    } else {
        ctx.status = 403;
        //用户未登录
    }

})

//上传图片（需要登录；放在登录校验之后，避免匿名用户往服务器写文件）
router.post("uploadImg", async (ctx,next)=>{
    try {
        let files = ctx.request.fields && ctx.request.fields.file;
        let file = Array.isArray(files) ? files[0] : files;
        if(!file || typeof file.path !== "string"){
            throw new V.AppError(400, "没有收到文件");
        }
        //只允许图片：上传目录是作为静态资源直接对外提供的，不能让人传 .html / .js 之类的文件
        if(!/\.(jpe?g|png|gif|webp)$/i.test(file.path)){
            require("fs").unlink(file.path, function(){});
            throw new V.AppError(400, "只允许上传图片（jpg / png / gif / webp）");
        }
        ctx.status = 200;
        ctx.body = {url: ctx.config.HTTP_URL + "/" + require("path").basename(file.path)};
    } catch (err) {
        fail(ctx, err);
    }
});

//创建类目
router.post("createTheme",async (ctx,next)=>{
    let key = `theme:${ctx.session["user"].uid}`;
    try {
        let titleName = V.text((ctx.request.fields || {}).titleName);
        if(titleName.length<=0){
            throw new V.AppError(400, "名称或标题 不能为空");
        }
        if(titleName.length>V.LIMITS.THEME_NAME_MAX){
            throw new V.AppError(400, "名称或标题 长度超标");
        }
        V.assertNoAstral(titleName, "名称或标题");
        //防止连点 / 重复提交
        if(!throttle.hit(key, 3000)){
            throw new V.AppError(429, "操作过于频繁，请稍后再试");
        }
        //判断重复
        if((await ctx.db.query(`select tid from theme where tname = ?`,[titleName])).length!==0){
            throw new V.AppError(405, "该类目已存在，不能重复创建");
        }
        await ctx.db.query(`insert into theme (tname,t_uid) values (?,?) `,[titleName,ctx.session["user"].uid]);
        ctx.status = 200;
        ctx.body = {ok : "创建成功"};
    } catch (err) {
        fail(ctx, err, key);
    }
});

//创建文章
//  不再重试：校验失败直接返回错误；写库在一个事务里完成（见 libs/articleService.js），成功后才返回 ok
router.post("createArtcle",async ( ctx,next)=>{
    let key = `article:${ctx.session["user"].uid}`;
    try {
        let input = V.parseArticleInput(ctx.request.fields);
        //防止连点 / 重复提交
        if(!throttle.hit(key, 5000)){
            throw new V.AppError(429, "操作过于频繁，请稍后再试");
        }
        let result = await service.createArticle(ctx.db, ctx.session["user"].uid, input);
        //touch session 让它续期
        ctx.session.views;
        result.user.cookieAge = (new Date().getTime()+ctx.config.SESSION_MAXAGE);
        ctx.status = 200;
        ctx.body = {ok:"创建成功",data:result.user,pid:result.pid};
    } catch (err) {
        fail(ctx, err, key);
    }
});

// 文章回复
router.post("reply", async (ctx,next)=>{
    let key = `reply:${ctx.session["user"].uid}`;
    try {
        let input = V.parseReplyInput(ctx.request.fields);
        //防止连点 / 重复提交
        if(!throttle.hit(key, 3000)){
            throw new V.AppError(429, "操作过于频繁，请稍后再试");
        }
        await service.createReply(ctx.db, ctx.session["user"].uid, input);
        ctx.status = 200;
        ctx.body = {ok : "回复成功"};
    } catch (err) {
        fail(ctx, err, key);
    }
})

module.exports = router.routes();
