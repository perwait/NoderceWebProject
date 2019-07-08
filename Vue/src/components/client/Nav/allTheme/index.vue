<template>
    <div v-wechat-title="title">
        <div class="fl">
            <article class="content-ct  bs-1">
                <div class="artcleInfo clearfloot">
                    <h2>所有类别:</h2>
                    <button v-if="userInfo!=null" @click="create(0)" type="button"  class="fr">创 建</button>
                </div>
                <div class="note">
                    <ul id="AllTheme" class="theme">
                        <li  v-for="item in allTheme">
                            <router-link :to="item.turl">
                                <div class="ticon"><img :src="item.tlogo"/></div>
                                <div class="tname">
                                    <h3>{{item.tname}}</h3>
                                    <p>共 {{item.t_pnum}} 篇文章</p>
                                </div>
                            </router-link>
                        </li>  
                    </ul>
                </div>
            </article>
        </div>
    </div>
</template>
<script>
export default {
    data(){
        return {
            title:`所有类别 - ${window.myConfig.HTTP_NAME}`,
            allTheme : null,
            userInfo : null

        }
    },
    methods : {
        create : function(cid){
            
            this.$router.push(`/create/${cid}`)
        },
        allThemeList : function(){
            let data = fetch(`${window.myConfig.IMPORT_HTTP}/allTheme/1`,{method:"GET"}).then(function(response){
                if(response.status===200){
                    return response.json();
                } else {
                    return {}
                }
                }).then(function(data){
                    if(data.length>0){
                        data.forEach(item =>{
                            if(item.tlogo){
                                item.tlogo = `${window.myConfig.IMPORT_HTTP}${item.tlogo}`
                            }
                            if(!item.turl){
                                item.turl = `/artcleList/${item.tid}/1`
                            }
                        })
                    }
                    return data;
                });
            return data;
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
        {
            try {
                this.allTheme = await this.allThemeList();
            } catch (e) {
                console.log(e)
            }
        }

    }
}
</script>
<style  scoped>
.content-ct {background-color: #fff; margin-top: 20px; overflow: hidden; }
.note  {margin: 20px; padding-bottom: 20px;}

.theme {display: block; text-align: justify;}
.theme:after {width: 100%;height: 0;margin: 0;display: inline-block;overflow: hidden;content: '';}
.theme li {display: inline-block; margin-left:10px;margin-right: 10px; margin-bottom: 10px;}
.theme li a {display: table; background-color: #f7f8fa;}
.theme li a>div{display: table-cell;}
.theme .ticon { background-color: #eef1f5;width: 80px; overflow: hidden;}
.theme .tname {padding: 10px 20px; vertical-align: middle; width: 130px; overflow: hidden;}
.theme .tname>* {width: 100%;}
.theme .tname h3 {font-size: 16px; font-weight: 500;}
.theme .tname p {font-size: 12px; line-height: 18px; color: #999; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;}
.theme li a {transition: 0.3s; color: #333;}
.theme li a:hover { box-shadow: 0 0 6px rgba(0,0,0,.1), 0 4px 6px rgba(0,0,0,.1);}
.theme li a img{vertical-align: middle;width: 100%; }

.artcleInfo {margin: 20px; }
.artcleInfo * { display: inline-block;}
.artcleInfo h2 {font-size: 26px;}
.artcleInfo button {font-size: 18px; color: #cfcfcf; background-color: #333; border: 0; padding: 4px 25px; transition: 0.3s; }
.artcleInfo button:hover { background-color: #ff6600; color: #fff;  }
</style>
