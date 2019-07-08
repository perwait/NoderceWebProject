<template>
    <div>
        <div id="pages" v-if="this.pages>1">
            <ul>
                <li v-if="page>1" @click="pageTop()">|&lt;&lt;</li> 
                <li v-if="page>1" @click="pageBefer()">&lt;</li> 
                <span>{{page}} / {{pages}}</span>
                <li v-if="page<pages" @click="pageNext()">&gt;</li> 
                <li v-if="page<pages" @click="pageLast()">&gt;&gt;|</li> 
            </ul>
        </div>
    </div>
</template>
<script>
export default {
    name:"C-pages",
    props:["page","pages","routerName","paramsJson"],
    data(){
        return {
          
        }
    },
    methods :{
         pageBefer : function(){
            let tempPage = parseInt(this.page);
            let page = tempPage-1<1?1:tempPage-1;
            this.$router.push({name:this.routerName,params:{...this.paramsJson,page:page}})
        },
        pageTop : function(){
            let page = 1;
            this.$router.push({name:this.routerName,params:{...this.paramsJson,page:page}})
        },
        pageNext: function(){
            let tempPage = parseInt(this.page);
            let page = tempPage+1>this.pages?this.pages:tempPage+1;
            this.$router.push({name:this.routerName,params:{...this.paramsJson,page:page}})

        },
        pageLast: function(){
            let page = parseInt(this.pages);
            this.$router.push({name:this.routerName,params:{...this.paramsJson,page:page}})
        }
    }   

}
</script>
<style scoped>
#pages ul { text-align: center; list-style: none; margin: 10px;}
#pages li{display: inline-block;padding: 5px 10px;margin: 0 5px; border: 1px solid #777; cursor:pointer; transition: 0.5s; border-radius: 5px;}
#pages li:hover { background-color: #ff7b4b; color: #fff; border-radius:0 0 6px rgba(0,0,0,.1), 0 4px 6px rgba(0,0,0,.1);; }

</style>
