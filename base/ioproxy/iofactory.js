/**
 * Created with JetBrains PhpStorm.
 * User:
 * Date: 12-11-25
 * Time: 下午5:30
 * To change this template use File | Settings | File Templates.
 */
KISSY.add('market/iofactory', function (S, IOQueue, IOStack) {
    /**
     * IO工厂，创建IO代理实例
     * @type {*}
     */
    var IOFactory = function (type, cfg) {
        var method = IOFactory[type];
        return S.isFunction(method) ? method(cfg) : undefined;
    };
    /**
     * 创建IO队列实例
     * @param cfg
     * @return {*}
     */
    IOFactory.queue = function (cfg) {
        return new IOQueue(cfg);
    };
    /**
     * 创建IO栈实例
     * @param cfg
     * @return {*}
     */
    IOFactory.stack = function (cfg) {
        return new IOStack(cfg);
    };

    return IOFactory;

}, {requires:['market/ioqueue', 'market/iostack']});
