const { autorun, observe } = require('../lib/mobx');

const obj = {
    a: 10,
    b: 100
};

observe(obj);

autorun(() => console.log(`a 的 autorun: ${obj.a}`));
autorun(() => console.log(`b 的 autorun: ${obj.b}`));

obj.a = 11;
obj.a = 12;

obj.b = 101;
obj.b = 102;
