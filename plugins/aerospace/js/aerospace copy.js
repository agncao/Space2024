(function () {
    //获取平台管理对象
    var yyastk = window.getYYASTK();
    //获取当前场景管理对象
    var currentScenario = yyastk.CurrentScenario;
    //远程调用方案
    // var formulaConfig = fun.getFormulaConfig();
    // var spaceData = fun.getSpaceData();

    // var fun = {
    //     getFormulaConfig: function () {
    //         var result = fetch("http://astrox.cn:9876/formula/get", {
    //             method: "GET",
    //         }.then((response) => {
    //             return response.json();
    //         }));
    //         return JSON.parse(result);
    //     },
    //     getSpaceData: function () {
    //         var result = {};
    //         //用signalR 客户端来调用
    //         var hubConnection = new signalR.HubConnectionBuilder()
    //             .withUrl("https://localhost:7234/receiver")
    //             .build();
    //         hubConnection.start();
    //         result.Posture = hubConnection.on("receivePosture", data => {
    //             return data;
    //         });

    //         result.Logs = hubConnection.On < string > ("receiveLog", data => {
    //             return data;
    //         });
    //         result.Businesses = hubConnection.On < string > ("receiveBusiness", data => {
    //             return data;
    //         });
    //         return result;
    //     },
    //     generateTemperatureChart: function (divContent, displayOptions, bizData) {
    //         var temperatureChart = echarts.init(divContent);
    //         // 指定图表的配置项和数据
    //         var option = {
    //             tooltip: {
    //                 formatter: "{a} <br/>{b} : {c}°C"
    //             },
    //             series: [
    //                 {
    //                     name: displayOptions.items[0].Label,
    //                     type: 'gauge',
    //                     detail: { formatter: '{value}°C' },
    //                     data: [{ value: bizData.value, name: displayOptions.items[0].Label }],
    //                     axisLine: {            // 坐标轴线
    //                         lineStyle: {       // 属性lineStyle控制线条样式
    //                             width: 8,
    //                             color: [
    //                                 [0.29, '#ff4500'], // 0 到 29% 是红色
    //                                 [0.82, '#48b'],    // 29% 到 82% 是蓝色
    //                                 [1, '#228b22'],    // 82% 到 100% 是绿色
    //                             ]
    //                         }
    //                     },
    //                     min: bizData.min,
    //                     max: bizData.max,
    //                     startAngle: 180,
    //                     endAngle: 0,
    //                     splitNumber: (bizData.max - bizData.min) / 10,
    //                     radius: '50%',
    //                 }
    //             ]
    //         };

    //         // 使用刚指定的配置项和数据显示图表。
    //         temperatureChart.setOption(option);
    //     },
    //     generateGaugeChart: function (divContent, displayOptions, bizData) {
    //         var gaugeChart = echarts.init(divContent);
    //         var option = {
    //             series: [
    //                 {
    //                     name: displayOptions.items[0].Label,
    //                     type: 'gauge',
    //                     detail: { formatter: '{value}°C' },
    //                     data: [{ value: bizData.value, name: displayOptions.items[0].Label }],
    //                 }
    //             ]
    //         };
    //         gaugeChart.setOption(option);
    //     },
    //     generateMessageGrid: function (divContent, displayOptions, messageData) {
    //         let table = document.createElement("table");
    //         let thead = document.createElement("thead");
    //         let tbody = document.createElement("tbody");
    //         table.appendChild(thead);
    //         table.appendChild(tbody);
    //         divContent.appendChild(table);

    //         let theadTr = document.createElement("tr");
    //         displayOptions.items.forEach(item => {
    //             let theadTh = document.createElement("th");
    //             theadTh.innerText = item.Label;
    //             theadTr.appendChild(theadTh);
    //         });
    //         thead.appendChild(theadTr);

    //         let tbodyTr = document.createElement("tr");
    //         messageData.forEach(item => {
    //             let tbodyTd = document.createElement("td");
    //             tbodyTd.innerText = item.value;
    //             tbodyTr.appendChild(tbodyTd);
    //         });
    //         tbody.appendChild(tbodyTr);
    //     },
    //     generateTimeGrid: function (divContent, displayOptions, timeData) {

    //     },
    //     generateReport: function (divContent, displayOptions, postureData) {

    //     },
    //     generateChart: function (divContent, displayOptions, postureData) {

    //     },
    // };

    var pluginAerospace = {
        id: "Plugins_aerospace",
        menu: {
            click: function (ele) {
                const openNewLayerIndex = layer.open({
                    type: 1,
                    title: "场景接口示例",
                    shadeClose: true,
                    shade: false,
                    area: '340px', // 宽高`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                    offset: ['140px', ($(window).width() - 450) + 'px'],
                    success: function (layero, index) {
                        var promise = currentScenario.createScene({
                            name: "新建场景测试",
                            centralBody: "Moon",
                            startTime: "2021-05-01T00:00:00Z",
                            endTime: "2021-05-02T00:00:00Z",
                            description: "测试",
                        });
                    },
                    content: $('#plugins_aerospace_container'),
                    btn: [],
                    end: function () {
                        //关闭窗口时删除所有添加的对象
                        pluginAerospace.clear();
                    }
                });

            },
        },
        // loadWindows: function () {
        //     this.showBizWindow();
        //     this.showMessageWindow();
        //     this.showTimeWindow();
        //     this.showReportWindow();
        //     this.showChartWindow();
        // },
        // showBizWindow: function () {
        //     var bizConfigArray = formulaConfig.Settings.filter(item => item.WindowType == "Business");
        //     if (!bizConfigArray || bizConfigArray.length == 0) return;
        //     var i = 0;
        //     bizConfigArray.forEach(item => {
        //         let bizContainer = document.createElement("div");
        //         bizContainer.setAttribute("id", "bizContainer" + i);
        //         bizContainer.className = item.Display.LayoutClass;
        //         bizContainer.style = item.Display.LayoutStyle;
        //         //给bizContainer添加一个子div
        //         let bizContent = document.createElement("div");
        //         bizContent.setAttribute("id", "bizContent" + i);
        //         bizContent.className = item.Display.ContentClass;
        //         bizContent.style = item.Display.ContentStyle;
        //         bizContainer.appendChild(bizContent);
        //         if (item.Display.ChartType == "Thermometer") {
        //             var bizArray = spaceData.Businesses.filter(biz => biz.itemId === item.Display.Items[0].itemId);
        //             if (bizArray && bizArray.length > 0) {
        //                 fun.generateTemperatureChart(bizContent, item.Display, bizArray[0]);
        //             }
        //         } else if (item.Display.ChartType == "Gauge") {
        //             var bizArray = spaceData.Businesses.filter(biz => biz.itemId === item.Display.Items[0].itemId);
        //             if (bizArray && bizArray.length > 0) {
        //                 fun.generateGaugeChart(bizContent, item.Display, bizArray[0]);
        //             }
        //         }

        //         i++;

        //     });
        // },
        // showMessageWindow: function () {
        //     var messageConfigArray = formulaConfig.Settings.filter(item => item.WindowType == "Message");
        //     if (!messageConfigArray || messageConfigArray.length == 0) return;
        //     var item = messageConfigArray[0];
        //     let messageContainer = document.createElement("div");
        //     messageContainer.setAttribute("id", "messageContainer0");
        //     messageContainer.className = item.Display.LayoutClass;
        //     messageContainer.style = item.Display.LayoutStyle;

        //     let messageContent = document.createElement("div");
        //     messageContent.setAttribute("id", "messageContent0");
        //     messageContent.className = item.Display.ContentClass;
        //     messageContent.style = item.Display.ContentStyle;
        //     messageContainer.appendChild(messageContent);

        //     fun.generateMessageGrid(messageContent, item.Display, spaceData.Logs);
        // },
        // showTimeWindow: function () {

        //     var timeConfigArray = formulaConfig.Settings.filter(item => item.WindowType == "Time");
        //     if (!timeConfigArray || timeConfigArray.length == 0) return;
        //     var item = timeConfigArray[0];
        //     let messageContainer = document.createElement("div");
        //     messageContainer.setAttribute("id", "timeContainer0");
        //     messageContainer.className = item.Display.LayoutClass;
        //     messageContainer.style = item.Display.LayoutStyle;

        //     let messageContent = document.createElement("div");
        //     messageContent.setAttribute("id", "timeContent0");
        //     messageContent.className = item.Display.ContentClass;
        //     messageContent.style = item.Display.ContentStyle;
        //     messageContainer.appendChild(messageContent);

        //     fun.generateTimeGrid(messageContent, item.Display, spaceData.Logs);
        // },
        // showReportWindow: function () {
        //     var reportConfigArray = formulaConfig.Settings.filter(item => item.WindowType == "Report");
        //     if (!reportConfigArray || reportConfigArray.length == 0) return;
        //     reportConfigArray.forEach(item => {
        //         let reportContainer = document.createElement("div");
        //         reportContainer.setAttribute("id", "reportContainer" + i);
        //         reportContainer.className = item.Display.LayoutClass;
        //         reportContainer.style = item.Display.LayoutStyle;

        //         let reportContent = document.createElement("div");
        //         reportContent.setAttribute("id", "reportContent" + i);
        //         reportContent.className = item.Display.ContentClass;
        //         reportContent.style = item.Display.ContentStyle;
        //         reportContainer.appendChild(reportContent);

        //         i++;
        //         fun.generateReport(messageContent, item.Display, spaceData.Logs);
        //     });
        // },
        // showChartWindow: function () {
        //     var chartConfigArray = formulaConfig.Settings.filter(item => item.WindowType == "Chart");
        //     if (!chartConfigArray || chartConfigArray.length == 0) return;
        //     chartConfigArray.forEach(item => {
        //         let chartContainer = document.createElement("div");
        //         chartContainer.setAttribute("id", "chartContainer" + i);
        //         chartContainer.className = item.Display.LayoutClass;
        //         chartContainer.style = item.Display.LayoutStyle;

        //         let chartContent = document.createElement("div");
        //         chartContent.setAttribute("id", "chartContent" + i);
        //         chartContent.className = item.Display.ContentClass;
        //         chartContent.style = item.Display.ContentStyle;
        //         chartContainer.appendChild(chartContent);

        //         i++;
        //         fun.generateChart(chartContent, item.Display, spaceData.Logs);
        //     });
        // }
    };
    Plugins.add(pluginAerospace);
})();
