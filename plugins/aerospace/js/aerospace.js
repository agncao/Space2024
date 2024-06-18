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

    let _formula = {
        timeSettings: [],
        bizSettings: [],
        messageSettings: [],
        postureReportSettings: [],
        postureChartSettings: []
    };
    let _postureChart = { series: [], xAxis: [], yAxis: [], legend: { data: [] } };

    let _postureChartType = { Time: { id: 0, name: 'time' } };

    const fn = {
        init: function (formulaConfig) {
            if (!formulaConfig || !formulaConfig.Settings) return;
            for (let i = 0; i < formulaConfig.Settings.length; i++) {
                let item = formulaConfig.Settings[i];
                if (item.WindowType == _boxType.Time) {
                    _formula.timeSettings.push(item);
                } else if (item.WindowType == _boxType.Business) {
                    _formula.bizSettings.push(item);
                } else if (item.WindowType == _boxType.Message) {
                    _formula.messageSettings.push(item);
                } else if (item.WindowType == _boxType.Report) {
                    _formula.postureReportSettings.push(item);
                } else if (item.WindowType == _boxType.Chart) {
                    _formula.postureChartSettings.push(item);
                }
            }
        },
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
        openBoxWindow: function (style, item, index, needTitle) {
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

            // 生成 title
            if (needTitle) {
                let titleDiv = document.createElement("div");
                titleDiv.setAttribute('id', divId + '_title');
                titleDiv.setAttribute('class', 'data-title');
                div.appendChild(titleDiv);
                titleDiv.innerText = item.Display.Box.Name;
            }

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
            dataChart.generateTimeGrid(spaceData.Posture.time);
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
    let dataChart = {
        generateMessageGrid: function (divContent, display, messageList) {
            if (!divContent) {
                let box = document.getElementById(fn.generateWindowId(_boxType.Message, 0));
                if (!box) return;
                divContent = document.getElementById(fn.generateChartContainerId(box, 0));
            }

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
        initTimeGrid: function (divContent, timeSetting) {
            //生成一个一行两列的table
            let table = document.createElement("table");
            let tbody = document.createElement("tbody");
            table.appendChild(tbody);
            divContent.appendChild(table);

            let items = [];
            items.push(timeSetting.Display.Items);

            let tbodyTr = document.createElement("tr");
            tbody.appendChild(tbodyTr);
            let tbodyTd = document.createElement("td");
            tbodyTr.appendChild(tbodyTd);

            tbodyTd.innerText = items ? items[0] + ": --" : "";
        },
        generateTimeGrid: function (spaceTime) {
            if (!spaceTime) return;
            if (!_formula || _formula.timeSettings.length == 0) return;

            //将sendTimeStamp转换成时间对象
            let spaceBjTime = spaceTime.replace("UTCG", "");
            let time = spaceBjTime ? moment(spaceBjTime) : null;

            for (let i = 0; i < _formula.timeSettings.length; i++) {
                let timeSetting = _formula.timeSettings[i];
                let items = [];
                items.push(timeSetting.Display.Items);
                if (!items) continue;
                let box = document.getElementById(fn.generateWindowId(_boxType.Time, i));
                if (!box) continue;
                divContent = document.getElementById(fn.generateChartContainerId(box, i));
                //用jquery选择divContent里的table下的tbody元素下的tr里的第一个td
                let firstTd = $("#" + divContent.id).find('table > tbody > tr:first-child > td:first-child');
                if (!firstTd) continue;


                let innerText = "--";
                if (!time) return;
                if (items[0].toUpperCase().indexOf("UTC") > -1 || items[0].toUpperCase().indexOf("UTCG") > -1) {
                    innerText = time.utc().format();
                } else if (items[0].toUpperCase() === "EPSEC") {
                    let precision = timeSetting.Precision ? timeSetting.Precision : 0;
                    var dateObj = moment(_formulaConfig.EpochStartTime, "YYYY-MM-DD HH:mm:ss");
                    let epochSeconds = time.valueOf() - dateObj.valueOf();
                    innerText = parseFloat((epochSeconds / 1000).toFixed(precision));;
                } else {
                    innerText = "北京时间: " + time.format("YYYY-MM-DD HH:mm:ss");
                }
                //
                firstTd.text(items[0] + ": " + innerText);
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

        /**
         *  { 
                    min: bizData.min, 
                    max: bizData.max, 
                    current: bizData.value 
                }
                , { min: 0, max: 100, current: 80 }
         * @param {*} divContent 
         * @param {*} setting 
         * @param {*} bizData 
         */
        generateTemperatureChart: function (divContent, setting, bizData) {
            let thermometerChart = ThermometerChart.init(divContent.id);
            thermometerChart.setOption({
                min: bizData.min,
                max: bizData.max,
                current: bizData.value
            });

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
                //如果result不是对象就 continue
                if (typeof graphResult.res[key] !== 'object') continue;
                // 使用正则表达式匹配键名
                const match = key.match(/^y(\d*)$/);
                if (match) {    // y轴
                    dataChart.setPostureYSeries(graphResult.res, key, match);
                } else {    // x轴
                    dataChart.setPostureXAxis(graphResult.res, key);
                }
            }

            //{chartType:0,y:{....values:[{经度}{纬度}]},y2:{}}

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
            console.log("chartOptions: ", chartOptions);
            chart.setOption(chartOptions);
        },
        setPostureXAxis: function (res, key) {
            let xRes = res[key];
            if (_postureChart.xAxis.length <= 0) {   //不存在当前x轴数据
                _postureChart.xAxis = [{ type: '', splitLine: { show: false } }];
            }
            _postureChart.xAxis[0].type = key;
            if (key != _postureChartType.Time.name) {
                let xdata = xRes.values ? xRes.values : null;
                let xVal = xdata && xdata.values && xdata.values.length > 0 ? xdata.values[0] : [];
                _postureChart.xAxis[0].data.push(xVal);
            }
        },
        /**
         * 设置姿态统计图的echart series
         * @param {*} res 
         * @param {*} key 
         * @param {*} ymatch 如果key==='y',match[1] 将是空字符串，这时 index 将保持为 0。
         *      如果key为y{数字}，如 y2，则 match[1] 为 2，index 将被设置为 2 - 1 = 1
         */
        setPostureYSeries: function (res, key, ymatch) {
            let ydata = res[key];
            let index = 0;
            if (ymatch[1]) {
                index = parseInt(ymatch[1], 10) - 1;
            }
            let yAxis = _postureChart.yAxis[index];
            if (!yAxis) {
                yAxis = { type: 'value', boundaryGap: [0, '100%'], splitLine: { show: false }, name: ydata.title, position: index === 0 ? 'left' : 'right' };
                _postureChart.yAxis.push(yAxis);
            }

            let y = ydata ? ydata.values : [];
            for (let i = 0; i < y.length; i++) {
                let isSeriesFinded = false;
                if (_postureChart.series.length > 0) {
                    for (let j = 0; j < _postureChart.series.length; j++) {
                        if (_postureChart.series[j].dimensionName === y[i].dimensionName) {
                            dataChart.doSetPostureYSeries(res, key, i, j);
                            isSeriesFinded = true;
                            break;
                        }
                    }
                }
                if (!isSeriesFinded) {
                    dataChart.initPostureYSeries(res, key, i, index);
                }
            }
        },
        /**
         * 设置姿态统计图的echart series
         * @param {*} res 
         * @param {*} key 
         * @param {*} yIndex 
         * @param {*} seriesIndex 
         */
        doSetPostureYSeries: function (res, key, yIndex, seriesIndex) {
            let y = res[key].values;
            if (res.chartType === _postureChartType.Time.id) {
                if (10 <= _postureChart.series[seriesIndex].data.length) {
                    _postureChart.series[seriesIndex].data.shift();
                }
                let timeValue = dataChart.getPostureChartTimeValue(res, false);
                let seriesData = { name: timeValue, value: [timeValue, y[yIndex].values[0]] };
                _postureChart.series[seriesIndex].data.push(seriesData);
            } else {
                _postureChart.series[seriesIndex].data.push(y[yIndex].values[0]);
            }

        },
        /**
         * 初始化姿态统计图的echart series
         * @param {*} res 
         * @param {*} ydata 
         * @param {*} i 
         */
        initPostureYSeries: function (res, key, i, ymatchIndex) {
            let ydata = res[key];
            let y = ydata.values;
            let series = { name: ydata.title, type: 'line', dimensionName: y[i].dimensionName, data: [] };
            if (y.length === 1) {
                series.yAxisIndex = ymatchIndex;
            }
            if (res.chartType === _postureChartType.Time.id) {
                let timeValue = this.getPostureChartTimeValue(res, false);
                series.data.push({ name: timeValue, value: [timeValue, y[i].values[0]] });
            } else {
                series.data = [y[i].values[0]];
            }
            _postureChart.series.push(series);
            _postureChart.legend.data.push(y[i].title);

        },
        /**
         * 
         * @param {*} res 
         * @param {*} isDate 需要返回日期类型则true，需要返回字符串则false
         * @returns 
         */
        getPostureChartTimeValue: function (res, isDate) {
            let xRes = res[_postureChartType.Time.name]
            let val = xRes.values && xRes.values.values && xRes.values.values.length > 0 ? xRes.values.values[0] : null;
            if (!val) return new Date("1970-01-01 00:00:00");
            let date = new Date(val);
            if (isDate) return date;
            return date.toLocaleString();
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
                fn.init(data);
                self.showMultiWindow(_formula.bizSettings);
                self.showMultiWindow(_formula.timeSettings);
                self.showGridWindow(_formula.messageSettings);
                self.showGridWindow(_formula.postureReportSettings);
                self.showGridWindow(_formula.postureChartSettings);
            });
        },

        showMultiWindow: function (boxSettings) {
            if (!boxSettings || boxSettings.length == 0) return;

            if (document.getElementById(fn.generateWindowId(boxSettings[0].WindowType, 0))) {
                return;
            }
            var i = 0;
            for (let i = 0; i < boxSettings.length; i++) {
                let setting = boxSettings[i];
                //生成样式
                let style = fn.parseBoxStyle(setting);
                //生成窗体
                let subWindow = setting.WindowType === _boxType.Time ?
                    fn.openBoxWindow(style, setting, i, false) :
                    fn.openBoxWindow(style, setting, i, true);
                //生成图表容器
                let chartContainer = fn.generateChartContainer(setting.Display, subWindow);

                if (setting.Display.ChartType == "Gauge") {
                    dataChart.generateGaugeChart(chartContainer, setting, { value: 0, min: 0, max: 0 });
                } else if (setting.Display.ChartType == "Thermometer") {
                    dataChart.generateTemperatureChart(chartContainer, setting, { value: 0, min: 0, max: 0 });
                } else if (setting.WindowType === _boxType.Time) {
                    dataChart.initTimeGrid(chartContainer, setting);
                }

            };
        },
        showGridWindow: function (boxSettings) {
            if (!boxSettings) return;

            if (document.getElementById(fn.generateWindowId(boxSettings[0].WindowType, 0))) {
                return;
            }

            let boxSetting = boxSettings[0];
            //生成样式
            let style = fn.parseBoxStyle(boxSetting);
            //生成窗体
            let subWindow = fn.openBoxWindow(style, boxSetting, 0, true);
            //生成图表容器
            let chartContainer = fn.generateChartContainer(boxSetting.Display, subWindow);
            if (boxSetting.WindowType === _boxType.Message) {
                dataChart.generateMessageGrid(chartContainer, boxSetting.Display, []);
            } else if (boxSetting.WindowType === _boxType.Report) {
                dataChart.generatePostureReport(chartContainer, boxSetting, null);
            } else if (boxSetting.WindowType === _boxType.Chart) {
                dataChart.generatePostureChart(chartContainer, boxSetting, null);
            }
        }
    };
    Plugins.add(Aerospace);
})();
