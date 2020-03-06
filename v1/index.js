function SelfVue(options) {
  let self = this;
  this.vm = this;
  this.data = options.data;
  this.methods = options.methods;

  // 所有的data值都要经过代理这样就可以动态修改了
  Object.keys(this.data).forEach(key => {
    self.proxyKeys(key);
  });

  // 截取所有data数据
  observe(this.data);
  // 模板编译
  new Compile(options.el, this.vm);
  // 调用生命周期函数
  options.mounted.call(this);

  return this;
}

// 通过proxyKeys代理把this.data进行劫持
SelfVue.prototype = {
  proxyKeys: function(key) {
    let self = this;
    Object.defineProperty(this, key, {
      enumerable: false,
      configurable: true,
      get: function proxyGetter() {
        return self.data[key];
      },
      set: function proxySetter(newValue) {
        this.data[key] = newValue;
      }
    });
  }
};
