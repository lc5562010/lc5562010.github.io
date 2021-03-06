var uid = 0;
class Dep {
  constructor() {
    this.id = uid++;
    this.subs = [];
  }

  static targetWatcher = null

  addSub(tWatcher) {
    this.subs.push(tWatcher);
  }
  depend() {
    Dep.targetWatcher.addDep(this);
  }
  notify(name, ...args) {
    this.subs.forEach(function(tWatcher) {
      tWatcher.update();
    });
  }
}


/* 观察数据 更新视图*/
class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm
    this.key = key
    Dep.targetWatcher = this
// console.log(Dep.targetWatcher);

    // Dep.target = this;
    // var value = this.getter.call(this.vm, this.vm);
    // Dep.target = null;
  }

  update() {
    console.log(this.key+'变化');
  }
}

/* 
  实现观察者模式，数据劫持通过 defineProperty
*/
class Mvvm {
  constructor(options) {
    this.$options = options;
    this.$data = options.data;
    this.observer(this.$data);
    new Watcher(this, 'a')
    this.a
  }

  proxyData(key) {
    //代理访问 this 对象下的data的值 访问实例的属性==this.$data值
    Object.defineProperty(this, key, {
      get: function() {
        return this.$data[key];
      },
      set: function(newVal) {
        this.$data[key] = newVal;
      }
    });
  }

  /* 数据劫持 */
  observer(data) {
    if (
      (data !== null && typeof data !== "object") ||
      Object.prototype.toString(data) !== "[object Object]"
    )
      return;
    // 取出所有属性遍历
    Object.keys(data).forEach(key => {
      // console.log(data, key, data[key]);
      this.defineReactive(data, key, data[key]);
      this.proxyData(key)
    });
  }
  defineReactive(data, key, value) {
    var dep = new Dep();
    /* 通过observer可以劫持到数据， 接下来目的是如何解决数据与视图同步的问题， 使用发布订阅模式，  */
    this.observer(value); // 监听子属性，如果子属性是对象对跳过判断进行递归
    Object.defineProperty(data, key, {
      // writable: false,
      enumerable: true, // 可枚举
      configurable: false, // 不能再define
      get: function() {
        Dep.targetWatcher && dep.addSub(Dep.targetWatcher)
        // dep.targetWatcher && dep.depend(Dep.targetWatcher)
        console.log("getter监听值变化：%s", value);
        return value;
      },
      set: function(newVal) {
        if (value !== newVal) {
          console.log("setter监听值变化---旧值：%s => 新值：%s", value, newVal);
          dep.notify()
          value = newVal;
        }
      }
    });
  }

}
