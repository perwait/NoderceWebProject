// 服务端配置模板。
// 使用方法：复制本文件为 config.js（已被 .gitignore 排除，不会被提交），然后按实际环境填写。
// 注意：config.js 里有数据库密码、密码盐、七牛密钥，权限建议设置为 600，不要提交到 Git。
const path =require("path");
module.exports = {
    DB_HOST : "127.0.0.1",  //数据库的地址
    DB_PORT : "3306",  //数据库端口
    DB_USER : "noderce_app",  //数据库账号（建议使用只有 noderce 库 SELECT/INSERT/UPDATE/DELETE 权限的专用账号，不要用 root）
    DB_PASSWORD : "change-me",  //数据库密码
    DB_TABLE : "noderce",  //数据库名
    USER_PW_AFTER : "change-me-to-a-long-random-string",  //密码校验后缀(盐)：改成你自己的随机字符串；修改后已有用户的密码需要重新设置
    SESSION_MAXAGE : 60*60*1000, //session 有效期 和cookie 共用
    HTTP_HOST : "8080",  //服务端启动端口
    HTTP_URL : "http://localhost:8080",  //服务对外的域名
    UPLOAD_URL : path.resolve(__dirname,'upload'),  //客户端上传文件路径
    PAGE_VIEW_VALUE : 15, //每页显示的数量(前端 src/main.js 里的 A_PAGE_NUMBER 要与之一致)
    QINIU_CONFIG : {
        scope : "noderce", //空间名称
        time : 3600*1000, //有效时间 毫秒
        accessKey : "your AK", //七牛云 AK
        secretKey : "your SK" //七牛云 SK
    }
}
