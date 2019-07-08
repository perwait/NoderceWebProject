import Vue from 'vue'
import Router from 'vue-router'
import Client from '@/components/client'
import Admin from '@/components/admin'
import CClient from "@/components/client/Client/index"
import CLogin from "@/components/client/Login/index"


import CNote from "@/components/client/Note"
import CNoteAside from "@/components/client/Note/aside"
import CNewArtcle from "@/components/client/Nav/newArtcle"
import CArtcle from "@/components/client/Nav/artcle"
import CartcleList from "@/components/client/Nav/artcleList"
import CAllTheme from "@/components/client/Nav/allTheme"
import CMyIndex from "@/components/client/MyIndex"
import CAside from "@/components/client/Public/Aside"
import CCreate from "@/components/client/Nav/create"
Vue.use(Router)


export default new Router({
  routes: [
    {
      path: '/', 
      name: 'Client',
      component: Client,  
      children : [
        {
          path : "/",
          component : CClient,
          redirect : "newArtcle/1",
          children : [
            { 
              //创建主题 与 创建文章, 当cid为0时 则创建主题， 大于1时，tid=cid 代表创建某个主题类目的文章  
              path : "/create/:cid",
              components :{
                default : CCreate,
                aside :CAside
              }
            },
            {
              //首页最新 文章  page：页码
              path : "/newArtcle/:page",
              components : {
                default : CNewArtcle,
                aside :CAside             

              }
            },
            {
              //个人主页
              path: "/myIndex/:uid/:page",
              components : {
                default : CMyIndex,
                aside :CAside
              }
            },
            {
                //对应主题的文章列表
                path: "/artcleList/:tid/:page",
                name: "artcleList",
                components : {
                  default : CartcleList,
                  aside :CAside
                }
              
            },
            {
              //所有主题  page：页码
              path: "/allTheme/:page",
              components : {
                default : CAllTheme,
                aside :CAside
              }
            },
            {
              // 获取文章内容 tid：类目ID ，pid：文章ID, page 回复的页码
              path: "/artcle/:tid/:pid/:page",
              name:"artcle",
              components : {
                default : CArtcle,
                aside :CAside
              }
            },
            {
              path : "/note",
           
              components : {
                default: CNote,
                aside :CNoteAside
              }

            }
      
          ]
        },
        {
          // 登录
          path : "login" ,
          component : CLogin

        }
      ]
    },
    {
      //后台管理
      path: '/admin',
      name: 'Admin',
      component: Admin
    }

  ]
})
