KISSY.add('valid/stdclass', function(S){
  /**
   * StdClass include method get,set and init
   * abstruct class
   * @class StdClass
   * @author hanwen
   * [+] 2011-12-1
   * 修改set方法，增加change:xxx:xxx时间，对应与某个属性值的变化
   * [+] set方法增加force强制不触发事件的配置
   */
  var EventTarget = S.EventTarget;
  var StdClass = function(){
    this.init.apply(this, arguments);
  };
  //如果使用extend方法，会有问题
  S.augment(StdClass, EventTarget, {

    //属性集合，在每个子对象中，相对独立
    attributes : {},

    //共有属性集合
    CONSIT : {
    },

    //node集合
    nodes : {
    },

    /**
     * 对于attributes下的都进行触发事件，其他对象的修改，不触发事件，除非
     * 强制设置force为true
     * @param force {Bool}
     */
    set: function(key, value, force) {

      var type   = this.getType(key);
      var old    = this[type][key];
      var isFire = false;

      //设置value
      if (type === 'nodes'){
        this._setNode(key, value);
      } else{
        this[type][key] = value;
      }

      //判断时候触发事件
      if (type === 'attributes'){
        if (value != old || force === true) isFire = true;
      } else {
        if (force) isFire = 1;
      }

      //触发事件
      if (isFire && force !== false){

        this.fire('change:' + key, { old: old, now: value });
        isFire === true && this.fire('change:' + key + ':'+value, 
          { old: old, now: value} );

      }

      return this;
    },

    //判断属性对象的类型
    //node | attr | consit
    //依次从attributes>nodes>CONSIT中查找
    getType: function(key){

      var o = {
        attributes : this.attributes, 
        nodes      : this.nodes, 
        CONSIT     : this.CONSIT
      };
      var ret = false;

      S.each(o, function(obj, type){

        if (ret) return;
        if ( key in obj) ret = type;

      });

      return ret;

    },

    /**
     * 获取属性，如果属性位于nodes中，在第一次获取对象时，如果不是Node
     * 则使用S.all获取之，并且返回获得的node
     * @param {String} key
     */
    get: function(key){ 
      var type = this.getType(key);
      var ret  = this[type][key];

      //对于node集合，如果是string，则设置node
      if (type === 'nodes' && S.isString(ret)) {
        ret = this._setNode(key);
      } 

      return ret;
    },

    _setNode: function(key, value){

      var node;

      //如果已经是node
      if (value instanceof S.Node){

        node = value;

      } else {

        var seletor = this.nodes[key];

        if (key === 'base'){
          node = S.one(seletor);
        } else {
          node = S.all(seletor, this.get('base'));
        }
      }

      //如果node对象的length为空，不进行设值，保留以便手
      //动设置,对于动态创建的node对象，刚开始的时候是没有
      //dom对象的
      if (node.length > 0){
        this.nodes[key] = node;
      } 

      return node;

    },

    init: function(cfg){

      //建立相对独立的attributes属性表
      this.attributes = S.clone(this.attributes);
      this.nodes       = S.clone(this.nodes);

      //对于attributes进行配置，在cfg中过滤到nodes中存在的元素
      S.each(cfg, function(val, key){
        if (key in this.nodes){
          this.nodes[key] = val;
        } else {
          this.attributes[key] = val;
        }
      }, this);

      var base = this._setNode('base');

      //如果base对象为空，模板不再运行
      if (!base){
        S.error( this.prototype.constructor.toString() +
          'base对象不能为空');
        return ;
      }

      this._init && this._init();
    },

    //事件执行一次
    once: function(event, fn, context){

      context = context || this;

      function __fn(e){
        fn.call(context, e);
        this.detach(event, __fn);
      }

      this.on(event, __fn, context);
    }

  });

  return StdClass;
});
