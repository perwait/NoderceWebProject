const Koa_router = require("koa-router");

let router = new Koa_router();
//具体的路由表
router.get("/login", async (ctx) => {

});

router.post("/login", async (ctx) => {
    
});


router.all("*", async (ctx, next) =>{
    // 验证是否登录 
});
router.get("/", (ctx,next) => {
    ctx.body = "This is Admin html"
});

module.exports = router.routes();