// 临时收集器
// 用一个全局变量 TempCollection.target 保存正在被收集的 fn
const TempCollection = {
    target: null
};

function autorun(fn) {
    TempCollection.target = fn;    // 先把 fn 交给临时收集器
    fn();                          // 执行 fn() 时会执行到 obj.a 触发 getter 钩子，在钩子中从临时收集器(TempCollection.target)中收集到 fn
    TempCollection.target = null;  // 释放 TempCollection.target
}

function observe(obj) {
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        observeKey(obj, key, value);
    });
}

function observeKey(obj, key, value) {
    const dependency = [];  // 存放依赖了该 key 的 fn
    Object.defineProperty(obj, key, {
        get() {
            if (TempCollection.target && dependency.indexOf(TempCollection.target === -1)) {
                // 如果是 autorun 中的 fn 执行了 obj.a 触发了 getter，TempCollection.target 中就会存储这改 fn，将 fn 收集进 dependency
                dependency.push(TempCollection.target);
            }
            return value;
        },
        set(newVal) {
            // 执行 obj.a = xxx 操作时触发 setter，遍历执行依赖了 obj.a 的 fn
            value = newVal;
            dependency.forEach((dep) => {
                dep();
            });
        }
    });
}

module.exports = {
    autorun,
    observe
};
