# 待修改

## 2024.07.02

```
1,弹出框根其他保持一致，参照 【场景-> 打开场景】
(已完成) 2,弹出框如果没有选择方案给出提示，且不会关闭方案弹出框
3,弹出框增加查询功能，根据方案名称查询.
    js请求方式
    HttpClient.build().post(WebApi.spaceData.queryFormulaUrl, {
        name: "要查询的方案名"
    }, (res) => {
        console.log(res);
    }, (err) => {
        console.log(err);
    });
```

## 2024.07.21

```
1, 节点增加了 nodeType: root, keyword, leaf，root和leaf可以修改。keyword可以修改和删除;
2, 节点增加了 valueType: key-value, json，修改时需要根据valueType来进行校验;
3, Settings底下的所有子节点都增加了 setId: setId=index，不需要根据id来split获得;(已修改，待检查)
4，保存时，获取到的json数据是否和原数据相同;
5, 未替换jar包
```


## 2024.07.23
```
1.上传方案时文件名修改
2.应用方案功能
3.上传方案功能
4.保存方案json后，要实时生效
```