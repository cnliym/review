/**
 * @version 1.0.1
 */
!function (S) {
	"use strict";
	/**
	 * P4PGetter 为请求操作类
	 * @constructor
	 */
	function P4PGetter(conf, render) {
		var self = this;
		self.render = render;
		self.updata = conf;
		self._init(conf);
	}
	(function () {
		var getterConfig = {
				API_PREFIX : "http://show.re.taobao.com/activity/data.htm",  //请求地址
				CHARSET: "utf-8",
				VERSION: "1.0"
			};

		P4PGetter.prototype = {
			_init: function (conf) {
				var self = this;
				self._get(self._parseUrl(conf));
			},
			/**
			 * 预列化请求参数
			 */
			_parseUrl: function (updata) {
				var self = this,
					str = [],
					item,
					i,

					_block,
					blockIndex,
					_result,

					result = {
						activity_id : [],
						block_ids : [],
						counts : [],
						pids : []
					};

				for (item in updata) {
					if (updata.hasOwnProperty(item)) {
						_block = updata[item].blocks;
						blockIndex = {};

						_result = {
							block_ids : [],
							counts : [],
							pids : []
						};

						for (i = 0; i < _block.length; i += 1) {
							blockIndex[_block[i].id] = blockIndex[_block[i].id] || {"pid": _block[i].pid};
							blockIndex[_block[i].id].count = (blockIndex[_block[i].id].count || 0) + _block[i].count;
						}
						for (i in blockIndex) {
							if (blockIndex.hasOwnProperty(i)) {
								_result.block_ids.push(i);
								_result.counts.push(blockIndex[i].count);
								_result.pids.push(blockIndex[i].pid);
							}
						}
						if (_result.block_ids.length > 0) {
							result.activity_id.push(item);
							for (_block in _result) {
								if (_result.hasOwnProperty(_block)) {
									result[_block].push(_result[_block].join(","));
								}
							}
						}
					}
				}

				for (i in result) {
					if (result.hasOwnProperty(i)) {
						str.push(i + "=" + result[i].join(";"));
					}
				}

				return getterConfig.API_PREFIX + "?" + str.join("&");
			},
			/**
			 * 请求数据。为兼容kissy1.1.6，新版可使用自带jsonp请求方法。
			 */
			_get: function (url, cb) {
				var self = this,
					//bugfix cb_name = "jsonp"+(new Date()).getTime();
					//页面上也使用new Date请求时。ie下容易出现同名。改为KISSY.guid
					cb_name = KISSY.guid("jsonp") + (new Date()).getTime();

				window[cb_name] = function (d) {
					self._cb(d);
				};

				S.getScript(
					url + "&cb=" + cb_name + "&version=" + getterConfig.VERSION,
					{
						charset: getterConfig.CHARSET,
						success: function (d) {
							try {
								delete window[self.cb_name];
								self = null;
							} catch (e) {}
						}
					}
				);
			},
			/**
			 * 分发回调，支持懒渲染
			 */
			_cb: function (data) {
				var self = this,
					activity,
					i,

					_block,
					_item,
					lazy,
					DataLazyload,

					lazyFn = function (resultContainer, fn) {
						if (DataLazyload) {
							lazy = lazy || new DataLazyload(resultContainer);
							lazy.addCallback(resultContainer, function () {
								if (S.isFunction(fn)) {
									fn();
								}
							});
						}
					},
					// 渲染策略
					rend = {
						"none": function (_item, tmpl, resultContainer) {
							if (tmpl) {
								self.render(_item, tmpl, resultContainer);
							}
						},
						"render": function (_item, tmpl, resultContainer) {
							if (DataLazyload) {
								lazyFn(resultContainer, function () {
									rend.none(_item, tmpl, resultContainer);
								});
							} else {
								//没有DataLazyload 模块
								rend.none(_item, tmpl, resultContainer);
							}
						},
						"textarea": function (_item, tmpl, resultContainer) {
							rend.lazy(_item, tmpl, resultContainer, "textarea");
						},
						"img": function (_item, tmpl, resultContainer) {
							rend.lazy(_item, tmpl, resultContainer, "img-src");
						},
						"lazy": function (_item, tmpl, resultContainer, type) {
							rend.none(_item, tmpl, resultContainer);
							lazyFn(resultContainer, function () {
								DataLazyload.loadCustomLazyData(resultContainer, type);
							});
						}
					};

				if (S.require) {
					S.require("datalazyload");
				} else {
					//兼容1.1.6
					DataLazyload = S.DataLazyload;
				}

				for (activity in self.updata) {
					if (self.updata.hasOwnProperty(activity)) {
						//bugfix 后端数据中，没有活动
						data[activity] = data[activity] || {};
						for (i = 0; i < self.updata[activity].blocks.length; i += 1) {
							_block = self.updata[activity].blocks[i];
							_item = data[activity][_block.id] || [];
							_item = _item.splice(0, _block.count);

							//支持　dataLazyLoad
							if (rend[_block.lazyDataType || self.updata[activity].lazyDataType]) {
								rend[_block.lazyDataType || self.updata[activity].lazyDataType](_item, _block.tmpl, _block.resultContainer);
							} else {
								rend.none(_item, _block.tmpl, _block.resultContainer);
							}

							if (S.isFunction(_block.cb)) {
								_block.cb(_item);
							}
						}
					}
				}
			}
		};
	}());

	var defaultConfig = {
			MAX_BLOCK : 20, //最大合并请求区域
			MAX_TIME : 300, //最长等待时间
			OUT_TIME : 100 //每次等待时间
		},

		testdata,
		testurl = "http://tms.taobao.com/go/rgn/p4p/test/data.php",

		updata = {},
		block_count = 0,
		startTime,
		timer,
		//为兼容老的接口调用方式，使用单例对像。
		p4p = {
			// 请求入口
			getItems: function (conf) {
				var self = this,
					i,
					blocks,

					activity_id = conf.activity_id;

				if (S.isArray(conf)) {
					for (i = 0; i < conf.length; i += 1) {
						p4p.getItems(conf[i]);
					}
					return self;
				}

				updata[activity_id] = updata[activity_id] || {};
				updata[activity_id].blocks = updata[activity_id].blocks || [];
				//id为-1的为测试区块，直接返回测试结果
				blocks = [];
				for (i = 0; i < conf.blocks.length; i += 1) {
					if (conf.blocks[i].id.toString() === "-1") {
						self._test(conf.blocks[i]);
					} else {
						blocks.push(conf.blocks[i]);
					}
				}
				conf.blocks = blocks;
				updata[activity_id].blocks = updata[activity_id].blocks.concat(conf.blocks);
				block_count += conf.blocks.length;

				startTime = startTime || new Date();
				if ((new Date()) - startTime > defaultConfig.MAX_TIME || block_count >= defaultConfig.MAX_BLOCK) {
					self._do();
				} else {
					clearTimeout(timer);
					timer = setTimeout(function () {
						self._do();
					}, defaultConfig.OUT_TIME);
				}
				return self;
			},
			// 2012-10-10 新增测试数据。当block id 为-1时返回测试值。
			_test: function (block) {
				var self = this,
					render = function (block, testdata) {
						var i,
							j,
							data = [];
						for (i = 0, j = testdata.length; i < block.count && j > 0; i += 1) {
							data.push(testdata[i % j]);
						}
						if (block.tmpl) {
							self._rend(data, block.tmpl, block.resultContainer);
						}
						if (S.isFunction(block.cb)) {
							block.cb(data);
						}
					},
					cb_name;
				if (!testdata) {
					cb_name = KISSY.guid("jsonp") + (new Date()).getTime();
					window[cb_name] = function (d) {
						testdata = d;
						render(block, testdata);
					};
					S.getScript(
						testurl + "?callback=" + cb_name,
						{
							charset: "utf-8",
							success: function (d) {
								try {
									delete window[cb_name];
								} catch (e) {}
							}
						}
					);
				} else {
					render(block, testdata);
				}
			},
			// 立即请求等待池数据
			_do: function () {
				var self = this,
					get;

				clearTimeout(timer);
				if (block_count > 0) {
					get = new P4PGetter(updata, self._rend);
				}
				//重置
				startTime = null;
				block_count = 0;
				updata = {};
				return self;
			},
			// 默认渲染
			_rend: function (data, tmpl, resultContainer) {
				var html = '', tmpl_func, i,
					self = this,
					rContainer = S.one(resultContainer);

				if (rContainer) {
					tmpl_func = p4p.template(tmpl);
					data = data.concat();
					for (i = 0; i < data.length; i += 1) {
						html = tmpl_func(data[i]) + html;
					}
					rContainer.html(html);
				}

				return self;
			},
			// underscore 模板引擎
			template: function (str, data) {
				var c = {
					evaluate    : /<%([\s\S]+?)%>/g,
					interpolate: /\{{2,3}(.+?)\}{2,3}/g
				};
				var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
					'with(obj||{}){__p.push(\'' +
					str.replace(/\\/g, '\\\\')
						.replace(/'/g, "\\'")
						.replace(c.interpolate, function(match, code) {
							return "'," + code.replace(/\\'/g, "'") + ",'";
						})
						.replace(c.evaluate || null, function(match, code) {
							return "');" + code.replace(/\\'/g, "'")
											  .replace(/[\r\n\t]/g, ' ') + "__p.push('";
						})
						.replace(/\r/g, '\\r')
						.replace(/\n/g, '\\n')
						.replace(/\t/g, '\\t')
						+ "');}return __p.join('');";
				var func = new Function('obj', tmpl);
				return data ? func(data) : func;
			}
	};
	//兼容老调用方式。
	window.p4p = window.p4p || p4p;
	//支持KISSY seed 加载
	S.add("market/p4p", function (S) {
		return p4p;
	});
}(KISSY);