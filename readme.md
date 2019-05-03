# 文档 
s-mobx 是一个乞丐版的 mobx, 为了实现下 observe 和 autorun，记录思路过程

## 目标

```
observe(obj);
let fn = function() { console.log(obj.a); };
autorun(fn);
```

当执行 `obj.a = 1` 的时候，控制台自动打印 1   
fn 函数体中只要用到 `obj[key]` , 对 `obj[key]` 执行赋值操作时(`obj[key] = value`)就会自动执行 fn

## 实现

1. autorun 函数中先执行 fn，执行到 obj.a，触发 obj.a 的 getter 钩子
2. 在 obj.a 的 getter 钩子中收集依赖，用一个数组存放所有依赖了 obj.a 的函数
3. 在 obj.a 的 setter 钩子中遍历执行所有依赖 obj.a 的函数

## 代码

```
// 临时收集器
// 用一个全局变量 TempCollection.target 保存正在被收集的 fn 
const TempCollection = {
    target: null
}

function autorun(fn) {
    TempCollection.target = fn;    // 先把 fn 交给临时收集器
    fn();                          // 执行 fn() 时会执行到 obj.a 触发 getter 钩子，在钩子中从临时收集器(TempCollection.target)中收集到 fn
    TempCollection.target = null;  // 释放 TempCollection.target
}

// observe 函数实现 obj.a 的 getter 和 setter 钩子
function observe(obj, key, value) {
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
```

用测试代码测试一下

```
const { autorun, observe } = require('../lib/mobx');

let value = 10;
const obj = { a: value };

observe(obj, 'a', value);
autorun(() => console.log(obj.a));

obj.a = 1;
obj.a = 2;
```

执行 `obj.a = 1; obj.a = 2;`，会自动执行 `() => console.log(obj.a)` 函数，控制台打印 1 2

打个 tag, `git tag v0.1`
