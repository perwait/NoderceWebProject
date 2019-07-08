const crypto = require('crypto');

module.exports={
    md5(buffer){
        let obj = crypto.createHash("md5");
        obj.update(buffer);
        // 16进制
        return obj.digest("hex")
    }
}