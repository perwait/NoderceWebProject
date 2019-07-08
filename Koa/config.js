const path =require("path");
module.exports = {
    DB_HOST : "127.0.0.1",  //数据库的地址
    DB_PORT : "3306",  //数据库端口
    DB_USER : "root",  //数据库账号 
    DB_PASSWORD : "123123123",  //数据库密码
    DB_TABLE : "noderce",  //数据表 
    USER_PW_AFTER : "Hghg2rz182oFmIK3",  //密码校验后缀
    SESSION_MAXAGE : 60*60*1000, //session 有效期 和cookie 共用
    HTTP_HOST : "8080",  //服务端启动端口
    HTTP_URL : "http://localhost:8080",  //服务对外的域名
    UPLOAD_URL : path.resolve(__dirname,'upload'),  //客户端上传文件路径
    PAGE_VIEW_VALUE : 15 //每页显示的数量
}