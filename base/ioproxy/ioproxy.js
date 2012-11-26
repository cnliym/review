/**
 * Created with JetBrains PhpStorm.
 * User:
 * Date: 12-11-25
 * Time: 下午4:40
 * To change this template use File | Settings | File Templates.
 */
KISSY.add("market/ioproxy", function (S) {
    /**
     * IO代理，抽象类，需要被继承并重写_do方法
     * @param cfg
     * @return {IOProxy}
     * @constructor
     */
    function IOProxy(cfg) {
        /**
         * 回调数组
         * @type {Array}
         */
        this.cbArray = [];
    }

    S.augment(IOProxy, {
        constructor:IOProxy,
        /**
         * 发送 http get 请求, 对S.io.get进行代理
         * @param url
         * @param data
         * @param callback
         * @param dataType
         */
        get:function (url, data, callback, dataType) {
            this._doArgs(arguments);
            S.io.get(url, data, callback, dataType);
        },
        /**
         * 发送 http post 请求, 对S.io.post进行代理
         * @param url
         * @param data
         * @param callback
         * @param dataType
         */
        post:function (url, data, callback, dataType) {
            this._doArgs(arguments);
            S.io.post(url, data, callback, dataType);
        },

        /**
         * 发送 http get 请求，dataType为json类型，对S.io.getJSON进行代理
         * @param url
         * @param data
         * @param callback
         */
        getJSON:function (url, data, callback) {
            this._doArgs(arguments);
            S.io.getJSON(url, data, callback);
        },

        /**
         * 发送 jsonp 请求，对S.io.jsonp进行代理
         * @param url
         * @param data
         * @param callback
         */
        jsonp:function (url, data, callback) {
            this._doArgs(arguments);
            S.io.jsonp(url, data, callback);
        },
        /**
         * 空代理，只对S.io.upload做一层封装，接口保持一致
         */
        upload:function (url, form, data, callback, dataType) {
            S.io.upload(url, form, data, callback, dataType);
        },
        /**
         * 空代理，只对S.io.serialize做一层封装，接口保持一致
         */
        serialize:function (elements) {
            S.io.serialize(elements);
        },
        /**
         * 为所有的 ajax 请求(包括未来)设定默认配置，对S.io.setupConfig进行代理
         * @param cfg
         */
        setupConfig:function (cfg) {
            var me = this;
            if (S.isObject(cfg)) {
                me.cbArray.push(cfg.success);
                S.io.setupConfig(S.merge(cfg, {
                    "success":me._proxySuccess(cfg.success)
                }));
            }
        },
        /**
         * 对io方法参数处理，包括data可省略处理、callback代理处理
         * @param args
         * @return {*}
         * @private
         */
        _doArgs:function (args) {
            var me = this;
            /**
             * args[0] 是第二个参数 url
             * args[1] 是第二个参数 data
             * args[2] 是第三个参数 callback
             * args[3] 是第四个参数 dataType
             * data 参数可省略
             */
            if (S.isFunction(args[1])) {
                me.cbArray.push(args[1]);
                args[1] = me._proxySuccess(args[1]);
            } else {
                me.cbArray.push(args[2]);
                args[2] = me._proxySuccess(args[2]);
            }
            return args;
        },
        /**
         * 回调代理
         * @param realCb 真实的回调函数
         * @return {Function}
         * @private
         */
        _proxySuccess:function (realCb) {
            var me = this;
            return function (data) {
                /**
                 * 按顺序执行realCb
                 */
                me._do(realCb, data);
            }
        },
        _proxyError:function (realErr, realCb) {
            var me = this;
            return function () {
                /**
                 * 将成功回调移出数组
                 */
                me._remove(realCb);
                S.isFunction(realErr) && realErr();
            }
        },
        /**
         * 删除数组中的callback
         * @param callback
         * @private
         */
        _remove:function (callback) {
            var index = S.indexOf(callback, this.cbArray);
            if (index > -1) {
                this.cbArray.splice(index, 1);
            }
        },
        /**
         * 执行回调callback
         * @param callback
         * @param data
         * @private
         */
        _do:function (callback, data) {
            //抽象方法，等待被重写
        }
    });

    return IOProxy;
});
