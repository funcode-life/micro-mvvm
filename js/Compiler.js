/**
 * Created by Jay-W on 2017/2/12.
 */

function Compiler(el, vm) {
    this._el = this.isElementNode(el) ? el : document.querySelector(el);
    this._vm = vm;

    // 开始编译模板
    var fragment = this.node2Fragment(this._el);
    this.compile(fragment);
    this._el.appendChild(fragment);
}

Compiler.prototype = {
    node2Fragment: function (el) {
        var fragment = document.createDocumentFragment();
        while (el.firstChild) fragment.appendChild(el.firstChild);
        return fragment;
    },
    compile: function (el) {
        [].slice.apply(el.childNodes).forEach(function (node) {
            // 此处处理逻辑
            // 文本节点进行数据绑定操作
            // 如果是元素节点，进行指令解析操作
            // 当子节点为元素节点
            if (this.isElementNode(node)) {
                this._compileElementNode(node);
            } else if (this.isTextNode(node)) { // 当子节点为文本节点
                this._compileTextNode(node);
            }

            // 当仍然存在子节点时，继续迭代
            if (node.childNodes && node.childNodes.length) {
                this.compile(node);
            }
        }, this);
    },
    _compileElementNode: function (node) {
        [].slice.apply(node.attributes).forEach(function (attr) {
            var attrName = attr.name,
                reg = /v-([^\:]+)\:?(.*)/,
                isDirective = attrName.match(reg);
            if (isDirective) {
                var dir = isDirective[1],
                    extra = isDirective[2],
                    exp = attr.value;

                Directive[dir] && Directive[dir](node, this._vm, exp, dir, extra);

                // 移除指令属性
                node.removeAttribute(attrName);
            }
        }, this);
    },
    _compileTextNode: function (node) {
        var nodeContent = node.textContent.trim(),
            reg = /\{\{(.*?)\}\}/,
            isTextNode = nodeContent.match(reg);
        if (isTextNode) {
            Directive.textNode(node, this._vm, isTextNode[1]);
        }
    },
    isElementNode: function (el) {
        return el.nodeType === 1;
    },
    isTextNode: function (el) {
        return el.nodeType === 3;
    }
};


// 指令集
var Directive = {
    _bind: function (node, vm, exp, dir) {
        var updateFn = this._updates[dir];
        updateFn && updateFn(node, this._getVmValue(vm, exp));
        new Watcher(vm, exp, function (value) {
            updateFn && updateFn(node, value);
        });
    },
    html: function (node, vm, exp) {
        this._bind(node, vm, exp, "innerHtml");
    },
    text: function (node, vm, exp) {
        this._bind(node, vm, exp, "innerText");
    },
    textNode: function (node, vm, exp) {
        this._bind(node, vm, exp, "nodeText");
    },
    model: function (node, vm, exp, dir) {
        this._bind(node, vm, exp, dir);

        var oldVal = this._getVmValue(vm, exp),
            self = this;
        node.addEventListener("input", function () {
            var value = this.value;
            if(value === oldVal) return;
            self._setVmValue(vm, exp, value);
        })
    },
    on: function (node, vm, exp, dir, extra) {
        var eventFn = vm.$options.methods && vm.$options.methods[exp];
        if (extra && eventFn) {
            node.addEventListener(extra, eventFn.bind(vm), false);
        }
    },
    _getVmValue: function (vm, exp) {
    	var val = vm.$data;
        exp.split(".").forEach(function (key) {
            if (typeof val[key] === 'function') {
                val = val[key]()
            } else if (key.lastIndexOf('()') !== -1) {
                val = eval('val.' + key);
            } else {
                val = val[key];
            }
        });
        return val;
    },
    _setVmValue: function (vm, exp, value) {
        var data = vm.$data,
            keys = exp.split("."),
            max = keys.length - 1;
        keys.forEach(function (k, i) {
            if(i < max && typeof data[k] !== 'function' && k.lastIndexOf('()') === -1){
                data = data[k];
            } else {
                data[k] = value;
            }
        });
    },

    // update 更新规则列表
    _updates: {
        nodeText: function (node, value) {
            node.textContent = typeof value === 'undefined' ? '' : value;
        },
        model: function (node, value) {
            if (value === node.value) return false;
            node.value = typeof value === "undefined" ? "" : value;
        },
        innerHtml: function (node, value) {
            node.innerHTML = typeof value === "undefined" ? "" : value;
        },
        innerText: function (node, value) {
            node.innerText = typeof value === 'undefined' ? '' : value;
        }
    }
};