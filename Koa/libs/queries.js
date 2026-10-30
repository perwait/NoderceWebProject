// 读接口使用的查询。
//
// 关键约定：页面上显示的"数量"一律从真实数据里数出来，不使用存储的计数列：
//   t_pnum  (theme)  = 该类目下未隐藏的文章数        <- 存储的 theme.t_pnum 只是"下一个 pid 的发号器"
//   pecho   (posts)  = 该文章下未隐藏的回复数        <- 存储的 posts.pecho 只是"下一个回复号 rid 的发号器"
//   uartcles (user)  = 该用户未隐藏的文章数
// 返回的字段名保持不变，前端不用改。
//
// 为什么：存储列同时被当作"发号器"和"数量"，发号器一旦被推高（比如之前的死循环），或删除过内容，
// 显示的数量、分页就都是错的。实时数出来的数量不会漂移，也不依赖任何人记得去同步计数。

const REPLY_COUNT = '(select count(*) from reply r where r.r_tid = posts.p_tid and r.r_pid = posts.pid and r.rhidden = 0)';
const USER_ARTICLE_COUNT = '(select count(*) from posts up where up.p_uid = user.uid and up.phidden = 0)';
const THEME_ARTICLE_COUNT = '(select count(*) from posts tp where tp.p_tid = theme.tid and tp.phidden = 0)';

module.exports = {
    // 个人主页的文章列表  参数: [phidden, uid, start, limit]
    MY_INDEX:
        'select pid,p_tid,p_uid,pname,' + REPLY_COUNT + ' as pecho,pcreatetime,purl,tlogo,tname,turl,uname,uurl,ulogo,utxt,' +
        USER_ARTICLE_COUNT + ' as uartcles from posts ' +
        'left join theme on posts.p_tid = theme.tid ' +
        'left join user on posts.p_uid = user.uid ' +
        'where phidden=? and p_uid=? order by pcreatetime DESC limit ?,?',

    // 文章内容  参数: [phidden, tid, pid]
    ARTICLE:
        'select pid,pname,pcreatetime,pcentent,' + REPLY_COUNT + ' as pecho,prefer,p_tid,tname,turl,p_uid,uname,uurl,ulogo,utxt,' +
        USER_ARTICLE_COUNT + ' as uartcles from posts ' +
        'left join theme on posts.p_tid = theme.tid ' +
        'left join user on posts.p_uid = user.uid ' +
        'where phidden=? and p_tid=? and pid=?',

    // 主题名称和文章数量  参数: [tid]
    THEME_NAME: 'select tname,' + THEME_ARTICLE_COUNT + ' as t_pnum from theme where tid = ?',

    // 指定主题的文章列表  参数: [phidden, tid, start, limit]
    ARTICLE_LIST:
        'select pid,p_tid,p_uid,pname,' + REPLY_COUNT + ' as pecho,pcreatetime,purl,uname,ulogo,uurl,tname from posts ' +
        'left join user on posts.p_uid = user.uid ' +
        'left join theme on posts.p_tid = theme.tid ' +
        'where phidden=? and p_tid=? order by pcreatetime DESC limit ?,?',

    // 最新文章总数（算分页用）  参数: [phidden]
    NEW_ARTICLES_COUNT: 'select count(*) as n from posts where phidden=?',

    // 最新文章列表  参数: [phidden, start, limit]
    NEW_ARTICLES:
        'select pid,p_tid,p_uid,pname,' + REPLY_COUNT + ' as pecho,pcreatetime,purl,tlogo,tname,uname,turl,uurl from posts ' +
        'left join theme on posts.p_tid = theme.tid ' +
        'left join user on posts.p_uid = user.uid ' +
        'where phidden=? order by pcreatetime DESC limit ?,?',

    // 主题列表  参数: [start, limit]
    THEME_LIST:
        'select tid,tname,tlogo,' + THEME_ARTICLE_COUNT + ' as t_pnum,turl from theme order by tid DESC limit ?,?'
};
