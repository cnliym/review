/**
 * Created with JetBrains PhpStorm.
 * User:
 * Date: 12-11-25
 * Time: ����4:40
 * To change this template use File | Settings | File Templates.
 */
KISSY.add("market/ioproxy", function (S) {
    /**
     * IO���������࣬��Ҫ���̳в���д_do����
     * @param cfg
     * @return {IOProxy}
     * @constructor
     */
    function IOProxy(cfg) {
        /**
         * �ص�����
         * @type {Array}
         */
        this.cbArray = [];
    }

    S.augment(IOProxy, {
        constructor:IOProxy,
        /**
         * ���� http get ����, ��S.io.get���д���
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
         * ���� http post ����, ��S.io.post���д���
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
         * ���� http get ����dataTypeΪjson���ͣ���S.io.getJSON���д���
         * @param url
         * @param data
         * @param callback
         */
        getJSON:function (url, data, callback) {
            this._doArgs(arguments);
            S.io.getJSON(url, data, callback);
        },

        /**
         * ���� jsonp ���󣬶�S.io.jsonp���д���
         * @param url
         * @param data
         * @param callback
         */
        jsonp:function (url, data, callback) {
            this._doArgs(arguments);
            S.io.jsonp(url, data, callback);
        },
        /**
         * �մ���ֻ��S.io.upload��һ���װ���ӿڱ���һ��
         */
        upload:function (url, form, data, callback, dataType) {
            S.io.upload(url, form, data, callback, dataType);
        },
        /**
         * �մ���ֻ��S.io.serialize��һ���װ���ӿڱ���һ��
         */
        serialize:function (elements) {
            S.io.serialize(elements);
        },
        /**
         * Ϊ���е� ajax ����(����δ��)�趨Ĭ�����ã���S.io.setupConfig���д���
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
         * ��io����������������data��ʡ�Դ���callback������
         * @param args
         * @return {*}
         * @private
         */
        _doArgs:function (args) {
            var me = this;
            /**
             * args[0] �ǵڶ������� url
             * args[1] �ǵڶ������� data
             * args[2] �ǵ��������� callback
             * args[3] �ǵ��ĸ����� dataType
             * data ������ʡ��
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
         * �ص�����
         * @param realCb ��ʵ�Ļص�����
         * @return {Function}
         * @private
         */
        _proxySuccess:function (realCb) {
            var me = this;
            return function (data) {
                /**
                 * ��˳��ִ��realCb
                 */
                me._do(realCb, data);
            }
        },
        _proxyError:function (realErr, realCb) {
            var me = this;
            return function () {
                /**
                 * ���ɹ��ص��Ƴ�����
                 */
                me._remove(realCb);
                S.isFunction(realErr) && realErr();
            }
        },
        /**
         * ɾ�������е�callback
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
         * ִ�лص�callback
         * @param callback
         * @param data
         * @private
         */
        _do:function (callback, data) {
            //���󷽷����ȴ�����д
        }
    });

    return IOProxy;
});
