/**
 * Created by Jay-W on 2017/2/12.
 */

function MVVM(options) {
    this.$options = options;
    this.$data = options.data;

    new Observer(this.$data || {});

    new Compiler(this.$options.el || document.body, this);

    // 数据代理
    this.proxyData();
}

MVVM.prototype = {
    proxyData: function () {
        Object.keys(this.$data).forEach(function (key) {
            var self = this;
            Object.defineProperty(this, key, {
                enumerable: true,
                configurable: false,
                get: function () {
                    return self.$data[key];
                },
                set: function (value) {
                    self.$data[key] = value;
                }
            })
        }, this);
    },
    $watch: function (exp, updater) {
        new Watcher(this, exp, updater);
    }
};