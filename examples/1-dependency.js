const { autorun, observe } = require('../lib/mobx');

let value = 10;
const obj = { a: value };

observe(obj, 'a', value);
autorun(() => console.log(obj.a));

obj.a = 1;
obj.a = 2;
