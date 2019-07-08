const fs = require("fs");

//key长度
const KEY_LEN = 1024;
//key数量
const KEY_COUNT = 2048;
const CHARS = "123456qwertyuiopasdfghjklzxcvbnmZXCVBNMASDFGHJKLQWERTYUIOP!@#$%^&*()"

let arr = [];

for(let i=0;i<KEY_COUNT;i++){
    let key =""
    for(let j=0;j<KEY_LEN;j++){
        let ran = Math.floor(Math.random()*CHARS.length);
        key+=CHARS[ran];
    }
    arr.push(key);
}
//生成keys文件
fs.writeFileSync('.keys',arr.join('\n'));
console.log(`Generate Keys OK ! `);

