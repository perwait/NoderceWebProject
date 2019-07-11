<template>
    <div v-wechat-title="title">
        <div class="fl">
            <article class="content-ct  bs-1">
                <div class="artcleInfo clearfloot">
                    <h2 v-if="cid>0">发布文章</h2>
                    <h2 v-if="cid==0">创建主题</h2>
                    <p v-if="createMsg">{{createMsg}}</p>
                </div>
                <div v-if="cid>0" id="create" class="create">
                    <input v-model="titleName" autocomplete='off' :class="{ err : msg}" @blur="clearMsg($event)"  @keyup="Max($event,40)"   type="text" placeholder=" Artcle Name"> 
                    <hr>
                    <p class="msg"> {{msg}}</p>
                    <hr>
                    <TinyMCE v-on:input="TinyBody" :url="tinyUrl" :tokenUrl="tokenUrl" :maxsizetext="maxsizetext"  :withCredentials="withCredentials" :max-size="tinyImgSize" @on-upload-complete= "onEditorUploadComplete"  @on-upload-fail = "onEditorUploadFail"/>
                    <hr>
                    <ul id="ReferList" class="referList">
                        <span>参考列表：数量{{referList}}/{{referListMax}}</span><button @click="referDel()"> -1 </button><button @click="referAdd()"> +1 </button>
                        <li v-for="item in referList" ><input type="text" autocomplete='off' @blur="clearMsg($event,'span')"  @keyup="Max($event,40,'span')" placeholder=" Text - MaxSize 70  "><input type="text" autocomplete='off' @blur="clearMsg($event,'span')" @keyup="Max($event,300,'span')" placeholder=" URL - MaxSize 300 "><span></span></li>
                    </ul>
                    <hr>
                    <button @click="create({titleSize:40})" class="submit">发&#12288;布</button>
                </div>
                <div v-if="cid==0" id="create" class="create create-t" >
                    <input v-model="titleName" autocomplete='off' :class="{ err : msg}" @blur="clearMsg($event)"  @keyup="Max($event,10)"   type="text" placeholder=" Theme Name"> 
                    <hr>
                    <p class="msg">{{msg}}</p>
                                        
                    <hr>
                    <button @click="create({titleSize:10})"  class="submit">创&#12288;建</button>
                </div>
            </article>
        </div>
    </div>
