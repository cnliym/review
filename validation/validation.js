KISSY.add('validation', function(S){
	var $ = S.all;
	
	function Validation(form, conf){
		
		if(!(this.form = S.one(form))){
			return;
		}
		this.config = S.merge(conf);
		
		this.resultCache = {};
		
		this.init();
	}
	Validation.regexp = {
		"url" : /[a-zA-z]+:\/\/[^s]*/,
		"email" : /w+([-+.]w+)*@w+([-.]w+)*.w+([-.]w+)*/
	}
	/**
	* 验证策略
	*/
	Validation.strategy = {
		"required" : function(value, rule){
			return (rule['value'] && value === "") ? {"code":0,"message":rule['message']} : {"code":1,"message":"OK"};
		},
		"url" : function(value, rule){
			return (value !== "" && rule['value'] && !Validation.regexp["url"].test(value)) ? {"code":0,"message":rule['message']} : {"code":1,"message":"OK"};
		},
		"email" : function(value, rule){
			return (value !== "" && rule['value'] && !Validation.regexp["email"].test(value)) ? {"code":0,"message":rule['message']} : {"code":1,"message":"OK"};
		}
	}
	
	S.augment(Validation, {
		init : function(){
			new View(this.form, this.config);	
			this.bind();
		},
		bind : function(){
			var me = this;
			S.EventTarget.on("validate:field", function(e){
				var id = e.id;
				me.checkOne(id);
			});
			S.EventTarget.on("validate:form", function(e){
				me.validate();
			});
		},
		/**
		* return {"code":0,"message":"ooxx"}
		*/
		getResult : function(id){
			var me = this;
			var result = {}, value = $('#'+id).val();
			S.each(me.config[id], function(rule, ruleName){
				var method = me.getStrategy(ruleName);
				result = method(value, rule);
				if(result['code'] == 0){
					return false;
				}
			});
			return result;
		},
		getStrategy : function(rule){
			return Validation.strategy[rule];
		},
		addStrategy : function(funcName, func){
			Validation.strategy[funcName] = func;
		},
		addRule : function(id, rule){
			this.config[id] = S.merge(this.config[id], rule);
		},
		removeRule : function(id, ruleName){
			if(!this.config[id]) return;
			
			if(ruleName){
				delete this.config[id][ruleName];
			}else{
				delete this.config[id];
			}
		},
		getRule : function(id){
			return this.config[id];
		},
		/*
		*验证功能单条
		*/
		checkOne : function(id){
			var result = this.getResult(id);
			//写进config
			this.pushResultCache(id, result);
			this._fireResult(id, result);
		},
		/*
		*表单验证
		*/
		validate : function(){
			var me = this;
			S.each(me.config, function(rule, id){
				var result = me.resultCache[id];
				if(result){
					//校验过
					me._fireResult(id, result);
				}else{
					//没校验过
					me.checkOne(id);
				}				
			});
		},
		pushResultCache : function(id, result){
			this.resultCache[id] = result;
		},
		_fireResult : function(id, result){
			if(result.code === 0){
				S.EventTarget.fire("validate:error",{"id":id, "message":result.message});
			}else if(result.code === 1){
				S.EventTarget.fire("validate:success",{"id":id, "message":"OK"});
			}
		}
	});
	
	
	/**
	* 视图层
	*/
	function View(form, conf){
		this.form = form;
		this.config = conf;
	
		this.init();
	}
	/**
	* 事件策略
	*/
	View.EVENT = {
		"blurBind" : function(id){
			$("#"+id).on('blur', function(e){
				var target = $(e.target);
				S.EventTarget.fire("validate:field",{"id":id, "value":target.val()});
			});
		},
		"changeBind" : function(id){},
		"focusBind"  : function(id){},
		"checkBind"  : function(id){},
		"focusBind"  : function(id){
			$("#"+id).on('focus', function(e){
				S.EventTarget.fire("validate:focus",{"id":id});
			});
		},
		"submitBind" : function(form){
			S.EventTarget.fire("validate:form",{"form":form});
		}
	};
	S.augment(View, {
		init : function(){
			this.bind();
		},
		bind : function(){
			var me = this;
			S.each(me.config, function(rule, id){
				switch(S.all('#'+id)[0].tagName){
					case "INPUT":
					case "TEXTAREA":
						View.EVENT["blurBind"](id);
						View.EVENT["focusBind"](id);
						break;
					case "SELECT":
						View.EVENT["changeBind"](id);
						break;
					case "RADIO":
					case "CHECKBOX":
						View.EVENT["checkBind"](id);
						break;
				}
				
				View.EVENT["submitBind"](me.form);
			});
			
			S.EventTarget.on("validate:focus", function(e){
				var id = e.id;
				me.clearError(id);
			});
			
			S.EventTarget.on("validate:error", function(e){
				var id = e.id;
				var message = e.message;
				me.showError(id, message);
			});
			
			S.EventTarget.on("validate:success", function(e){
				var id = e.id;
				//me.clearError(id);
			});
		},
		showError : function(id, message){
			console.log("showError: "+id+ " , " +message)
		},
		getError : function(id){
			console.log("getError: "+id)
		},
		clearError : function(id){
			console.log("clearError: "+id)
		}
	});
	
	return Validation;
});


/*
{
	"username":{
		"value":123,
		"result":{
			"code":0,
			"message":"ooxx"
		}
	}
}
{
	"username":{ //username位表单项ID
		"required":{
			"value":true,
			"message":"用户名不能为空"
		},
		"minLength":{
			"value":"6",
			"message":"用户名不能少于6个字"
		}
	},
	"age":{
		"number":{
			"value":true,
			"message":"年龄只能是数字"
		},
		"minValue":{
			"value":18,
			"message":"未满18岁禁止入内"
		}
	},
	"vip":{
		"ajax":{
			"value":"http://www.taobao.com/api",
			"message":"对不起您的级别太低"
		}
	},
	"index":{
		"mask":{
			"value":/http:.* /,
			"message":"不符合规则"
		}
	},
	"ooxx":{
		"custom":{
			"value":function(value){
				if(value === "ooxx"){
					return false; //校验失败
				}
			},
			"message":"小子你太邪恶了"
		}
	}
}
*/