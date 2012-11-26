##IO代理

###IO队列、IO栈

有四个文件，ioproxy.js、ioqueue.js、iostack.js、iofactory.js

ioproxy.js：IO代理，抽象类，需要被继承同时重写_do方法

ioqueue.js：IO队列，ioproxy的一个实现，先发出去的请求先执行回调

iostack.js：IO栈，ioproxy的另一个实现，后发出去的请求先执行栈内回调

iofactory.js：IO工厂，创建IO代理实例

 `var ioQueue = IOFactory('queue');
  var ioStack = IOFactory('stack');`

DEMO：<http://fed.ued.taobao.net/u/yuanquan/mytest/ioproxy/index.html> 打开控制台

欢迎吐槽