</template>
<script>
import TinyMCE from "@/components/Tiny"
export default {
    name:"C-create",
    components :{
        TinyMCE
    },
    data(){
        return  {
            title : "Noderce",
            cid :this.$route.params.cid, //创建id   0为新主题 >0为新文章
            msg :null, //错误信息
            referList :0, //参考列表当前数量
            referListMax :10, //参考列表最大数量
            titleName : null, //标题名称 或者 主题名称
            createState : true, // 目前状态 是否允许创建 防止重复创建事件
            createMsg : null, //创建事件错误信息
            tinyBody :null, //编辑器内容
            tinyMaxSize :10000, //最大字数
          //  tinyUrl :  `${window.myConfig.IMPORT_HTTP}/uploadImg`,
            tokenUrl : `${window.myConfig.IMPORT_HTTP}/getUploadToken`,
            tinyUrl :  `${window.myConfig.QINIU_UPLOAD_HTTP}`,
            tinyImgSize : 2000*1024, //限制大小2M
            maxsizetext : " 最大2M ",
            withCredentials : true //是否允许设置cookie
        }
    },
    computed:{
    },
    methods:{
        //返回编辑器的内容
        TinyBody : function(data){
            this.tinyBody = data;
        },
        onEditorUploadComplete : function(arr){
            console.log("arr",arr)
        }, 
        onEditorUploadFail: function(err){
            
        },
        //限制最大长度
        Max : function(event,maxSize,tag){
            let _tag =null;
            let _msg =null;
            if(!tag){
                _tag =false
            } else {
                _tag = true
                _msg = event.target.parentNode.getElementsByTagName(tag)[0];
            }
            if(event.target.value.length>maxSize){
                event.target.value = event.target.value.trim().substring(0,maxSize-1);
                if(_tag){
                    _msg.innerText = "上限 自动截取"
                } else {
                    this.msg = "上限 自动截取"
                }
            } else {
                if(maxSize-event.target.value.length<20&&maxSize-event.target.value.length>=0){
                    if(_tag){
                        _msg.innerText = `还能输入${maxSize-event.target.value.length}个字`
                    } else {
                        this.msg = `还能输入${maxSize-event.target.value.length}个字`
                    }
                } else {
                    if(_tag){
                        _msg.innerText = " "
                    } else {
                        this.msg = null
                    }
                }
            }
        },
        //失去焦点时 清除 msg 
        clearMsg:function(event,tag){
            let _tag =null;
            if(!tag){
                this.msg = null;
            } else {
                event.target.parentNode.getElementsByTagName(tag)[0].innerText=" ";
            }
        },
        //参考列表 从最后减一
        referDel :function(){
            this.referList=this.referList-1<0?0:this.referList-1;
        },
        //参考列表 从最后加一
        referAdd :function(){
            this.referList=this.referList+1>this.referListMax?this.referListMax:this.referList+1;
        },
        //按钮事件 创建 函数
        create : function (json){
            //防止重复创建
            if(this.createState){
                this.createState = false;
                this.createMsg = null;
                //通用校验 
                if(this.cid.search(/\D/)!==-1){
                    //参数不正确  意外终止
                    this.createMsg = "\u53c2\u6570\u4e0d\u6b63\u786e\u0020\u0020\u610f\u5916\u7ec8\u6b62";
                } else if(this.titleName===null||this.titleName.length<=0){
                    //名称或标题 不能为null
                    this.createMsg = "\u540d\u79f0\u6216\u6807\u9898\u0020\u4e0d\u80fd\u4e3a\u006e\u0075\u006c\u006c";
                } else if(this.titleName.length>json.titleSize){
                    console.log(this.titleName.length,json.titleSize)
                    //名称或标题 长度超标
                    this.createMsg = '\u540d\u79f0\u6216\u6807\u9898\u0020\u957f\u5ea6\u8d85\u6807'
                } else {
                    this.titleName=this.titleName.trim();
                    //专用校验
                    //创建主题 
                    if(this.cid==0){
                        ( async ()=>{
                            let that = this;
                            let formData = new FormData();
                            formData.append("titleName",this.titleName.trim());
                            let data = fetch(`${window.myConfig.IMPORT_HTTP}/createTheme`,{
                                method: "POST",
                                credentials: 'include',
                                body : formData
                            }).then(function(response){
                                if(response.status===200){
                                    return response.json();
                                } else {
                                    return response.json();
                                }
                            }).then(function(data){
                                if(data.error){
                                    that.createMsg=data.error;
                                }
                                if(data.ok){
                                that.$router.push(`/allTheme/1`)
                            }
                                return data;
                            });
                            
                        })()

                    }else {
                    //发布文章 校验 
                        if(this.tinyBody===null){
                            // 编辑器内容不能为空
                            this.createMsg ="\u7f16\u8f91\u5668\u5185\u5bb9\u4e0d\u80fd\u4e3a\u7a7a";

                        } else if(this.tinyBody.length>this.tinyMaxSize){
                            // 内容过长 
                            this.createMsg = '\u5185\u5bb9\u8d85\u957f';
                        } else {
                            //处理参考列表  空值直接不传入
                            let referArr = [];
                            if(parseInt(this.referList)>0){
                                
                                let _obj = document.getElementById('ReferList');
                                let _list = _obj.getElementsByTagName("li");
                                if(_list.length>0){
                                    for(let i=0;i<_list.length;i++){
                                       let  _in=_list[i].getElementsByTagName("input");
                                        if(_in.length===2){
                                            let _json = {};
                                            _json.name = _in[0].value.trim();
                                            _json.url = _in[1].value.trim();
                                            if(_json.name.length!==0&&_json.url.length!==0){
                                                referArr.push(JSON.stringify(_json));
                                            }
                                        }
                                    }
                                }
                            }
                            ( async ()=>{
                                let that = this;
                                let formData = new FormData();
                                formData.append('titleName',this.titleName.trim());
                                formData.append('titleContext',this.tinyBody);
                                formData.append('refer',referArr);
                                formData.append('tid',this.cid)
                                await fetch(`${window.myConfig.IMPORT_HTTP}/createArtcle`,{
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
                                    if(data.error){
                                        that.createMsg=data.error;
                                    }
                                    if(data.ok){
                                       let dataCookie = data.data;
                                       if(dataCookie.cookieAge){
                                           console.log(cookieAge)
                                            dataCookie.uurl= `/myIndex/${dataCookie.uid}/1`;
                                            dataCookie.ulogo= `${window.myConfig.IMPORT_HTTP}${dataCookie.ulogo}`
                                            let cookieAge = dataCookie.cookieAge;
                                            delete dataCookie.cookieAge;
                                            dataCookie = JSON.stringify(dataCookie);

                                            document.cookie =`userInfo=${dataCookie}; expires=${new Date(cookieAge).toUTCString()}; path=/`;
                                       } 
                                       that.$router.push(`/artcleList/${that.cid}/1`)
                                    }
                                    return data;
                                })
                            })()
                        }
                    }
                }
                this.createState = true;
            }
        }
        
    },
    async created(){
        {
            //判断是否有 登录状态cookie ，免登录处理
            let userInfo = window.myFunction.getCookie("userInfo");
            if(userInfo.length===0){
                this.userInfo = null;
            } else {
                userInfo = JSON.parse(userInfo);
                this.userInfo = userInfo;
                this.$store.dispatch("asideData",this.userInfo);
            }
        }
    },
    async beforeRouteUpdate(to,form,next){
        {
            try {
                //更新内容
                if(to.params.cid!==form.params.cid){
                    this.cid = to.params.cid;
                    this.titleName = null;
                }         
                await next()
            } catch (e) {
                console.log(e)
            }
        }
    }


}
</script>
<style scoped>
.content-ct {background-color: #fff; margin-top: 20px; overflow: hidden; }

.artcleInfo {margin: 20px 40px; }
.artcleInfo h2 {font-size: 26px; text-align: center;}
.artcleInfo p {text-align: center; color: red; background-color: #ffecec; margin:0 auto; padding-top: 5px; padding-bottom: 5px; font-size: 16px; border-radius: 20px;}

.create {overflow: hidden;  }
.create>*{ margin: 10px auto; display: block; width: 90%; transition: 0.3s;}
.create hr{ margin: 0;padding: 0 ;border:0px solid transparent;}
.create input,.create button { font-size: 18px; line-height: 40px; outline: none;border-radius: 10px;  border: 1px solid transparent;}
.create input {border: 1px solid #777; text-indent: 20px;}
.create .err {border: 1px solid transparent; box-shadow: 0 1px 5px red;} 
.create .msg { font-size: 16px;height: 16px; margin: 0 auto; color: red; text-indent: 20px;}
.create .submit:hover {background-color: #30b815; color: #fff;}

.create-t {width: 50%;margin: 0 auto;}

.referList { list-style: none; }
.referList button { padding: 1px 20px; margin-left: 15px; line-height: 20px; font-size: 16px; transform: 0.3s;}
.referList button:hover { background-color: #30b815; color: #fff;}
.referList li {border-left: 1px dashed #acacac; border-bottom: 1px solid #acacac; padding: 5px; overflow: hidden;} 
.referList input {margin-right: 15px; font-size: 16px; line-height: 26px; transition: 0.5s; width: 200px; }
.referList input:focus { width: 400px; border: 1px solid #30b815;}
</style>
