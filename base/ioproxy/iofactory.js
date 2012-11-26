/**
 * Created with JetBrains PhpStorm.
 * User:
 * Date: 12-11-25
 * Time: ����5:30
 * To change this template use File | Settings | File Templates.
 */
KISSY.add('market/iofactory', function (S, IOQueue, IOStack) {
    /**
     * IO����������IO����ʵ��
     * @type {*}
     */
    var IOFactory = function (type, cfg) {
        var method = IOFactory[type];
        return S.isFunction(method) ? method(cfg) : undefined;
    };
    /**
     * ����IO����ʵ��
     * @param cfg
     * @return {*}
     */
    IOFactory.queue = function (cfg) {
        return new IOQueue(cfg);
    };
    /**
     * ����IOջʵ��
     * @param cfg
     * @return {*}
     */
    IOFactory.stack = function (cfg) {
        return new IOStack(cfg);
    };

    return IOFactory;

}, {requires:['market/ioqueue', 'market/iostack']});
