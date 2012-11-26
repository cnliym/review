/**
 * Created with JetBrains PhpStorm.
 * User: yuanquan
 * Date: 12-11-21
 * Time: ����9:56
 */
KISSY.add('market/ioqueue', function (S, IOProxy) {

    /**
     * IO���У����е��ص���FIFO
     * IOQueue�ľ��ж��е����ԣ��ȷ�����������ִ�лص�
     * @param cfg ������������ļ�ֵ�Զ���.���е�������ǿ�ѡ��,����ͨ������ setupConfig() ������Ĭ������
     * @constructor
     */
    function IOQueue(cfg) {
        var me = this;

        if (!(me instanceof IOQueue)) {
            return new IOQueue(cfg);
        }
        /**
         * �ص�����
         * @type {Array}
         */
        me.cbArray = [];

        if (S.isObject(cfg)) {
            /**
             * ���ص�����ѹ�����
             */
            me.cbArray.push(cfg.success);
            /**
             * ��ʹ�ù��췽��IOQueue����IO����ʱ
             */
            S.io(S.merge(cfg, {
                /**
                 * �ɹ�ʱ��˳��ִ�лص�
                 * @param data
                 */
                success:me._proxySuccess(cfg.success),
                /**
                 * ������ʧ�ܻص�
                 */
                error:me._proxyError(cfg.error, cfg.success)

            }));
        }
    }

    /**
     * �̳г�����IOProxy������д_do
     */
    S.augment(IOQueue, IOProxy, {
        constructor : IOQueue,
        /**
         * ��˳��ִ��callback
         * @param callback
         * @param data
         * @private
         */
        _do:function (callback, data) {
            var me = this;
            /**
             * ����Ϊ��ʱֹͣ����ִ��
             */
            if (!me.cbArray.length)
                return;

            if (me.cbArray[0] != callback) {
                /**
                 * ���callback�����ڶ��ж��ˣ��͵���100����
                 */
                setTimeout(function () {
                    me._do(callback, data);
                }, 100);
            } else {
                if (S.isFunction(callback)) {
                    /**
                     * �����һ���ص�����false��ִֹͣ�������ص�����ջص�����
                     */
                    callback(data) === false && (me.cbArray = []);
                }
                /**
                 * �������׷���
                 */
                me.cbArray.shift();
            }
        }
    });
    return IOQueue;
},{"requires":["market/ioproxy"]});
