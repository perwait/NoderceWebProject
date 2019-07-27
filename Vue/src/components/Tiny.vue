<template>
  <div class="text-ed">
     <textarea :id= "Id" ></textarea>
  </div>
</template>

<script>
import './zh_CN.js'
import Editor from '@tinymce/tinymce-vue';
export default {
  name: 'App',
  data(){
    const Id = Date.now()
      return {
        Id: Id,
        Editor: null,
        DefaultConfig: {},
        UploadToken : null,
        //样式
        content_style: `
          pre  {white-space: pre-wrap; word-wrap: break-word; background-color: #252525;}
        `

      } 
  },
  
    props: {
      value: {
        default: "",
        type: String
      },
      config: {
        type: Object,
        default: () => {
          return {
            theme: 'modern', //默认主题
            content_style :`
                p { color : #333}
                a { text-decoration: none; color:#3939ff;}
                hr { border: 0;border-bottom: 1px dashed #c3c3c3; margin: 5px 0;  }
                li {margin-left: 30px; list-style: none;}
                pre { background-color: #252525; letter-spacing: 1px; margin: 10px; padding: 0 15px;  padding-bottom: 5px;  border-radius: 10px; overflow: hidden; white-space: pre-wrap; word-wrap: break-word;}
                pre>code{ color: #fff; width: 100% }
                img {max-width: 100%; height:auto; border: 1px solid #ccc;}
            `,
            height: 200,
            max_height: 200,
            min_height: 200,
            //toolbar: true, //禁用工具栏
            resize: false, //禁用调整大小
            menubar: false, // 菜单栏 "edit" | false | true
            branding: false, // 是否显示 品牌名
            elementpath: false, //隐藏底部 层级标签状态栏
            statusbar: false, //隐藏底部状态栏
            toolbar:`formatselect fontsizeselect  forecolor backcolor | alignleft aligncenter alignright alignjustify |  hr image link table | removeformat code codesample`,
            plugins:`textcolor  paste hr image link code table codesample `,
            fontsize_formats: '14px 16px 18px 20px 24px',
            image_description :false, //图片是否启用描述
            image_dimensions:false, //图片是否启动大小调节
            imagetools_toolbar: 'rotateleft rotateright | flipv fliph | editimage imageoptions',
            default_link_target: "_blank", //a链接默认打开方式
            target_list : false , //禁用 a链接 打开方式的选择
            link_title :false , //禁用 定义a连接 的title属性
            paste_data_images : false ,//是否粘贴图像自动上传
            paste_remove_styles_if_webkit: true ,//禁止class样式保留
            codesample_languages: [ //代码插入支持的语法高亮
              {text: 'HTML/XML', value: 'a'},
              {text: 'JavaScript', value: 'b'},
              {text: 'CSS', value: 'c'},
            ],
            textcolor_cols : 5, //颜色列数
            textcolor_rows :1, //颜色行数
            textcolor_map: [ //颜色地图
              "ff3333", "red",
              "336dff", "blue",
              "629c32", "green",
              "f3a400", "yello"
            ],
            block_formats :'Paragraph=p;Heading 1=h1;Heading 2=h2;Heading 3=h3;Code标签=code'
       
            
          }
        }
      },
      //token_是获取token的url请求路径
      tokenUrl: {
          default: '',
          type: String
      },
      //图片上传需要的
      //url是上传空间路径
      url: {
          default: '',
          type: String
      },
      accept: {
        default: 'image/jpeg, image/png',
        type: String
      },
      maxsizetext : {
        default: '',
        type: String
      },
      maxSize: {
        default: 2097152,
        type: Number
      },
      withCredentials: {
        default: false,
        type: Boolean
      }
    },
    mounted () {
      this.init()
    },
    beforeDestroy () {
      // 销毁tinymce
      this.$emit('on-destroy')
      window.tinymce.remove(`#${this.Id}`)
      console.log("Tiny destroy")
    },
    methods: {
       init () {
        const self = this
        this.Editor = window.tinymce.init({
          
          // 默认配置
          ...this.DefaultConfig,
          
          // prop内传入的的config
          ...this.config, 

           // 图片上传
          images_upload_handler: function (blobInfo, success, failure) {
            if (blobInfo.blob().size > self.maxSize) {
              failure(`文件体积过大  ${self.maxsizetext}`)
            }
            
            if (self.accept.indexOf(blobInfo.blob().type) >= 0) {
              uploadPic()
            } else {
              failure('图片格式错误')
            }
            function uploadPic () {
              //const xhr = new XMLHttpRequest()
              let formData = new FormData()
              formData.append('file', blobInfo.blob());
              if(!self.UploadToken){
                //如果UploadToken 不存在  则获取一个
                ( async ()=>{
                  await fetch(self.tokenUrl,{
                    method : "POST",
                    credentials: 'include'
                  }).then(function(response){
                    if(response.status===200){
                      return response.json()
                    } else {
                      return {}
                    }
                  }).then(function(data){
                    if(data.uploadToken){
                      self.UploadToken=data.uploadToken
                      formData.append('token',self.UploadToken);
                    }
                  })

                  await fetch(self.url,{
                    method:"POST",
                    body: formData
                  }).then(function(response){
                    if(response.status===200){
                      return response.json()
                    }else {
                      console.log(response.status)
                      return response.json()
                    }
                    console.log(response.status)
                  }).then(function(data){
                    console.log(data)
                    if(data.hash){
                      data.url =  `${window.myConfig.QINIU_IMG_HTTP_BEFER}${data.hash}${window.myConfig.QINIU_IMG_STYLE}`
                      success(data.url)
                    }
                    if(data.err){
                      failure(data.err)
                    }
                    return;
                  })
                  //1




                })()
              } else {
                ( async ()=>{
                  formData.append('token',self.UploadToken);
                  await fetch(self.url,{
                      method:"POST",
                      body: formData
                    }).then(function(response){
                      if(response.status===200){
                        return response.json()
                      }else {
                        console.log(response.status)
                        return response.json()
                      }
                      console.log(response.status)
                    }).then(function(data){
                      console.log(data)
                      if(data.hash){
                        data.url =  `${window.myConfig.QINIU_IMG_HTTP_BEFER}${data.hash}${window.myConfig.QINIU_IMG_STYLE}`
                        success(data.url)
                      }
                      if(data.err){
                        failure(data.err)
                      }
                      return;
                    })

                })()
              }

            
             /* xhr.withCredentials = self.withCredentials
              xhr.open('POST', self.url)
              
              xhr.onload = function () {

                if (xhr.status !== 200) {
                  // 抛出 'on-upload-fail' 钩子
                  self.$emit('on-upload-fail')
                  failure('上传失败: ' + xhr.status)
                  console.log("err 123123")
                  return
                }

                const json = JSON.parse(xhr.responseText)
                // 抛出 'on-upload-complete' 钩子
                self.$emit('on-upload-complete' , [
                  json, success, failure
                ])
              }
              xhr.send(formData)*/
            }
          },

          // 挂载的DOM对象
          selector: `#${this.Id}`,
          
          setup: (editor) => {
            // 抛出 'on-ready' 事件钩子
            editor.on(
              'init', () => {
                self.loading = false
                self.$emit('on-ready')
                editor.setContent(self.value)
              }
            )
            // 抛出 'input' 事件钩子，同步value数据
            editor.on(
              'input change undo redo', () => {
                self.$emit('input', editor.getContent())
              }
            )
          }
        })
        console.log("Tiny Init");
      }
    }
}
</script>
<style scoped>
</style>

