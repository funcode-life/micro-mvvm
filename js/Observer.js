/**
 * Created by Jay-W on 2017/2/12.
 */

function Observer(data) {
    this._data = data;
    this.covertData();
}

Observer.prototype = {
    covertData: function () {
        Object.keys(this._data).forEach(function (key) {
            this.defineReactive(key, this._data[key]);
        }, this);
    },
    defineReactive: function (key, value) {
        // 监听的是数据，依赖应该直接和数据关联，所以在这里生成依赖处理对象
        var dep = new Dep();

        // 继续监听子数据
        if(value && typeof value === "object") new Observer(value);

        // 改写 getter、setter
        Object.defineProperty(this._data, key, {
            enumerable: true,
            configurable: false,
            get: function () {
                if(Dep.target) {
                    dep.depend();
                }
                return value;
            },
            set: function (newVal) {
                if(newVal === value) return;
                value = newVal;
                dep.notify();
            }
        })
    }
};

function Dep() {
    this.deps = [];
}
Dep.prototype = {
    depend: function () {
        // 调用 Watch 方法，并将 Dep 实例传递过去
        Dep.target.addDep(this);
    },
    addDep: function (dep) {
        this.deps.push(dep);
    },
    notify: function () {
        // 当数据更新时，依次调用 watch 的 update 方法
        this.deps.forEach(function (dep) {
            dep.update();
        })
    }
};