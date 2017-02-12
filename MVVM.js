/**
 * Created by Jay-W on 2017/2/12.
 */

function MVVM(options) {
    this.$options = options;
    this._data = options.data;

    new Observer(this._data || {});

    new Compiler(this.$options.el || document.body, this);
}