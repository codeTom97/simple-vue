/**
 * 模板解析器
 */
function Compile(el, vm) {
  this.vm = vm;
  this.el = document.querySelector(el);
  this.fragment = null;
  this.init();
}

Compile.prototype = {
  init: function() {
    if (this.el) {
      this.fragment = this.nodeToFragment(this.el); // 创建内存Dom
      this.compileElement(this.fragment); // 处理并且绑定数据节点
      this.el.appendChild(this.fragment);
    } else {
      console.error("Dom元素查询不存在");
    }
  },
  nodeToFragment: function(el) {
    let fragment = document.createDocumentFragment(); // 创建一个内存节点
    let child = el.firstChild;
    // 遍历创建节点
    while (child) {
      fragment.appendChild(child);
      child = el.firstChild;
    }
    return fragment;
  },
  compileElement: function(el) {
    let childNodes = el.childNodes;
    let self = this;
    // 遍历标签内的数据节点
    [].slice.call(childNodes).forEach(function(node) {
      let reg = /\{\{\s*(.*?)\s*\}\}/;
      let text = node.textContent;
      if (self.isElementNode(node)) {
        self.compile(node);
      }
      // 判断是否符合{{}}类型
      else if (self.isTextNode(node) && reg.test(text)) {
        // 寻找匹配到的文本
        self.compileText(node, reg.exec(text)[1]);
      }
      if (node.childNodes && node.childNodes.length) {
        self.compileElement(node); // 继续遍历
      }
    });
  },
  compile: function(node) {
    let nodeAttrs = node.attributes;
    let self = this;
    Array.prototype.forEach.call(nodeAttrs, function(attr) {
      let attrName = attr.name;
      if (self.isDirective(attrName)) {
        let exp = attr.value; // 指令值
        let dir = attrName.substring(2); // 提取v-后的属性
        // 判断事件指令
        if (self.isEventDirective(dir)) {
          self.compileEvent(node, self.vm, exp, dir);
        } else {
          // v-model指令
          self.compileModel(node, self.vm, exp, dir);
        }
        node.removeAttribute(attrName); // 最后移除属性字段避免暴露
      }
    });
  },
  // 事件指令处理
  compileEvent: function(node, vm, exp, dir) {
    let eventType = dir.split(":")[1];
    let cb = vm.methods && vm.methods[exp];
    console.log(eventType, cb);
    if (eventType && cb) {
      node.addEventListener(eventType, cb.bind(vm), false);
    }
  },
  // VModel指令处理
  compileModel: function(node, vm, exp, dir) {
    let self = this;
    let val = this.vm[exp];
    this.modelUpdater(node, val); // 先更新值
    new Watcher(this.vm, exp, function(value) {
      self.modelUpdater(node, value);
    });
    // 监听input事件
    node.addEventListener("input", function(e) {
      let newValue = e.target.value;
      if (val === newValue) {
        return;
      }
      self.vm[exp] = newValue;
      val = newValue;
    });
  },
  // 文本处理
  compileText: function(node, exp) {
    let self = this;
    let initText = this.vm[exp];
    this.updateText(node, initText); // 将初始化的数据初始化到视图中
    new Watcher(this.vm, exp, function(value) {
      self.updateText(node, value);
    });
  },
  updateText: function(node, value) {
    node.textContent = value ? value : "";
  },
  modelUpdater: function(node, value) {
    node.value = value ? value : "";
  },
  // 判断v-开头的指令
  isDirective: function(attr) {
    return attr.indexOf("v-") === 0;
  },
  // 判断是否为操作指令
  isEventDirective: function(attr) {
    return attr.indexOf("on:") === 0;
  },
  // 判断Node是否为标签
  isElementNode: function(node) {
    return node.nodeType === 1;
  },
  // 判断Node是否为文本
  isTextNode: function(node) {
    return node.nodeType === 3;
  }
};
