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
            var nodeContent = node.textContent.trim(),
                reg = /\{\{(.*?)\}\}/,
                isTextNode = nodeContent.match(reg);

            if (this.isElementNode(node)) { // 当子节点为元素节点
                this._compileElementNode(node);
            } else if (this.isTextNode(node) && isTextNode) { // 当子节点为文本节点
                this._compileTextNode(node, isTextNode[1]);
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

                Directive[dir] && Directive[dir](node, this._vm, dir, exp, extra);

                // 移除指令属性
                node.removeAttribute(attrName);
            }
        }, this);
    },
    _compileTextNode: function (node, exp) {
        Directive.textNode(node, this._vm, exp);
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
    _bind: function (node, vm, dir, exp) {
        var updateFn = this._updates[dir];
        updateFn && updateFn(node, this._getVmValue(vm ,exp));
        new Watcher(vm, exp, function (value) {
            updateFn && updateFn(node, value);
        });
    },
    html: function (node, vm, exp) {
        this._bind(node, vm, "html", exp);
    },
    text: function (node, vm, exp) {
        this._bind(node, vm, "nodeText", exp);
    },
    textNode: function (node, vm, exp) {
        this._bind(node, vm, "nodeText", exp);
    },
    model: function (node, vm, dir, exp) {
        this._bind(node, vm, dir, exp);

        var oldVal = this._getVmValue(vm, exp),
            self = this;
        node.addEventListener("input", function () {
            var value = this.value;
            if(value === oldVal) return;
            self._setVmValue(vm, exp, value);
        })
    },
    on: function (node, vm, dir, exp, extra) {
        var eventFn = vm.$options.methods && vm.$options.methods[exp];
        if (extra && eventFn) {
            node.addEventListener(extra, eventFn.bind(vm), false);
        }
    },
    _getVmValue: function (vm, exp) {
        var data = vm.$data;
        exp.split(".").forEach(function (k) {
            data = data[k];
        });
        return data;
    },
    _setVmValue: function (vm, exp, value) {
        var data = vm.$data,
            keys = exp.split(".");
        keys.forEach(function (k, i) {
            if(i < keys.length - 1){
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
            node.value = typeof value === "undefined" ? "" : value;
        },
        html: function (node, value) {
            node.innerHTML = typeof value === "undefined" ? "" : value;
        }
    }
};