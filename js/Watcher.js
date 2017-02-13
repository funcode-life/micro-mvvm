/**
 * Created by Jay-W on 2017/2/12.
 */

function Watcher(vm, exp, updater) {
    this.vm = vm;
    this.exp = exp;
    this.updater = updater;
    this.value = this._getVmValue();
}

Watcher.prototype = {
    addDep: function (dep) {
        // 调用传递过来的 Dep 实例方法，将 watch 自身添加到依赖中
        if(dep.deps.indexOf(this) === -1){
            dep.addDep(this);
        }
    },
    update: function () {
        var oldValue = this.value;
        var value = this._getVmValue();
        if(oldValue === value) return;
        this.updater && this.updater.call(this.vm, this._getVmValue());
        this.value = value;
    },
    _getVmValue: function () {
        // 通过主动调用 getter 方法来将自身添加到 Dep
        Dep.target = this;
        var val = this.vm.$data;
        this.exp.split(".").forEach(function (key) {
            val = val[key];
        });
        Dep.target = null;
        return val;
    }
};