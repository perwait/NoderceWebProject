// 简单的频率限制（单进程内存）：同一个 key 在 intervalMs 内只允许通过一次。
// 用来挡住"连点两下按钮 / 脚本狂刷"造成的重复提交。

const last = new Map();

// 允许通过返回 true，否则返回 false
function hit(key, intervalMs) {
    const now = Date.now();
    const prev = last.get(key);
    if (prev !== undefined && now - prev < intervalMs) {
        return false;
    }
    last.set(key, now);
    if (last.size > 5000) {
        // 清理很久以前的记录，防止 Map 无限增长
        last.forEach(function (time, k) {
            if (now - time > 60000) {
                last.delete(k);
            }
        });
    }
    return true;
}

// 操作失败时释放，允许用户马上重试
function clear(key) {
    last.delete(key);
}

module.exports = { hit: hit, clear: clear };
