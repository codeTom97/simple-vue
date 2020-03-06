// 监听器 Watcher
function Watcher(vm, exp, cb) {
  this.cb = cb;
  this.vm = vm;
  this.exp = exp;
  this.value = this.get(); // 讲自己添加到订阅器中
}

Watcher.prototype = {
  update: function() {
    this.run();
  },
  run: function() {
    let value = this.vm.data[this.exp];
    let oldValue = this.value;
    if (value !== oldValue) {
      this.value = value;
      this.cb.call(this.vm, value, oldValue);
    }
  },
  get: function() {
    Dep.target = this;
    let value = this.vm.data[this.exp];
    Dep.target = null;
    return value;
  }
};
