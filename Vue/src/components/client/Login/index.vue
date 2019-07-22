<template>
  <div id="client" class="Login" v-wechat-title="this.title">
    <div class="content">
      <div class="form-box">
        <h1>LOGIN</h1>
        <hr>
        <p  class="msg" :class="msg?'':'hidden'">- - {{msg}} - -</p> 
        <input name="name" type="text" autocomplete="off" autofocus="autofocus"  placeholder=" User Name" v-model="name"> 
        <hr>
        <input name="password" type="password" placeholder=" Password" v-model="password"> 
        <hr>
        <button @click="loginFn()">登&#12288;&#12288;录</button> 
      </div>
    </div>
  </div>
</template>

<script>


export default { 
  name: 'C-login',
  data () {
    return {
     title: `登录 - ${window.myConfig.HTTP_NAME} `,
     msg : "",
     name:"",
     password:"",
     loginimg : false

    }
  },
   methods: {
     loginFn(){
      //防止重复请求 ，请求完成前 终止请求队列
      if(!this.loginimg){
        this.loginimg=true;
       
          this.msg =""
        if(this.name.length===0){
          //用户名未输入
          this.msg="\u7528\u6237\u540d\u672a\u8f93\u5165"
        } else if(this.password.trim().length===0){
          //密码未输入
          this.msg="\u5bc6\u7801\u672a\u8f93\u5165"
        } else if(this.name.trim().length>16){
          //用户名格式不正确 最大长度为16
          this.msg="\u7528\u6237\u540d\u683c\u5f0f\u4e0d\u6b63\u786e\u0020\u6700\u5927\u957f\u5ea6\u4e3a\u0031\u0036"
        } else if(this.password.trim().length>16){
          //密码格式不正确 最大长度为16
          this.msg="\u5bc6\u7801\u683c\u5f0f\u4e0d\u6b63\u786e\u0020\u6700\u5927\u957f\u5ea6\u4e3a\u0031\u0036"
        } else if(this.name.trim().search(/\W/g)!==-1){
          //用户名格式不正确 用户名只能为 英文字母和阿拉伯数字
          this.msg="\u7528\u6237\u540d\u683c\u5f0f\u4e0d\u6b63\u786e\u0020\u7528\u6237\u540d\u53ea\u80fd\u4e3a\u0020\u82f1\u6587\u5b57\u6bcd\u548c\u963f\u62c9\u4f2f\u6570\u5b57"
        } else if(this.password.trim().search(/[^0-9A-Za-z\`\~\!\@\#\$\%\^\*\&\(\)\_\+\-\=\[\]\{\}\\\|\;\'\:\"\,\.\/\<\>\?]/)!==-1){
          //密码格式不正确 用户名只能为 英文字母 阿拉伯数字 半角符号
          this.msg="\u5bc6\u7801\u683c\u5f0f\u4e0d\u6b63\u786e\u0020\u7528\u6237\u540d\u53ea\u80fd\u4e3a\u0020\u82f1\u6587\u5b57\u6bcd\u0020\u963f\u62c9\u4f2f\u6570\u5b57\u0020\u534a\u89d2\u7b26\u53f7"
        } else  {  
          //创建表单对象
          let formData = new FormData();
          formData.append("username" ,this.name);
          formData.append("password" ,this.password);
          // 因为method 是不能被直接作为 async函数， 而fetch返回promise对象，因此在内部创建 async函数
          (async ()=>{
            let data = await fetch(`${window.myConfig.IMPORT_HTTP}/login`,{
              method:"POST",
              credentials: 'include',
              body : formData
            }).then(function(response){
              if(response.status===200){
                return response.json();
              } else {
                return response.json();
              }
            }).then(function(data){
              if(!data.error){
                data.uurl= `/myIndex/${data.uid}/1`;
                data.ulogo= `${window.myConfig.IMPORT_HTTP}${data.ulogo}`
              }
              return data;
            });
            if(!data.error){
              if(data.cookieAge){
                let cookieAge = data.cookieAge;
                delete data.cookieAge;
                data = JSON.stringify(data);
                document.cookie =`userInfo=${data}; expires=${new Date(cookieAge).toUTCString()}; path=/`;
              }
              this.$router.push("/")
            } else {
              this.msg=data.error
            }
          })()
        }
        this.loginimg=false;
      } 
    }
  },
  created (){
    document.getElementsByTagName("html")[0].style.height="100%";
    document.getElementsByTagName("body")[0].style.height="100%";
  },
  beforeDestroy (){
      document.getElementsByTagName("html")[0].style.height="auto";
      document.getElementsByTagName("body")[0].style.height="auto";
  },
  components : {
  
  },
  mounted : function(){

  }
}
</script>
<style scoped>

.Login {width:100%;height: 100%; position: relative;  background-color: #252535; overflow: hidden;}
@media screen and (max-width : 760px){
  .form-box {width: 80%;}
}
@media screen and (min-width : 761px){
  .form-box {width: 450px;}
}
.form-box {text-align: center; padding:50px 30px; border: 2px solid #fff; border-radius: 10px; background-color: #e4e6dc;margin: 0 auto;;margin-top: 10%;}
.form-box > * { color: #333;outline: none;width: 90%; display: block;margin: 10px auto; font-size: 18px; line-height: 40px; border-radius: 10px; border: 1px solid transparent; transition: 0.3s;}
.form-box .hidden {opacity: 0;}
.form-box h1 { font-size: 35px;}
.form-box hr {margin: 0;}
.form-box input {text-indent : 20px;}
.form-box .msg { color: red; }
.form-box input:focus { box-shadow: 0 1px 5px #999}
.form-box button {background-color: #226d22; color: #fafafa;}
.form-box button:hover {background-color: #37a837; color: #fff; }
</style>

