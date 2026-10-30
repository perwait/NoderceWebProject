// 创建文章 / 回复 的数据库操作。
//
// 与旧实现的区别：
// 1. 一个事务内完成"读计数 -> 插入 -> 更新计数"，全部成功才提交，任何一步失败整体回滚，不会再出现
//    "计数涨了但文章没写进去"或"文章写了但计数没更新"。
// 2. 不再重试。pid / rid 在持有行锁的事务里计算，不会冲突，也就不需要靠"失败了就 +1 再来一遍"来碰运气。
// 3. 全部 await，写库成功之后路由才返回成功。
// 4. 加锁顺序固定为 user -> theme（或 posts），避免同一用户并发操作时互相死锁。

const AppError = require('./validate').AppError;

// 创建文章，返回 { pid, user }
async function createArticle(db, uid, input) {
    return db.transaction(async function (tx) {
        const users = await tx.query(
            'select uid,uname,uurl,ulogo,uartcles,utxt from user where uid = ? for update', [uid]);
        if (users.length !== 1) {
            throw new AppError(401, '用户不存在，请重新登录');
        }
        const themes = await tx.query('select t_pnum from theme where tid = ? for update', [input.tid]);
        if (themes.length !== 1) {
            throw new AppError(404, '类目不存在');
        }
        // 取"计数"和"现有最大 pid"中较大的那个再 +1，保证一定不与已有文章冲突
        const max = await tx.query('select coalesce(max(pid),0) as m from posts where p_tid = ?', [input.tid]);
        const pid = Math.max(Number(themes[0].t_pnum) || 0, Number(max[0].m) || 0) + 1;

        await tx.query(
            'INSERT INTO posts (pid,pname,pcentent,p_tid,p_uid,prefer,pcreatetime) values (?,?,?,?,?,?,?)',
            [pid, input.title, input.content, input.tid, uid, input.refer, Date.now()]);
        await tx.query('update theme set t_pnum = ? where tid = ?', [pid, input.tid]);
        await tx.query('update user set uartcles = uartcles + 1 where uid = ?', [uid]);

        const user = users[0];
        user.uartcles = (Number(user.uartcles) || 0) + 1;
        return { pid: pid, user: user };
    });
}

// 回复文章，返回 { rid }
async function createReply(db, uid, input) {
    return db.transaction(async function (tx) {
        const posts = await tx.query(
            'select pecho from posts where pid = ? and p_tid = ? and phidden = 0 for update', [input.pid, input.tid]);
        if (posts.length !== 1) {
            throw new AppError(404, '文章不存在');
        }
        const max = await tx.query(
            'select coalesce(max(rid),0) as m from reply where r_pid = ? and r_tid = ?', [input.pid, input.tid]);
        const rid = Math.max(Number(posts[0].pecho) || 0, Number(max[0].m) || 0) + 1;

        await tx.query(
            'insert into reply (rid,rcontent,rcreatetime,r_tid,r_pid,r_uid) values (?,?,?,?,?,?)',
            [rid, input.content, Date.now(), input.tid, input.pid, uid]);
        await tx.query('update posts set pecho = ? where p_tid = ? and pid = ?', [rid, input.tid, input.pid]);
        return { rid: rid };
    });
}

module.exports = { createArticle: createArticle, createReply: createReply };
