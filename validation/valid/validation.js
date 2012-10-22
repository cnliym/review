/**
 * Created by hanwen.sah@taobao.com.
 * Date: 2012-10-22
 * Time: 16:01
 * Desc: validation组件，实现方式基本源自kissy的validation，底层实现修改。校验
 * 的field扩展到任意dom节点(不需要是表单元素)，自定义val方法。此外，把校验触发
 * 事件扩展到自定义事件支持。
 * 考虑到校验的field需要有增加和删除，增加事件机制，实现校验对象和校验字段隔空
 * 对话。
 * 最后，这里未完善，无法真正实际应用。
 */
KISSY.add('valid/base', function(S, Field, GlobalEvent){

  var $ = S.all;

  var config = {
    event : 'blur'
  };

  /**
   * @constructor
   * @param form {string|Node} 表单对象
   * @param cfg {object} 属性配置
   */
  function Validation(form, cfg){
    S.mix(cfg, config);
    this.config = cfg;
    this.base = $(form);
    if (!this.base.length) return;
    this.init();
  }

  S.augment(Validation, S.EventTarget, {

    init: function(){
      this._bind();
      this._init();
    },

    _init: function(){
      var nodes = this.base[0];
      var fields = {};
      var self = this;

      S.each(nodes, function(el){
        el = $(el);
        //通过data-valid配置，保持和kissy的validation一致
        var valid = el.attr('data-valid');

        if (valid) {
          var id = S.guid();
          fields[id] = self.add(el, id, S.JSON.parse(valid));
        }

      });

      this.fields = fields;
    },

    /**
     * 增加一个校验对象，参数和Field对象构造器保持一致
     */
    add: function(el, id, rules){
      var field = new Field(el, id, rules);
      var fields = this.fields;
      if (!fields[id]) fields[id] = field;
      return field;
    },

    /**
     * 删除一条校验规则
     * @param id {number} Field对应的id
     */
    remove: function(id){
      var field = this.fields[id];
      if (field) {
        field.remove();
        delete this.fields[id];
      }
    },

    _bind: function(){

      var self = this;

      this.base.on('submit', function(e){ 
        self.checkAll();
        e.halt(); 
      });

      self.finished = {};

      GlobalEvent.on('valid:end', function(e){

        if (e.status !== 'success') {
          self.finished[uid] = false;
          return;
        }

        if (self.finished[e.uid] !== false) {
          self.finished[e.uid] = self.finished[e.uid] || {};
          self.finished[e.uid][e.id] = true;
          self.check(uid);
        }
      });

      /**
       * 通过事件方式增加一组校验规则
       */
      GlobalEvent.on('valid:add', function(e){
        self.add(e.el, e.id, e.rules);
      });
    },

    check: function(uid){
      var isAllPass = true;
      var finished = this.finished[uid];

      S.each(this.fields, function(field, id){
        if (!finished[id]) {
          isAllPass = false;
          return false;
        }
      });

      //success
      if (isAllPass) {
        this.base.submit();
      }
    },

    /**
     * 执行校验，validation把指令发给Field，由Field完成校验，Field完成后，发布
     * 成功事件'valid:end'，当所有的Field都返回了valid:end success，则校验通过，
     * 这里使用事件，考虑到，中间可能会有异步校验等等，非同步过程
     */
    checkAll: function(){
      var guid = S.guid();
      S.each(this.fields, function(field){
        field.fire('valid:field', {uid: guid});
      });
    }

  });

}, {
  requires: ['valid/field', 'valid/event']
});
