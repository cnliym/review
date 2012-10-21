/**
 * Created by hanwen.sah@taobao.com.
 * Date: 2012-10-21
 * Time: 23:04
 * Desc: field 描述一个表单元素，每个元素都是独立的
 */
KISSY.add('valid/field', function(S, GlobalEvent, Rules){

  var $ = S.all;

  /**
   * Field主要负责错误信息提示，ui展示，约定，错误信息显示在给定的el后面创建一个
   * 节点，如果给定的el不是node对象，那么，取el对象的base属性。 Field校验是否通
   * 过，由el.val()方法返回值决定
   * @constructor
   * @param el {Node|Object} node对象或者自定义对象，对于自定义对象，需要自带val
   *    方法，和base属性，base属性为node对象
   * @param id {number} 用于识别Field对象的guid
   * @param rules {array} 规则，二维数组，和kissy的validation保持一致，[规则,
   * 提示]
   */
  function Field(el, id, rules) {
    this.el    = el;
    this.rules = rules;
    this.id    = id;
    this.init();
  }

  S.augment(Field, S.EventTarget, {

    constructor: Field,

    attributes: {
      el        : null,
      rules     : null,
      id        : null,
      showError : null,
      isNode    : null,
      errorTpl  : '<div class="message valid {status}">{message}</div>'
    },

    init: function(){

      var data = { status: 'start', message: '' };
      var html = S.substitute(this.errorTpl, data);
      var errEl = D.create(html);
      var el = this.el;

      if (this.el instanceof S.Node){
        this.isNode = true;
      } else {
        el = el.base;
        if (!el || !el.length) return;
      }

      el.after(errEl);
      el.attr('data-validId', this.id);

      this._bind();
    },

    _bind: function(){
      var checkEvent = 'valid:field:' + this.id;
      GlobalEvent.on(checkEvent, S.bind(this.isValid, this));
      this.on('valid:field', S.bind(this.isValid, this));

      var delEvent = 'valid:remove:' + this.id;
      GlobalEvent.on(delEvent, S.bind(this.remove, this));
    },

    remove: function () {
      var checkEvent = 'valid:field:' + this.id;
      GlobalEvent.detach(checkEvent);
      this.detach(checkEvent);
      var delEvent = 'valid:remove:' + this.id;
      GlobalEvent.detach(delEvent);
    },

    isValid: function(e){

      var rules = this.rules;
      var value = this.el.val();
      var o = {status: 'success', message: 'ok'};
      var uid = e.uid;

      S.each(rules, function(rule){
        var message = Rules[rule[0]].call(null, value, rule);
        if (message) {
          o = {status: 'error', message: message};
          return false;
        }
      });

      this.showInfo(o, e.uid);
      return o.status;
    },

    showInfo: function (o, uid) {
      var html = S.substitute(this.errorTpl);
      var errEl = $(this.errEl);
      errEl.html(html);

      GlobalEvent.fire('valid:end', {
        status: o.status,
        uid: uid,
        id: this.id
      });

    }

  });
}, {
  requires: ['valid/event', 'valid/rules']
});
