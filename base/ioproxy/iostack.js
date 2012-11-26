/**
 * Created with JetBrains PhpStorm.
 * User: yuanquan
 * Date: 12-11-21
 * Time: ����9:31
 */
KISSY.add('market/iostack', function (S, IOProxy) {
    /**
     * IOջ��ջ���ص���FILO
     * IOStack�ľ���ջ�����ԣ������������ִ�лص�
     * @param cfg ������������ļ�ֵ�Զ���.���е�������ǿ�ѡ��,����ͨ������ setupConfig() ������Ĭ������
     * @constructor
     */
    function IOStack(cfg){
        var me = this;

        if (!(me instanceof IOStack)) {
            return new IOStack(cfg);
        }
        /**
         * �ص�ջ
         * @type {Array}
         */
        me.cbArray = [];

        if (S.isObject(cfg)) {
            /**
             * ���ص�����ѹ��ջ
             */
            me.cbArray.push(cfg.success);
            /**
             * ��ʹ�ù��췽��IOStack����IO����ʱ
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
    S.augment(IOStack, IOProxy, {
        constructor : IOStack,
        /**
         * ��˳��ִ��callback
         * @param callback
         * @param data
         * @private
         */
        _do:function (callback, data) {
            var me = this;
            /**
             * ջΪ��ʱֹͣ����ִ��
             */
            if (!me.cbArray.length)
                return;

            if (me.cbArray[me.cbArray.length-1] != callback) {
                /**
                 * ���callback������ջ���ˣ��͵���100����
                 */
                setTimeout(function () {
                    me._do(callback, data);
                }, 100);
            } else {
                if (S.isFunction(callback)) {
                    /**
                     * �����һ���ص�����false��ִֹͣ�������ص�����ջص�ջ
                     */
                    callback(data) === false && (me.cbArray = []);
                }
                /**
                 * ����ջ�׷���
                 */
                me.cbArray.pop();
            }
        }
    });
    return IOStack;
},{"requires":["market/ioproxy"]});
