const Koa_router = require("koa-router");
const Crypto = require('../../libs/md5');

let router = new Koa_router();
//具体的路由表




router.all('*', async (ctx,next) =>{
    //处理跨域  此表示 跨域白名单 ，您可以自定。不在列表内的名单或者名单内为false的地址，不做跨域处理
    let allowOrigin = {
        "http://localhost:80":true,
        "http://localhost:8080":true,
        "http://localhost":true,
        "http://127.0.0.1":true,
        "http://localhost:82":true
    }
    let {origin} = ctx.headers;
    //当您的 接口服务器 和 媒体资源服务器 是同一台机器是，您只需要设定设定接口请求的跨域设置
    if(allowOrigin[origin]){
        ctx.set('Access-Control-Allow-Origin', origin);  
        ctx.set('Access-Control-ALLOW-Credentials', true);  
    }
    //仅管他看上去没什么用 ，实际上会触发 session的 续期和重新设置 开关
    // ctx.session.views;
    await next()
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



//获取 个人主页的 文章
router.get("myIndex/:uid/:page", async (ctx,next)=> {
    let {uid,page} = ctx.params;
    if((uid.search(/\D/)!=-1)|(page.search(/\D/)!=-1)){
        ctx.status = 404;
        ctx.body= JSON.stringify({status:404,msg:`Error: ${uid} | ${page}  is not found!`});
    } else {
        ctx.status = 200;
        let start = (parseInt(page)-1)*ctx.config.PAGE_VIEW_VALUE;
        let data = await ctx.db.query(`select pid,p_tid,p_uid,pname,pecho,pcreatetime,purl,tlogo,tname,turl,uname,uurl,ulogo,utxt,uartcles from posts
            left join theme on posts.p_tid = theme.tid 
            left join user on posts.p_uid = user.uid
             where phidden=? and p_uid=? order by pcreatetime DESC limit ?,?`,[0,uid,start,ctx.config.PAGE_VIEW_VALUE]);
        ctx.body = data;
    }
    next();
});


// 获取文章内容
router.get("artcle/:tid/:pid", async (ctx,next) => {
    let {tid,pid} = ctx.params;
    if((tid.search(/\D/)!=-1)|(pid.search(/\D/)!=-1)){
        ctx.status = 404;
        crx.body = JSON.stringify({status:404,msg:`Error: ${tid}  is not found!`});
    } else {
        ctx.status = 200;
        let data = await ctx.db.query(`select pid,pname,pcreatetime,pcentent,pecho,prefer,p_tid,tname,turl,p_uid,uname,uurl,ulogo,utxt,uartcles from posts 
        left join theme on posts.p_tid = theme.tid
        left join user on posts.p_uid = user.uid 
        where phidden=? and p_tid=? and pid=? 
            `,[0,tid,pid]);
        ctx.body = data;
    }
});

//获取文章的回复内容
router.get("reply/:tid/:pid/:page", async (ctx,next)=> {
    let {tid,pid,page} = ctx.params ;
    if((tid.search(/\D/)!=-1)|(pid.search(/\D/)!=-1)|(page.search(/\D/)!=-1)){
        ctx.status = 404;
        ctx.bbody = JSON.stringity({status:404,msg:`Error: ${tid} | ${pid} | ${page} is not found!`})
    } else {
        ctx.status = 200;
        let start =  (parseInt(page)-1)*ctx.config.PAGE_VIEW_VALUE;
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
        crx.body = JSON.stringify({status:404,msg:`Error: ${tid}  is not found!`});
    } else {
        ctx.status = 200;
        let data = await ctx.db.query(`select tname,t_pnum from theme where tid = ?`,[tid]);
        ctx.body = data;
    }
})

//获取 指定主题的 文章
router.get("artcleList/:tid/:page", async (ctx,next) =>{
    let {tid,page} =  ctx.params;
    if((tid.search(/\D/)!=-1)|(page.search(/\D/)!=-1)){
        ctx.status = 404;
        ctx.body= JSON.stringify({status:404,msg:`Error: ${tid} | ${pid} is not found!`});
    } else  {
        ctx.status = 200;
        let start = (parseInt(page)-1)*ctx.config.PAGE_VIEW_VALUE;
        let data = await ctx.db.query(`select pid,p_tid,p_uid,pname,pecho,pcreatetime,purl,uname,ulogo,uurl,tname from posts
            left join user on posts.p_uid = user.uid 
            left join theme on posts.p_tid = theme.tid
            where phidden=? and p_tid=? order by pcreatetime DESC limit ?,?`,[0,tid,start,ctx.config.PAGE_VIEW_VALUE]);
        ctx.body=data;
    }
    next();
});

//获取 最新文章 列表
router.get("newArtcle/:page", async (ctx,next)=> {
    let page = ctx.params.page;
    if(page.search(/\D/)!=-1){
        ctx.status = 404;
        ctx.body= JSON.stringify({status:404,msg:`Error: ${page} is not found!`});
    } else {
        ctx.status = 200;
        let start = (parseInt(page)-1)*ctx.config.PAGE_VIEW_VALUE;
        let data = await ctx.db.query(`select pid,p_tid,p_uid,pname,pecho,pcreatetime,purl,tlogo,tname,uname,turl,uurl from posts
            left join theme on posts.p_tid = theme.tid 
            left join user on posts.p_uid = user.uid
             where phidden=? order by pcreatetime DESC limit ?,?`,[0,start,ctx.config.PAGE_VIEW_VALUE]);
        ctx.body = data;
    }
    next();
});

//获取 主题类别 列表， 
router.get("allTheme/:page",async (ctx,next) => {
    let page = ctx.params.page;
    if(page.search(/\D/)!=-1){
        ctx.status = 404;
        ctx.body= JSON.stringify({status:404,msg:`Error: ${page} is not found!`});
    } else {
        ctx.status = 200;
        let start = (parseInt(page)-1)*ctx.config.PAGE_VIEW_VALUE;
        let data = await ctx.db.query("select tid,tname,tlogo,t_pnum,turl from theme order by tid DESC limit ?,?",[start,ctx.config.PAGE_VIEW_VALUE]);
        ctx.body = data;
    }
    next();
});


//登录请求
router.post("login",async (ctx,next) => {
   

    //ctx.res.setHeader('access-control-allow-origin','*');
    //获取post 参数
    let {username,password} = ctx.request.fields
    username = username.trim();
    password = password.trim();
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
router.post("*",async (ctx,next)=>{
    if(ctx.session["user"]) {
        await next();
    } else {
        ctx.status = 403 ;
        // 请保存数据，登陆后再操作
        msg="\u8bf7\u4fdd\u5b58\u6570\u636e\uff0c\u767b\u9646\u540e\u518d\u64cd\u4f5c";
        ctx.body = {error:msg};
    }
})

//创建类目
router.post("createTheme",async (ctx,next)=>{
    let {titleName} = ctx.request.fields;
    titleName=titleName.trim();
    let createMsg =null;
    if(titleName===null||titleName.length<=0){
        //名称或标题 不能为null
        ctx.status = 401;
        createMsg = "\u540d\u79f0\u6216\u6807\u9898\u0020\u4e0d\u80fd\u4e3a\u006e\u0075\u006c\u006c";
        ctx.body = {error:createMsg};
    } else if(titleName.length>10){
        //名称或标题 长度超标
        ctx.status = 401;
        createMsg = '\u540d\u79f0\u6216\u6807\u9898\u0020\u957f\u5ea6\u8d85\u6807';
        ctx.body = {error:createMsg};
    } else {
        //判断重复
        if((await ctx.db.query(`select tid from theme where tname = ?`,[titleName])).length===0){
            if(ctx.session['user']){
                ctx.status=200;
                let _user = ctx.session['user'];

                //创建成功
                await ctx.db.query(`insert into theme (tname,t_uid) values (?,?) `,[titleName,_user.uid]);
                createMsg = '\u521b\u5efa\u6210\u529f';
                ctx.body = {ok : createMsg};   
            }
        } else {
            ctx.status = 405;
            //该类目已存在，不能重复创建
            createMsg = '\u8be5\u7c7b\u76ee\u5df2\u5b58\u5728\uff0c\u4e0d\u80fd\u91cd\u590d\u521b\u5efa';
            ctx.body = {error:createMsg};
        }
    }
});

//创建文章
router.post("createArtcle",async ( ctx,next)=>{
    let {titleName,titleContext,refer,tid} = ctx.request.fields;
    refer = `[${refer.toString()}]`.trim()
    titleContext = titleContext.trim();
    titleName=titleName.trim();
    let createMsg =null;
    if(tid.search(/\D/)!==-1){
        //非法请求
        ctx.status = 401;
        createMsg = "\u975e\u6cd5\u8bf7\u6c42";
        ctx.body = {error:createMsg};
    }else if(titleName===null||titleName.length<=0){
        //名称或标题 不能为null
        ctx.status = 401;
        createMsg = "\u540d\u79f0\u6216\u6807\u9898\u0020\u4e0d\u80fd\u4e3a\u006e\u0075\u006c\u006c";
        ctx.body = {error:createMsg};
    } else if(titleName.length>40){
        //名称或标题 长度超标
        ctx.status = 401;
        createMsg = '\u540d\u79f0\u6216\u6807\u9898\u0020\u957f\u5ea6\u8d85\u6807';
        ctx.body = {error:createMsg};
    }else if(titleContext===null){
        //内容不能为空
        ctx.status = 401;
        createMsg = '\u5185\u5bb9\u4e0d\u80fd\u4e3a\u7a7a';
        ctx.body = {error:createMsg};
    }else if(titleContext.length<10){
        //内容太少
        ctx.status = 401;
        createMsg = '\u5185\u5bb9\u592a\u5c11';
        ctx.body = {error:createMsg};
    }else if(titleContext.length>10000){
        //内容过长 请减少
        ctx.status = 401;
        createMsg = '\u5185\u5bb9\u8fc7\u957f\u0020\u8bf7\u51cf\u5c11';
        ctx.body = {error:createMsg};
    } else if(refer.toString().length>3500){
        //参考列表总字数超标 请减少
        ctx.status = 401;
        createMsg = '\u53c2\u8003\u5217\u8868\u5b57\u6570\u8d85\u6807\u0020\u8bf7\u51cf\u5c11';
        ctx.body = {error:createMsg};
    } else {
        //验证完毕
        if(ctx.session['user']){
            let user = ctx.session['user'];
            let _data = await ctx.db.query(`select t_pnum from theme where tid =? `,[tid]);
            let udata= await  ctx.db.query(`select uid,uname,uurl,ulogo,uartcles,utxt from user where uid=?`,[user.uid]);
            if(_data.length===1){
                let t_pnum = _data[0].t_pnum;
                //将文章添加进数据库 并更改改类目目前文章数量
                await function _createArtcle (){
                    t_pnum+=1
                    ctx.db.query(`INSERT INTO posts (pid,pname,pcentent,p_tid,p_uid,prefer,pcreatetime) values (?,?,?,?,?,?,?)`
                    ,[t_pnum,titleName,titleContext,tid,user.uid,refer,new Date().getTime()]).then(function(ok){
                    },function(err){
                        _createArtcle()
                    })
                    ctx.db.query(`update theme set t_pnum = ? where tid = ?`,[t_pnum,tid]);
                    let uartcles = udata[0].uartcles
                    uartcles+=1;
                    ctx.db.query(`update user set uartcles = ? where uid = ?`,[uartcles,user.uid]);
                    //创建成功
                    ctx.status =200;
                    ctx.session.views;
                    udata[0].cookieAge = (new Date().getTime()+ctx.config.SESSION_MAXAGE);
                    ctx.body = {ok:"\u521b\u5efa\u6210\u529f",data:udata[0]};
                }();
            } else {
                //类目不存在
                ctx.status = 401;
                createMsg = '\u7c7b\u76ee\u4e0d\u5b58\u5728';
                ctx.body = {error:createMsg};
            }
        }
    }
});
// 文章回复
router.post("reply", async (ctx,next)=>{
    let {reply,tid,pid} = ctx.request.fields;
    let msg = null;
    if(reply===null){
        ctx.status = 401;
        // 内容不能为空
        msg = '\u5185\u5bb9\u4e0d\u80fd\u4e3a\u7a7a';
        ctx.body = {error : msg}
    } else if(reply.length>10000) {
        ctx.status = 401;
        // 内容过长
        msg = '\u5185\u5bb9\u8fc7\u957f';
        ctx.body = {error : msg}
    } else if((tid.search(/\D/)!==-1)&&(pid.search(/\D/)!==-1)){
        ctx.status = 401;
        // 参数错误
        msg = '\u53c2\u6570\u9519\u8bef';
        ctx.body = {error : msg}
    } else {
        let _theme = await ctx.db.query('select tid from theme where tid = ?',[tid]);
        let _posts = await ctx.db.query('select pecho from posts where pid = ? and p_tid =?',[pid,tid]);
        //判断是否真的存在这篇文章 和 服务器是否有内部错误
        if(_theme.length!==1 | _posts.length!==1){
            ctx.status = 401;
            console.log(_theme.length,_posts.length)
            // 请求异常
            msg = '\u8bf7\u6c42\u5f02\u5e38';
            ctx.body = {error : msg}
        } else {
            //校验完成 开始写入
            if(ctx.session["user"]){
                let uid = ctx.session['user'].uid;
                let _pecho = _posts[0].pecho;
                await function replyFun(){
                    _pecho+=1;
                    ctx.db.query('insert into reply (rid,rcontent,rcreatetime,r_tid,r_pid,r_uid) values (?,?,?,?,?,?)'
                    ,[_pecho,reply.trim(),new Date().getTime(),tid,pid,uid]).then(function(ok){},function(err){
                        replyFun();
                    })
                    ctx.db.query('update posts set pecho =? where p_tid = ? and pid = ? ',[_pecho,tid,pid]);
                    ctx.status = 200;
                    //回复成功
                    msg = '\u56de\u590d\u6210\u529f';
                    ctx.body = {ok : msg}
                }()
            }
        }
    }
})
    
module.exports = router.routes();
    
// console.log(ctx.request.fields)
//获取文件
//console.log(ctx.request.fields.file)
// console.log(ctx.request.fields.file[0])
