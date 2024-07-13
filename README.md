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