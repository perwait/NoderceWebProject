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
        UploadToken : null
        

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
            height: 200,
            max_height: 200,
            min_height: 200,
            //toolbar: true, //禁用工具栏
            resize: false, //禁用调整大小
            menubar: false, // 菜单栏
            branding: false, // 是否显示 品牌名
            elementpath: false, //隐藏底部 层级标签状态栏
            statusbar: false, //隐藏底部状态栏
            toolbar:`alignleft aligncenter alignright alignjustify | fontsizeselect  hr image link table | removeformat code`,
            plugins:`hr image link code table  `,
            fontsize_formats: '14px 16px 18px 20px 24px',
            imagetools_toolbar: 'rotateleft rotateright | flipv fliph | editimage imageoptions'
         
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
textarea { resize:none}
</style>

