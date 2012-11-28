/**
 * Get data helper
 * @author intellsmi@gmail.com
 * @Date 2012-9-7
 */
KISSY.add("market/getHelper", function (S) {
	'use strict';
	/**
	 * @class GetHelper
	 */
	function GetHelper(conf) {
		this.init(conf);
	}

	GetHelper.defaultConfig = {
		SEPARATOR : ",", //参数分隔符
		CALLBACK : "callback", //回调函数名
		MAX_BLOCK : 20, //最大合并请求区域
		MAX_TIME : 300, //最长等待时间
		OUT_TIME : 100 //每次等待时间
	};
	S.augment(GetHelper, {
		/** @exports init GetHelper.prototype */
		init : function (conf) {
			var self = this;
			self.conf = S.merge(GetHelper.defaultConfig, conf);
			self.stack = [];
			self.block = {};
			self.blockLen = 0;
		},
		/**
		 * 添加请求项
		 * TODO 参数保护
		 * @param {object} para 传入参数，由传入参数模板决定参数项，id为必填。count为特殊项
		 * @param {Function} cb 回调，调用时将传回结果数据
		 * @return {GetHelper}
		 */
		push : function (para, cb) {
			var self = this,
				i;

			self.stack.push(S.merge(para, {cb : cb}));
			for (i = 0; i < para.length; i = i + 1) {
				if (!S.inArray(para[i], self.block)) {
					self.block.push(para[i]);
				}
			}
			//仅支持count累加
			if (self.block[para.id] && para.count) {
				self.block[para.id].count += para.count;
			} else {
				self.block[para.id] = para;
				self.blockLen += 1;
			}
			self.startTime = self.startTime || new Date();
			if ((new Date()) - self.startTime > self.conf.MAX_TIME || self.blockLen >= self.conf.MAX_BLOCK) {
				self._do();
			} else {
				clearTimeout(self.timer);
				self.timer = setTimeout(function () {
					self._do();
				}, self.conf.OUT_TIME);
			}
			return self;
		},
		/**
		 * 添加请求项，并立即请求
		 * @param para 同push
		 * @param cb
		 */
		get : function (para, cb) {
			var self = this;
			self.push(para, cb);
			self._do();
			return self;
		},
		/**
		 * 执行请求，并重置请求沲
		 * @return {*}
		 * @private
		 */
		_do : function () {
			var self = this, block = {},
				para = S.JSON.parse(self.conf.MAP_PARA);
			S.each(self.block, function (v) {
				S.each(v, function (tv, ti) {
					block[ti] = block[ti] || [];
					block[ti].push(tv);
				});
			});
			clearTimeout(self.timer);
			S.each(para, function (v, i) {
				var p = v.split("@");
				if (p.length === 2) {
					if (p[0]) {
						S.each(block[p[1]], function (v, i) {
							block[p[1]][i] = p[0] + v;
						});
					}
					para[i] = block[p[1]].join(self.conf.SEPARATOR);
				}
			});
			self._get(para, self.stack);
			self.block = {};
			self.blockLen = 0;
			self.stack = [];
			self.startTime = null;
			return self;
		},
		/**
		 * 请求JSONP数据
		 * TODO 支持参数为function 执行结果回传
		 * @param para
		 * @param stack
		 * @return {*}
		 * @private
		 */
		_get : function (para, stack) {
			var self = this,
				cb_name = S.guid("jsonp") + (new Date()).getTime(),
				param = function (para) {
					var str = [];
					S.each(para, function (v, i) {
						str.push(i + "=" + v);
					});
					return str.join("&");
				};
			window[cb_name] = function (d) {
				self._assign(d, stack);
			};
			para[self.conf.CALLBACK] = cb_name;
			S.getScript(
				self.conf.API_PREFIX + "?" + param(para),
				{
					success : function () {
						try {
							delete window[cb_name];
						} catch (e) {
						}
					}
				}
			);
			return self;
		},
		/**
		 * 分发返回数据
		 * @param d
		 * @param stack
		 * @private
		 */
		_assign : function (d, stack) {
			var
				i, j, p, result, dataParse, dataTemp, dataPath,
				self = this,
				resultPath = S.JSON.parse(self.conf.MAP_RESULT)["@result"].split(".");
			if (self.conf.DATA_PARSE) {
				dataParse = S.JSON.parse(self.conf.DATA_PARSE);
				dataPath = dataParse["@data"].split(".");
				dataTemp = d;
				S.each(dataPath, function (v) {
					dataTemp = dataTemp[v];
				});
				result = {};
				S.each(dataTemp, function (v) {
					var dataList = dataParse["@value"].split(","), i;
					if(dataList.length === 1) {
						result[v[dataParse["@id"]]] = v[dataParse["@value"]];
					} else {
						result[v[dataParse["@id"]]] = {};
						for(i = 0; i<dataList.length; i += 1) {
							result[v[dataParse["@id"]]][dataList[i]] = v[dataList[i]];
						}
					}
				});
				d = result;
			}
			for (i = 0; i < stack.length; i += 1) {
				result = d;
				for (j = 0; j < resultPath.length; j += 1) {
					p = resultPath[j].split("@");
					result = result[p[0] + (stack[i][p[1]] || "")];
				}
				if (stack[i].count) {
					result = result.splice(0, stack[i].count);
				}
				if (S.isFunction(stack[i].cb)) {
					stack[i].cb(result);
				}
			}
		}
	});
	GetHelper.mod = {};
	/**
	 * 添加请求接口
	 * @param {string} name 接口名
	 * @param {object} obj 接口配置
	 */
	GetHelper.add = function (name, obj) {
		GetHelper.mod[name] = new GetHelper(obj);
		return GetHelper.mod[name];
	};
	/**
	 * 使用接口对像
	 * @param {string} name 接口名
	 * @return {GetHelper}
	 */
	GetHelper.use = function (name) {
		return GetHelper.mod[name];
	};
	//返回三个实例化对像
	GetHelper.add("sale", {
		API_PREFIX : "http://tbskip.taobao.com/json/auction_saled_amount.do",
		MAP_PARA : '{"keys":"@id"}',
		DATA_PARSE : '{"@id":"aid","@value":"amount","@data":"auctions"}',
		MAP_RESULT : '{"@result":"@id" }'
	});
	GetHelper.add("view", {
		API_PREFIX : "http://count.tbcdn.cn/counter3",
		MAP_PARA : '{"keys":"ICVT_7_@id"}',
		MAP_RESULT : '{"@result":"ICVT_7_@id","@success":true}'
	});
	GetHelper.add("p4p", {
		API_PREFIX : "http://tmatch.simba.taobao.com/",
		MAP_PARA : '{"blockid":"@id","count":"@count","pid":"@pid","name":"dpactive","o":"c","source":"dpmerchants","elemtid":"8","layouttid":"8"}',
		MAP_RESULT : '{"@result":"@id","@success":true}'
	});
	GetHelper.add("item", {
		API_PREFIX : "http://tbskip.taobao.com/json/auction_saled_amount.do",
		MAP_PARA : '{"keys":"@id","qt":"0"}',
		DATA_PARSE : '{"@id":"aid","@value":"amount,qu,st","@data":"auctions"}',
		MAP_RESULT : '{"@result":"@id" }'
	});
	return GetHelper;
});
/**
 * 延时合并请求
 */
