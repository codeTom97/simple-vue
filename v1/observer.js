function Observer(data) {
  this.data = data;
  this.walk(data);
}

Observer.prototype = {
  walk: function(data) {
    let self = this;
    Object.keys(data).forEach(function(key) {
      self.defineReactive(data, key, data[key]);
    });
  },
  defineReactive: function(data, key, val) {
    let dep = new Dep();
    let childObj = observe(val);
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get: function getter() {
        if (Dep.target) {
          // 判断是否需要添加订阅者
          dep.addSub(Dep.target); // 在这里添加一个订阅者
        }
        return val;
      },
      set: function setter(newValue) {
        if (val === newValue) {
          return;
        }
        val = newValue;
        console.log(`属性${key}已经被监听了，现在值为：${newValue.toString()}`);
        dep.notify(); // 如果数据变化，通知所有订阅者
      }
    });
  }
};

// 数据监听器 Observe
function observe(data) {
  if (!data || typeof data !== "object") {
    return;
  }
  return new Observer(data);
}

// 订阅器Dep
function Dep() {
  this.subs = [];
}

Dep.prototype = {
  addSub: function(sub) {
    this.subs.push(sub);
  },
  notify: function() {
    this.subs.forEach(sub => {
      sub.update();
    });
  }
};

Dep.target = null; // 需要手动再清除一次
