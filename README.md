##垂直市场代码review

###使用方式

使用github账户登陆，点击commits，选择某次提交的代码，选择代码相应行号，进行点评。

第一次clone代码以后，在当前目录中执行操作

```
git config user.name '翰文' //自己花名
git config user.email 'hanwen.sah@taobao.com' //自己花名
```

代码提交需要注意，每次review的代码放在一个文件中，比如第一次，文件夹为scroll，并
且，在下面的代码集合中写明。同时在scroll文件夹中，包含一个文件，README.md，使用
markdown语法，markdown语法可以参考
[此文](http://ued.taobao.com/blog/2012/07/03/getting-started-with-markdown/)，和wiki基本一致。

## 代码集合

- 第一期, scroll: 爱逛街滚动动画
- 第二期, page:  分页
- 第三期, affix: 固定模块
- 第四期, menu: 多级异步菜单

##提交

```
cd path/to/rewiew
git add .
git commit -m 'msg'
git push
```