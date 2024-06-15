(function () {
    //获取平台管理对象
    const yyastk = window.getYYASTK();
    //获取当前场景管理对象
    const currentScenario = yyastk.CurrentScenario;

    // const container = document.getElementById('plugins_aerospace_container');
    const _parentContainer = document.getElementById('cesiumContainer');
    const _boxType = {
        Time: "Time",
        Message: "Message",
        Business: "Business",
        Report: "Report",
        Chart: "Chart"
    }
    let _formulaConfig = null;
    let _postureChart = { series: [], xAxis: [], yAxis: [], legend: [] };
    
    let _postureChartType = {Time:0};

    const fn = {

        parseBoxStyle: function (setting) {
            let displaySetting = setting.Display;
            let result = {};
            result.offset = displaySetting.Box.Offset && displaySetting.Box.Offset.length > 1 ? [displaySetting.Box.Offset[0], displaySetting.Box.Offset[1]] : [0, 0];
            result.area = displaySetting.Box.Area && displaySetting.Box.Area.length > 1 ? [displaySetting.Box.Area[0], displaySetting.Box.Area[1]] : [450, 380];
            result.skin = displaySetting.Box.Class ? displaySetting.Box.Class : '';
            result.title = displaySetting.Box.Name ? displaySetting.Box.Name : '数据';
            if (result.offset[1] < 0) {
                result.offset[1] = $(window).width() - result.area[0] + result.offset[1];
            }
            if (result.offset[0] < 0) {
                result.offset[0] = $(window).height() - result.area[1] + result.offset[0];
            }
            return result;
        },
        parseChartContainerStyle: function (display, parentWin) {
            //得到parentWin的高度
            let parentWinHeight = parentWin.offsetHeight;
            let parentWinWidth = parentWin.offsetWidth;
            let offset = [0, 0];
            if (display.Content.Offset && display.Content.Offset.length > 0) {
                offset[0] = display.Content.Offset[0];
            }
            if (display.Content.Offset && display.Content.Offset.length > 1) {
                offset[1] = display.Content.Offset[1];
            }
            let area = ['100%', '100%'];
            if (display.Content.Area && display.Content.Area.length > 0) {
                if (typeof (display.Content.Area[0]) !== 'number') {
                    area[0] = display.Content.Area[0];
                } else {
                    area[0] = parseInt(display.Content.Area[0] * 100 / parentWinWidth) + '%';
                }
            } else if (display.Content.Area && display.Content.Area.length > 1) {
                if (typeof (display.Content.Area[1]) !== 'number') {
                    area[1] = display.Content.Area[1];
                } else {
                    area[1] = parseInt(display.Content.Area[1] * 100 / parentWinHeight) + '%';
                }
            }
            return {
                offset: [offset[0] + 'px', offset[1] + 'px'],
                area: area
            };
        },
        generateChartContainer: function (display, parentWin) {
            let style = fn.parseChartContainerStyle(display, parentWin);
            let divId = fn.generateChartContainerId(parentWin, 0);
            let div = document.createElement("div");
            div.setAttribute("id", divId);
            div.setAttribute("style", "position:absolute;top:" + style.offset[0]
                + ";left:" + style.offset[1]
                + ";width:" + style.area[0] + ";height:"
                + style.area[1] + ";");
            div.setAttribute("class", display.Content.Class);
            parentWin.appendChild(div);
            console.log("generateChartContainer:", parentWin.innerHTML);
            return div;
        },
        generateChartContainerId: function (parentWin, index) {
            return parentWin.getAttribute("id") + "_chart";
        },
        openBoxWindow: function (style, item, index) {
            let windowType = item.WindowType;
            let divId = fn.generateWindowId(windowType, index);
            let div = document.createElement("div");
            div.setAttribute("id", divId);
            _parentContainer.appendChild(div);

            $(div).css({
                position: "absolute",
                top: style.offset[0],
                left: style.offset[1],
                width: style.area[0],
                height: style.area[1]
            });
            $(div).addClass(item.Display.Box.Class);
            return div;
        },
        generateWindowId: function (windowType, index) {
            return "div" + windowType + index;
        },
        getContentTableId: function (chartContainer, type) {
            return chartContainer.id + "_" + type;
        },
        getEntityType: function (entityId) {
            if (!entityId || entityId.indexOf("/") <= 0) return null;
            return entityId.split("/")[0];
        }
    };

    const dataParser = {
        onReceiveSpaceData: function (msg) {
            if (_formulaConfig) {
                dataParser.doReceiveSpaceData(msg);
            } else {
                HttpClient.build().get(WebApi.spaceData.formulaUrl, data => {
                    _formulaConfig = data;
                    dataParser.doReceiveSpaceData(msg);
                });
            }
        },
        doReceiveSpaceData: function (msg) {
            let spaceData = JSON.parse(msg);
            let bizzList = spaceData && spaceData.Bizz ? spaceData.Bizz : [];
            let messageList = spaceData && spaceData.Logs ? spaceData.Logs : [];
            messageList.forEach(item => {
                item.AppId = spaceData.AppId;
                item.AppName = spaceData.AppName;
            });
            dataParser.parseBizzData(bizzList);
            dataParser.parseMessageData(messageList);
            dataChart.generateTimeGrid(null, null, spaceData.Posture.time);
            dataParser.parsePostureData(spaceData.Posture);
        },
        parseMessageData: function (messageList) {
            let messageConfigArray = _formulaConfig.Settings.filter(item => item.WindowType == _boxType.Message);
            if (!messageConfigArray || messageConfigArray.length == 0) return;
            if (!messageList || messageList.length == 0) return;

            let item = messageConfigArray[0];
            let parentWin = document.getElementById(fn.generateWindowId(item.WindowType, 0));
            if (!parentWin) return;
            let chartContainer = document.getElementById(fn.generateChartContainerId(parentWin, 0));
            //清除图表内容
            chartContainer.innerHTML = "";
            dataChart.generateMessageGrid(chartContainer, messageConfigArray[0].Display, messageList);
        },
        parseBizzData: function (bizzList) {
            let bizConfigArray = _formulaConfig.Settings.filter(item => item.WindowType == _boxType.Business);
            if (!bizConfigArray || bizConfigArray.length == 0) return;

            if (!bizzList || bizzList.length == 0) return;

            let i = 0;
            for (let bizConfig of bizConfigArray) {
                let layoutWindow = document.getElementById(fn.generateWindowId(bizConfig.WindowType, i));
                if (!layoutWindow) continue;
                let chartContainer = document.getElementById(fn.generateChartContainerId(layoutWindow, i));

                let bizSubList = [];
                for (let biz of bizzList) {
                    if (biz.ItemCode === bizConfig.Display.Items[0].Id) {
                        bizSubList.push(biz);
                    }
                }
                let bizData = bizSubList ? {
                    value: bizSubList[0].Value,
                    min: bizSubList[0].Min,
                    max: bizSubList[0].Max
                } : { value: 0, min: 0, max: 0 };
                if (bizConfig.Display.ChartType == "Thermometer") {
                    dataChart.generateTemperatureChart(
                        chartContainer,
                        bizConfig.Display,
                        bizData);
                } else if (bizConfig.Display.ChartType == "Gauge") {
                    dataChart.generateGaugeChart(
                        chartContainer,
                        bizConfig,
                        bizData);
                }
                i++;

            };
        },
        parsePostureData: function (postureData) {
            //弹出窗口没打开，数据就没必要生成了
            let postureReportSettings = _formulaConfig.Settings.filter(item => item.WindowType == _boxType.Report);
            let postureChartSettings = _formulaConfig.Settings.filter(item => item.WindowType == _boxType.Chart);
            if ((!postureReportSettings || postureReportSettings.length == 0)
                && (!postureChartSettings || postureChartSettings.length == 0))
                return;

            if (!postureData || !postureData.entities || postureData.entities.length == 0) return;

            let signalRDataAdapter = Cesium.DataAdapter.get(_formulaConfig.Parser);
            signalRDataAdapter.rtNetWork = Cesium.RTNetWork;
            signalRDataAdapter.rtNetWork.noFindCreate = true;
            signalRDataAdapter.rtNetWork.dataSource = sceneViewModel.dataSource;
            signalRDataAdapter.parse(postureData);
            if ((postureReportSettings && postureReportSettings.length > 0)) {
                if (postureReportSettings[0].WindowType === _boxType.Report) {
                    dataParser.doPostureReportData(signalRDataAdapter, postureReportSettings[0]);
                }
            }
            if ((postureChartSettings && postureChartSettings.length > 0)) {
                if (postureChartSettings[0].WindowType === _boxType.Chart) {
                    dataParser.doPostureChartData(signalRDataAdapter, postureChartSettings[0]);
                }
            }
        },
        doPostureReportData: function (signalRDataAdapter, setting) {
            try {
                let entityType = fn.getEntityType(setting.EntityId);
                let realTimeEntity = sceneViewModel.dataSource.getRealTimeEntity(setting.EntityId);
                let reportObj = Cesium.RGData.getReportAndGraphStyles(entityType, "Report", setting.ReportName);

                let result = { jdTime: signalRDataAdapter.dataJd, timeStep: 1, res: null };
                reportObj.createResult(realTimeEntity, {
                    startTime: result.jdTime,
                    stopTime: result.jdTime,
                    timeStep: result.timeStep
                }).then(res => {
                    if (res.status !== 1) {
                        console.warn("Error processing posture data:", res);
                    } else {
                        if (!res.data) return;
                        for (let ele of res.data) {
                            if (ele.type !== "data") {
                                continue;
                            }
                            result.res = ele.value;
                            dataChart.generatePostureReport(null, setting, result);
                        }
                    }
                });
            } catch (err) {
                console.error(err);
            }
        },
        doPostureChartData: function (signalRDataAdapter, setting) {
            try {
                let entityType = fn.getEntityType(setting.EntityId);
                let realTimeEntity = sceneViewModel.dataSource.getRealTimeEntity(setting.EntityId);
                let rgGraph = Cesium.RGData.getReportAndGraphStyles(entityType, "Graph", setting.ReportName);
                let result = { jdTime: signalRDataAdapter.dataJd, timeStep: 1, res: null };
                rgGraph.createResult(realTimeEntity, {
                    startTime: signalRDataAdapter.dataJd,
                    stopTime: signalRDataAdapter.dataJd,
                    timeStep: 1
                }).then(res => {
                    if (res.status !== 1) {
                        console.warn("Error processing posture data:", res);
                    } else {
                        if (!res.data) return;  //Cesium.RGData.Graph.DContent
                        result.res = res.data;
                        dataChart.generatePostureChart(null, setting, result);
                    }
                });
            } catch (err) {
                console.error(err);
            }
        }
    };
    const dataChart = {
        generateMessageGrid: function (divContent, display, messageList) {
            if (!divContent) {
                let box = document.getElementById(fn.generateWindowId(_boxType.Message, 0));
                if (!box) return;
                divContent = document.getElementById(fn.generateChartContainerId(box, 0));
            }

            console.log("generateMessageGrid: ", messageList);
            let table = document.createElement("table");
            let thead = document.createElement("thead");
            let tbody = document.createElement("tbody");
            table.appendChild(thead);
            table.appendChild(tbody);
            divContent.appendChild(table);

            let theadTr = document.createElement("tr");
            for (let item of display.Items) {
                let theadTh = document.createElement("th");
                theadTh.innerText = item.Label;
                theadTr.appendChild(theadTh);
            }
            thead.appendChild(theadTr);

            messageList.forEach(row => {
                let tbodyTr = document.createElement("tr");
                for (let item of display.Items) {
                    let tbodyTd = document.createElement("td");
                    tbodyTd.innerText = row[item.Id];
                    tbodyTr.appendChild(tbodyTd);
                }
                tbody.appendChild(tbodyTr);
            });
        },
        generateTimeGrid: function (divContent, timeSetting, spaceTime) {
            if (!spaceTime) return;
            if (!divContent) {
                let box = document.getElementById(fn.generateWindowId(_boxType.Time, 0));
                if (!box) return;
                divContent = document.getElementById(fn.generateChartContainerId(box, 0));
                divContent.innerHTML = "";
            }
            if (!timeSetting) {
                let arr = _formulaConfig.Settings.filter(item => item.WindowType == _boxType.Time);
                if (arr && arr.length > 0) {
                    timeSetting = arr[0];
                }
            }
            //将sendTimeStamp转换成时间对象
            let spaceBjTime = spaceTime.replace("UTCG", "");
            let time = spaceBjTime ? moment(spaceBjTime) : null;

            //生成一个一行两列的table
            let table = document.createElement("table");
            let tbody = document.createElement("tbody");
            table.appendChild(tbody);
            divContent.appendChild(table);

            //计算一下需要多少行
            let items = [];
            let displayItems = timeSetting.Display.Items.split(',');
            let subItems = displayItems.filter(item => item.trim() !== "" &&
                item.trim().toUpperCase() !== "UTC" &&
                item.trim().toUpperCase() !== "UTCG" &&
                item.trim().toUpperCase() !== "UTC/UTCG" &&
                item.trim().toUpperCase() !== "UTCG/UTC");
            if (subItems.length < displayItems.length) {
                items.push("UTC/UTCG");
                items.push(...subItems);
            } else {
                items.push(...displayItems);
            }
            const cellCount = 2;
            const rowCount = items.length / cellCount;

            for (let i = 0; i < rowCount; i++) {
                let tbodyTr = document.createElement("tr");
                tbody.appendChild(tbodyTr);
                for (let j = 0; j < cellCount; j++) {
                    let tbodyTd = document.createElement("td");
                    tbodyTr.appendChild(tbodyTd);

                    let innerText = "";
                    if (!time) return;
                    if (items[(i + 1) * j].toUpperCase() === "UTC/UTCG") {
                        innerText = time.utc().format();
                    } else if (items[(i + 1) * j].toUpperCase() === "EPSEC") {
                        let precision = timeSetting.Precision ? timeSetting.Precision : 0;
                        var dateObj = moment(_formulaConfig.EpochStartTime, "YYYY-MM-DD HH:mm:ss");
                        let epochSeconds = time.valueOf() - dateObj.valueOf();
                        innerText = parseFloat((epochSeconds / 1000).toFixed(precision));;
                    } else {
                        innerText = "北京时间: " + time.format("YYYY-MM-DD HH:mm:ss");
                    }
                    tbodyTd.innerText = items[(i + 1) * j] + ": " + innerText;
                }

            }
        },
        generateGaugeChart: function (divContent, setting, bizData) {
            let gaugeChart = echarts.init(divContent);
            let chartOptions = {
                tooltip: {
                    formatter: "{a} <br/>{b} : {c}%"
                },

                series: [
                    {
                        name: setting.Display.Items[0].Label,
                        type: 'gauge',
                        splitNumber: (bizData.max - bizData.min) / 10,
                        axisLine: {            // 坐标轴线
                            lineStyle: {       // 属性lineStyle控制线条样式
                                color: [[0.2, '#67e0e3'], [0.8, '#37a2da'], [1, '#fd666d']],
                                width: 30
                            }
                        },
                        axisTick: {
                            distance: -30,
                            length: 8,
                            lineStyle: {
                                color: '#fff',
                                width: 2
                            }
                        },
                        splitLine: {
                            distance: -30,
                            length: 30,
                            lineStyle: {
                                color: '#fff',
                                width: 4
                            }
                        },
                        axisLabel: {
                            color: 'inherit',
                            distance: 40,
                            fontSize: 20
                        },
                        pointer: {
                            itemStyle: {
                                color: 'auto'
                            }
                        },
                        detail: {
                            valueAnimation: true,
                            textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                                color: 'inherit',
                                fontWeight: 'bolder'
                            }
                        },
                        data: [{ value: bizData.value, name: setting.Display.Items[0].Label }],
                        min: bizData.min,
                        max: bizData.max,
                    }
                ]
            };
            gaugeChart.setOption(chartOptions);
        },

        generateTemperatureChart: function (divContent, setting, bizData) {
        },

        generatePostureReport: function (divContent, setting, reportResult) {
            if (!divContent) {
                let box = document.getElementById(fn.generateWindowId(_boxType.Report, 0));
                if (!box) return;
                divContent = document.getElementById(fn.generateChartContainerId(box, 0));
            }
            if (!reportResult || !reportResult.res) return;
            let dData = reportResult.res;
            let display = setting.Display;

            // 创建表格元素
            let table = document.getElementById(fn.getContentTableId(divContent, _boxType.Report));
            if (!table) {
                table = document.createElement("table");
                table.id = fn.getContentTableId(divContent, _boxType.Report);
                table.className = display.Box.Class ? display.Box.Class : "layui-table";
                divContent.appendChild(table);
            }

            // 创建并设置 colgroup
            let colgroup = document.querySelector("#" + table.id + " tbody");
            if (!colgroup) {
                colgroup = document.createElement("colgroup");
                let colElement = document.createElement("col");
                colElement.style.width = "35%";
                colgroup.appendChild(colElement);
                colgroup.appendChild(document.createElement("col"));
                table.appendChild(colgroup);
                // 创建表体
                let tbody = document.createElement("tbody");
                table.appendChild(tbody);
                for (let i = 0; i < dData.titles.length; i++) {
                    let tr = document.createElement("tr");
                    tbody.appendChild(tr);
                    let tdTitle = document.createElement("td");
                    tr.appendChild(tdTitle);
                    let tdData = document.createElement("td");
                    tr.appendChild(tdData);
                    tdTitle.innerText = dData.titles[i];
                    tdData.innerText = dData.values[0][i];
                }
            } else {
                for (let i = 0; i < dData.titles.length; i++) {
                    var dataCell = document.querySelector("#" + table.id + " tbody tr:nth-child(" + (i + 1) + ") td:nth-child(2)");
                    let innerText = dData.values && dData.values.length > 0 &&
                        dData.values[0] && dData.values[0].length > 0 &&
                        dData.values[0][i] ?
                        dData.values[0][i] : "";
                    try {
                        dataCell.innerText = null == innerText ? "" : innerText;
                    } catch (err) {
                        console.warn("dataCell.innerText is error: ", dataCell, err);
                    }
                }
            }

        },
        //graphResult = {jdTime:signalRDataAdapter.dataJd,timeStep:1,res:null};
        generatePostureChart: function (divContent, setting, graphResult) {
            if (!divContent) {
                let box = document.getElementById(fn.generateWindowId(_boxType.Chart, 0));
                if (!box) return;
                divContent = document.getElementById(fn.generateChartContainerId(box, 0));
            }
            if (!graphResult || !graphResult.res) return;

            for (const key in graphResult.res) {
                const result = graphResult.res[key];
                //如果result不是对象就 continue
                if (typeof result !== 'object') continue;
                // 使用正则表达式匹配键名
                const match = key.match(/^y(\d*)$/);
                if (match) {    // y轴
                    dataChart.setPostureYSeries(res,key, match);
                } else {    // x轴
                    dataChart.setPostureXAxis(res,key);
                }
            }

            let chart = echarts.init(divContent);
            let chartOptions = {
                title: { text: graphResult.res && graphResult.res.title ? graphResult.res.title : "" },
                axisPointer: {
                    animation: true
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function (params) {
                    }
                },
                xAxis: _postureChart.xAxis[0],

                yAxis: _postureChart.yAxis,
                series: _postureChart.series,
                legend: _postureChart.legend

            };
            chart.setOption(chartOptions);
        },
        setPostureXAxis:function(res,key){
            let xRes = res[key];
            if (_postureChart.xAxis.length <= 0) {   //不存在当前x轴数据
                _postureChart.xAxis = [{ type: '', splitLine: { show: true } }];
            }
            _postureChart.xAxis[0].type = key;
            if(res['charType'] !== _postureChartType.Time){
                let val = xRes.values ? xRes.values : null;
                _postureChart.xAxis[0].data.push(val ? val.values : []);
            }
        },
        /**
         * 
         * @param {*} ydata 
         * @param {*} key 
         * @param {*} ymatch 如果key==='y',match[1] 将是空字符串，这时 index 将保持为 0。
         *      如果key为y{数字}，如 y2，则 match[1] 为 2，index 将被设置为 2 - 1 = 1
         */
        setPostureYSeries: function (res,key, ymatch) {
            let ydata = res[key];
            let index = 0;
            if (ymatch[1]) {
                index = parseInt(ymatch[1], 10) - 1;
            }
            let yAxis = _postureChart.yAxis[index];
            if (!yAxis) {
                yAxis = { type: 'value', name: ydata.title, position: index === 0 ? 'left' : 'right' };
                yAxis.axisLabel = { formatter: '{value} °' };
                _postureChart.yAxis.push(yAxis);
            }

            let y = ydata ? ydata.values : [];
            for (let i = 0; i < y.length; i++) {
                let isSeriesFinded = false;
                if (_postureChart.series.length > 0) {
                    for (let j = 0; j < _postureChart.series.length; j++) {
                        if (_postureChart.series[j].dimensionName === y[i].dimensionName) {
                            _postureChart.series[j].data.push(y[i].values[0]);
                            isSeriesFinded = true;
                            break;
                        }
                    }
                }
                if (!isSeriesFinded) {
                    let series = { name: ydata.title, type: 'line', data: [y[i].values[0]], dimensionName: y[i].dimensionName };
                    if (y.length === 1) {
                        series.yAxisIndex = index;
                    }
                    _postureChart.series.push(series);
                    _postureChart.legend.push(y[i].title);
                }
            }
        }
    }

    //    远程调用方案
    SignalRClient.build(WebApi.spaceData.hub).listen("receiveSpaceData", dataParser);

    const Aerospace = {
        id: "Plugins_aerospace",
        menu: {
            click: function (ele) {
                openNewLayerIndex = layer.open({
                    type: 1,
                    title: "场景接口示例",
                    shadeClose: true,
                    shade: false,
                    area: '340px', // 宽高`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                    offset: ['140px', ($(window).width() - 450) + 'px'],
                    success: function (layero, index) {
                        let promise = currentScenario.createScene({
                            name: "新建场景测试",
                            centralBody: "Moon",
                            startTime: "2021-05-01T00:00:00Z",
                            endTime: "2021-05-02T00:00:00Z",
                            description: "测试",
                        });
                    },
                    content: $('#plugins_aerospace_container'),
                    btn: [],
                });
            },
        },
        showSubWindows: function () {
            let self = this;
            HttpClient.build().get(WebApi.spaceData.formulaUrl, data => {
                _formulaConfig = data;
                self.showBizWindow();
                self.showGridWindow(_boxType.Message);
                self.showGridWindow(_boxType.Time);
                self.showGridWindow(_boxType.Report);
                self.showGridWindow(_boxType.Chart);
            });
        },

        showBizWindow: function () {
            var bizConfigArray = _formulaConfig.Settings.filter(item => item.WindowType == _boxType.Business);
            if (!bizConfigArray || bizConfigArray.length == 0) return;

            if (document.getElementById(fn.generateWindowId(bizConfigArray[0].WindowType, 0))) {
                return;
            }
            var i = 0;
            for (let i = 0; i < bizConfigArray.length; i++) {
                let bizConfig = bizConfigArray[i];
                //生成样式
                let style = fn.parseBoxStyle(bizConfig);
                //生成窗体
                let subWindow = fn.openBoxWindow(style, bizConfig, i);
                //生成图表容器
                let chartContainer = fn.generateChartContainer(bizConfig.Display, subWindow);

                if (bizConfig.Display.ChartType == "Gauge") {
                    dataChart.generateGaugeChart(chartContainer, bizConfig, { value: 0, min: 0, max: 0 });
                } else if (bizConfig.Display.ChartType == "Thermometer") {
                    dataChart.generateTemperatureChart(chartContainer, bizConfig, { value: 0, min: 0, max: 0 });
                }

            };
        },
        showGridWindow: function (winType) {
            let boxSettings = _formulaConfig.Settings.filter(item => item.WindowType == winType);
            if (!boxSettings || boxSettings.length == 0) return;

            if (document.getElementById(fn.generateWindowId(winType, 0))) {
                return;
            }

            let boxSetting = boxSettings[0];
            //生成样式
            let style = fn.parseBoxStyle(boxSetting);
            //生成窗体
            let subWindow = fn.openBoxWindow(style, boxSetting, 0);
            //生成图表容器
            let chartContainer = fn.generateChartContainer(boxSetting.Display, subWindow);
            if (winType === _boxType.Message) {
                dataChart.generateMessageGrid(chartContainer, boxSetting.Display, []);
            } else if (winType === _boxType.Time) {
                dataChart.generateTimeGrid(chartContainer, boxSetting, null);
            } else if (winType === _boxType.Report) {
                dataChart.generatePostureReport(chartContainer, boxSetting, null);
            } else if (winType === _boxType.Chart) {
                dataChart.generatePostureChart(chartContainer, boxSetting, null);
            }
        }
    };
    Plugins.add(Aerospace);
})();
