// 数据库 查询 / 事务 封装。只包含逻辑，不依赖 mysql 包，传入连接池即可（方便单独测试）。
//
// 设计要点：
// 1. 事务内的任何一步失败都会 ROLLBACK，不会留下半条数据。
// 2. 只有"死锁 / 锁等待超时"这两类瞬时错误才会重试，最多 MAX_RETRY 次，并且带退避等待。
//    其它错误（数据过长、字符集、外键、断线……）都是确定性错误，重试没有意义，直接抛出。
// 3. 一个连接的整个事务过程中，连接始终被占用并最终释放（或在异常时销毁），不会泄漏。

const RETRYABLE = { ER_LOCK_DEADLOCK: true, ER_LOCK_WAIT_TIMEOUT: true };
const MAX_RETRY = 2;

module.exports = function makeDb(pool) {
    function run(target, sql, params) {
        return new Promise(function (resolve, reject) {
            target.query(sql, params || [], function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    function getConnection() {
        return new Promise(function (resolve, reject) {
            pool.getConnection(function (err, conn) {
                if (err) {
                    reject(err);
                } else {
                    resolve(conn);
                }
            });
        });
    }

    function sleep(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }

    // 普通查询，返回结果行（与原来 co-mysql 的用法保持一致）
    function query(sql, params) {
        return run(pool, sql, params);
    }

    // work(tx) 里用 tx.query(sql, params) 执行语句；work 正常结束则 COMMIT，抛出异常则 ROLLBACK
    async function transaction(work) {
        for (let attempt = 0; ; attempt++) {
            const conn = await getConnection();
            let broken = false;
            let retry = false;
            try {
                await run(conn, 'START TRANSACTION');
                const result = await work({
                    query: function (sql, params) { return run(conn, sql, params); }
                });
                await run(conn, 'COMMIT');
                return result;
            } catch (err) {
                try {
                    await run(conn, 'ROLLBACK');
                } catch (e) {
                    broken = true; // 连接已不可用，不能放回连接池
                }
                if (!(RETRYABLE[err && err.code] && attempt < MAX_RETRY)) {
                    throw err;
                }
                retry = true;
            } finally {
                if (broken) {
                    conn.destroy();
                } else {
                    conn.release();
                }
            }
            if (retry) {
                await sleep(50 * (attempt + 1) + Math.floor(Math.random() * 50));
            }
        }
    }

    return { query: query, transaction: transaction };
};
