/**
 * Created by Jay-W on 2017/2/12.
 */

function Watcher(vm, exp, updater) {
    this.vm = vm;
    this.exp = exp;
    this.updater = updater;

    // 通过主动调用 getter 方法来将自身添加到 Dep
    Dep.target = this;
    this.value = this.getExpValue();
    Dep.target = null;
}

Watcher.prototype = {
    addDep: function (dep) {
        // 调用传递过来的 Dep 实例方法，将 watch 自身添加到依赖中
        // if(dep.deps.indexOf(this) === -1){
            dep.addDep(this);
        // }
    },
    update: function () {
        var oldValue = this.value;
        var value = this.getExpValue();
        if(oldValue === value) return;
        this.updater && this.updater.call(this.vm, value, oldValue);
        this.value = value;
    },
    getExpValue: function () {
        var val = this.vm.$data;
        this.exp.split(".").forEach(function (key) {
            if (typeof val[key] === 'function') {
                val = val[key]()
            } else if (key.lastIndexOf('()') !== -1) {
                val = eval('val.' + key);
            } else {
                val = val[key];
            }
        });
        return val;
    }
};