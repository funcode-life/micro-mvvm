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
        var dep = new Dep();
        Object.defineProperty(this._data, key, {
            enumerable: true,
            configurable: false,
            get: function () {
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
    addDep: function (dep) {
        this.deps.push(dep);
    },
    notify: function () {
        this.deps.forEach(function (dep) {
            dep.update();
        })
    }
};