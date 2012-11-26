/**
 * Created with JetBrains PhpStorm.
 * User: yuanquan
 * Date: 12-11-21
 * Time: 下午9:31
 */
KISSY.add('market/iostack', function (S, IOProxy) {
    /**
     * IO栈，栈的特点是FILO
     * IOStack的具有栈的特性，后出的请求先执行回调
     * @param cfg 用来配置请求的键值对对象.所有的配置项都是可选的,可以通过方法 setupConfig() 来设置默认配置
     * @constructor
     */
    function IOStack(cfg){
        var me = this;

        if (!(me instanceof IOStack)) {
            return new IOStack(cfg);
        }
        /**
         * 回调栈
         * @type {Array}
         */
        me.cbArray = [];

        if (S.isObject(cfg)) {
            /**
             * 将回调方法压入栈
             */
            me.cbArray.push(cfg.success);
            /**
             * 当使用构造方法IOStack处理IO操作时
             */
            S.io(S.merge(cfg, {
                /**
                 * 成功时按顺序执行回调
                 * @param data
                 */
                success:me._proxySuccess(cfg.success),
                /**
                 * 请求发送失败回调
                 */
                error:me._proxyError(cfg.error, cfg.success)

            }));
        }
    }
    /**
     * 继承抽象类IOProxy，并重写_do
     */
    S.augment(IOStack, IOProxy, {
        constructor : IOStack,
        /**
         * 按顺序执行callback
         * @param callback
         * @param data
         * @private
         */
        _do:function (callback, data) {
            var me = this;
            /**
             * 栈为空时停止向下执行
             */
            if (!me.cbArray.length)
                return;

            if (me.cbArray[me.cbArray.length-1] != callback) {
                /**
                 * 如果callback还不在栈顶端，就等他100毫秒
                 */
                setTimeout(function () {
                    me._do(callback, data);
                }, 100);
            } else {
                if (S.isFunction(callback)) {
                    /**
                     * 如果第一个回调返回false，停止执行其他回调，清空回调栈
                     */
                    callback(data) === false && (me.cbArray = []);
                }
                /**
                 * 弹出栈底方法
                 */
                me.cbArray.pop();
            }
        }
    });
    return IOStack;
},{"requires":["market/ioproxy"]});
