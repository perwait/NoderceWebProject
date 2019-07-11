const crypto = require("crypto");

module.exports= function (config){
    //定义策略
    putPolicy = {
        scope: config.scope,
        deadline : new Date().getTime()+config.time
    }
    // 序列化成字符串
    putPolicy = JSON.stringify(putPolicy);
    //生成 base64
    let encodedPutPolicy = putPolicy;
    function getBase64(str){
        // node v 0.x.x  - v 6.x.x
        //var  _base64Str = new Buffer(str).toString("base64");
        // node v 8.x.x - new verstion
        var  _base64Str = Buffer.from(str).toString("base64");
        return _base64Str;
    }
    encodedPutPolicy = getBase64(encodedPutPolicy);
    //转换成安全的base64   
    //将字符串中的加号 + 换成中划线 - ，并且将斜杠 / 换成下划线 _ 
    //编码规范请参考RFC4648标准
    function getSafetyBase64(base64){
        base64 = base64.replace(/\+/g,"-")
        base64 = base64.replace(/\//g,"_")
        return base64;
    }
    encodedPutPolicy = getSafetyBase64(encodedPutPolicy);
    //hmac-sha1 签名
    //加密出来的是二进制数据 ,请注意 这里要保持原先的二进制数据
    let sign =  crypto.createHmac('sha1', config.secretKey).update(encodedPutPolicy).digest();
    //再次转换成 安全的base64
    let encodedSign = getBase64(sign);
    encodedSign = getSafetyBase64(encodedSign);
    //拼接最后的上传字符串
    let uploadToken = config.accessKey + ':' + encodedSign + ':' + encodedPutPolicy;
    return uploadToken;
}

