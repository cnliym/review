KISSY.add('valid/base', function(S, Field, GlobalEvent){

  var $ = S.all;

  var config = {
    event : 'blur'
  };

  function Validation(form, cfg){
    S.mix(cfg, config);
    this.config = cfg;
    this.base = $(form);
    if (!this.base.length) return;
    this.init;
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
        var valid = el.attr('data-valid');
        if (valid) {
          var id = S.guid();
          fields[id] = self.add(el, id, S.JSON.parse(valid));
        }
      });

      this.fields = fields;
    },

    add: function(el, id, rules){
      var field = new Field(el, id, rules);
      var fields = this.fields;
      if (!fields[id]) fields[id] = field;
      return field;
    },

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
