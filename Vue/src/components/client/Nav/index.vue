<template>
    <div>
        <nav class="nav">
            <div class="container">
                <div>
                    <ul>
                        <li><router-link to="/newArtcle/1" class="active">动态</router-link></li>
                        <li v-for="item in topThemeList"><router-link :to="item.turl">{{item.tname}}</router-link></li>
                        <li><router-link to="/allTheme/1">更多分类</router-link></li>
                        <li><router-link to="/note">关于</router-link></li>
                    </ul>
                </div>    
            </div>    
        </nav>
       
    </div>
</template>
<script>
export default {
    name : "C-Nav-index",
    data(){
        return {
            topThemeList :null
        }
    },
    methods :{
        topThemeListInit :function(){
            let data = fetch(`${window.myConfig.IMPORT_HTTP}/topThemeList`,{method:"GET"}).then(function(response){
                if(response.status===200){
                    return response.json();
                } else {
                    return {}
                }
            }).then(function(data){
                if(data.length>0){
                    data.forEach(item =>{
                        if(!item.turl){
                            item.turl = `/artcleList/${item.tid}/1`
                        }
                    })
                }
                return data;
            })

            return data;
        }
    },
    async created(){
        {
            try {
                this.topThemeList = await this.topThemeListInit();
            } catch (e) {
                console.log(e)
            }
        }
    }
}
</script>
<style scoped>
nav.nav {margin: 10px 0;}
nav.nav .container { background-color: #fff; height: 40px; border-radius: 5px;position: relative; z-index: 200; box-shadow:0px 3px 10px #777; overflow: hidden;}
.nav ul { list-style: none; font-size: 0; transition: 1s;}
.nav ul li{ display: inline-block; transition: 1s; }
.nav ul li a{ padding: 0 20px ; font-size: 16px; color: #333; display: inline-block; line-height: 40px; transition: 0.5s;}
.nav ul li .router-link-active {background-color: #333; color: #fff; }
.nav ul li .router-link-active:hover {background-color: #333; }
.nav ul li a:hover{ background-color: #555; color: #fff; }

</style>
