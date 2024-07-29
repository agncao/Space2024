(function () {
    //获取平台管理对象
    const yyastk = window.getYYASTK();
    //获取当前场景管理对象
    const currentScenario = yyastk.CurrentScenario;
    const _parentContainer = document.getElementById('cesiumContainer');
    const _boxType = {
        Time: "Time",
        Message: "Message",
        Business: "Business",
        Report: "Report",
        Chart: "Chart",
        Header: "Header"
    }
    let _formula = null;
    let _postureChartType = { Time: { id: 0, name: 'time' } };
    let _messageList = [];
    let _echartsColors = ['#ff6600', '#da70d6', '#82c55e', '#c7353a', '#f5b91f', '#d3eaf3', '#b91c1c', '#e26021', '#743ad5'];
    let _echartsxAxisNum = 5;
    let _postureEChartOptions = [];
    let _echartsSerieDataLength = 500;
    const basePath = '/plugins/aerospace';

    const fn = {
        initFormulaConfig: function (config) {
            config.timeSettings = [];
            config.bizSettings = [];
            config.messageSettings = [];
            config.postureReportSettings = [];
            config.postureChartSettings = [];
            config.headerSettings = [];
            if (!config || !config.Settings) return;
            for (let i = 0; i < config.Settings.length; i++) {
                let item = config.Settings[i];
                if (item.WindowType == _boxType.Time) {
                    config.timeSettings.push(item);
                } else if (item.WindowType == _boxType.Business) {
                    config.bizSettings.push(item);
                } else if (item.WindowType == _boxType.Message) {
                    config.messageSettings.push(item);
                } else if (item.WindowType == _boxType.Report) {
                    config.postureReportSettings.push(item);
                } else if (item.WindowType == _boxType.Chart) {
                    config.postureChartSettings.push(item);
                } else if (item.WindowType == _boxType.Header) {
                    config.headerSettings.push(item);
                }
            }
            config.Settings = [];
            return config;
        },
        parseBoxStyle: function (setting) {
            let displaySetting = setting.Display;
            let result = {};
            result.offset = displaySetting.Box.Offset && displaySetting.Box.Offset.length > 1 ? [displaySetting.Box.Offset[0], displaySetting.Box.Offset[1]] : [0, 0];
            result.area = displaySetting.Box.Area && displaySetting.Box.Area.length > 1 ? [displaySetting.Box.Area[0], displaySetting.Box.Area[1]] : [450, 0];
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
            //得到标题的高度
            let titleDivId = parentWin.id + '_title';
            let titleDiv = document.getElementById(titleDivId);
            let titleHeight = titleDiv ? titleDiv.offsetHeight : 0;
            //得到parentWin的高度
            let parentWinHeight = parentWin.offsetHeight - titleHeight;
            let parentWinWidth = parentWin.offsetWidth;
            let offset = [0, 0];
            if (display.Content.Offset && display.Content.Offset.length > 0) {
                offset[0] = display.Content.Offset[0];
            }
            if (display.Content.Offset && display.Content.Offset.length > 1) {
                offset[1] = display.Content.Offset[1];
            }
            let area = ['100%', '100%'];
            if (!display.Content.Area || display.Content.Area.length == 0) {
                area[0] = parseInt((parentWinWidth - 2 * offset[1]) * 100 / parentWinWidth) + '%';
                area[1] = parseInt((parentWinHeight - offset[0]) * 100 / parentWinHeight) + '%';
            }
            if (display.Content.Area && display.Content.Area.length > 0) {
                if (typeof (display.Content.Area[0]) !== 'number') {
                    area[0] = display.Content.Area[0];
                } else {
                    area[0] = parseInt(display.Content.Area[0] * 100 / parentWinWidth) + '%';
                }
            }
            if (display.Content.Area && display.Content.Area.length > 1) {
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
            // 这 c# 代码中 area 如果设置成 [0,0]，就不设置绝对定位了，可以让父元素自适应高度
            if (style.area[1] != '0%' && style.area[1] != 0) {
                div.setAttribute("style", "position:absolute;top:" + style.offset[0]
                    + ";left:" + style.offset[1]
                    + ";width:" + style.area[0] + ";height:"
                    + style.area[1] + ";");
            }

            div.setAttribute("class", display.Content.Class);
            parentWin.appendChild(div);
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
            div.setAttribute("data-index", index);
            _parentContainer.appendChild(div);

            $(div).css({
                position: "absolute",
                top: style.offset[0],
                left: style.offset[1],
                width: style.area[0],
                height: style.area[1]
            });
            $(div).addClass(item.Display.Box.Class);

            // 如果在 c# 代码中 area 设置成了 []，则表示需要父元素自适应高度
            // 移除 div style 中的 height 属性
            if (style.area[1] == 0) {
                div.style.removeProperty('height');
            }

            // 生成 title
            if (needTitle) {
                let titleDiv = document.createElement("div");
                titleDiv.setAttribute('id', divId + '_title');
                titleDiv.setAttribute('class', 'data-title');
                const titleTextDiv = document.createElement('div')
                titleTextDiv.setAttribute('class', 'data-title-text')

                titleTextDiv.innerHTML = '<b class="data-title-left">[</b><span>' + item.Display.Box.Name + '</span><b class="data-title-right">]</b>';
                titleDiv.appendChild(titleTextDiv)
                const titleLineBoxDiv = document.createElement('div')
                titleLineBoxDiv.setAttribute('class', 'data-title-line-box')
                const titleLinePointDiv = document.createElement('div')
                titleLinePointDiv.setAttribute('class', 'data-title-line-point')
                const titleLineDiv = document.createElement('div')
                titleLineDiv.setAttribute('class', 'data-title-line')
                titleLineBoxDiv.appendChild(titleLinePointDiv)
                titleLineBoxDiv.appendChild(titleLineDiv)
                titleDiv.appendChild(titleLineBoxDiv)
                div.appendChild(titleDiv);
                // 四个角
                const circle1 = document.createElement('div')
                circle1.setAttribute('class', 'circle1')
                const circle2 = document.createElement('div')
                circle2.setAttribute('class', 'circle2')
                const circle3 = document.createElement('div')
                circle3.setAttribute('class', 'circle3')
                const circle4 = document.createElement('div')
                circle4.setAttribute('class', 'circle4')
                div.appendChild(circle1)
                div.appendChild(circle2)
                div.appendChild(circle3)
                div.appendChild(circle4)
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
        },
        getFormulaFileName: function (fileName) {
            return fileName.concat(".json");
        }
    };

    const dataParser = {
        onReceiveSpaceData: function (spaceData) {
            if (!_formula || !currentScenario.dataSource) return;

            // let spaceData = JSON.parse(msg);
            let bizzList = spaceData && spaceData.Bizz ? spaceData.Bizz : [];
            let messageList = spaceData && spaceData.Logs ? spaceData.Logs : [];
            messageList.forEach(item => {
                item.AppId = spaceData.AppId;
                item.AppName = spaceData.AppName;
            });
            dataParser.parseBizzData(bizzList);
            dataParser.parseMessageData(messageList);
            dataParser.parsePostureData(spaceData);
        },
        parseMessageData: function (messageList) {
            let messageConfigArray = _formula.messageSettings;
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
            let bizConfigArray = _formula.bizSettings;
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
            let reportSettings = _formula.postureReportSettings;
            let chartSettings = _formula.postureChartSettings;
            if ((!reportSettings || reportSettings.length == 0)
                && (!chartSettings || chartSettings.length == 0))
                return;

            if (!postureData.entities) return;


            let signalRDataAdapter = Cesium.DataAdapter.get(_formula.Parser);
            // signalRDataAdapter.rtNetWork = Cesium.RTNetWork;
            // signalRDataAdapter.rtNetWork.noFindCreate = true;
            // signalRDataAdapter.rtNetWork.dataSource = currentScenario.dataSource;
            // signalRDataAdapter.parse(postureData);

            dataChart.generateTimeGrid(signalRDataAdapter.startJd, signalRDataAdapter.dataJd);
            if (reportSettings && reportSettings.length > 0) {
                dataParser.doPostureReportData(signalRDataAdapter, reportSettings);
            }
            if (chartSettings && chartSettings.length > 0) {
                dataParser.doPostureChartData(signalRDataAdapter, chartSettings);
            }
        },
        doPostureReportData: function (signalRDataAdapter, settings) {
            for (var i = 0; i < settings.length; i++) {
                let setting = settings[i];
                try {
                    let entityType = fn.getEntityType(setting.EntityId);
                    let realTimeEntity = currentScenario.dataSource.getRealTimeEntity(setting.EntityId);
                    let reportObj = Cesium.RGData.getReportAndGraphStyles(entityType, "Report", setting.ReportName);

                    let result = { entity: realTimeEntity, jdTime: signalRDataAdapter.dataJd, timeStep: 1, res: null, dataIndex: i };
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
                    console.error("windowType:", setting.WindowType,
                        "; entityId:", setting.EntityId,
                        "; reportName:", setting.ReportName,
                        "; err:", err);
                }
            }
        },
        doPostureChartData: function (signalRDataAdapter, settings) {
            for (var i = 0; i < settings.length; i++) {
                let setting = settings[i];
                try {
                    let entityType = fn.getEntityType(setting.EntityId);
                    let realTimeEntity = currentScenario.dataSource.getRealTimeEntity(setting.EntityId);
                    let rgGraph = Cesium.RGData.getReportAndGraphStyles(entityType, "Graph", setting.ReportName);
                    let result = { entity: realTimeEntity, jdTime: signalRDataAdapter.dataJd, timeStep: 1, res: null, dataIndex: i };
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
        }
    };
    let dataChart = {
        generateMessageGrid: function (divContent, display, messageList) {
            if (!divContent) {
                let box = document.getElementById(fn.generateWindowId(_boxType.Message, 0));
                if (!box) return;
                divContent = document.getElementById(fn.generateChartContainerId(box, 0));
            }
            _messageList.push(...messageList);
            while (_messageList.length > 6) {
                _messageList.shift(); // 如果数组长度超过5，移除最旧的元素
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

            _messageList.forEach(row => {
                let tbodyTr = document.createElement("tr");
                for (let item of display.Items) {
                    let tbodyTd = document.createElement("td");
                    const content = row[item.Id];
                    // 如果 content 中包括 info,warn,error 则生成一张图片
                    if (content.includes("info") || content.includes("warn") || content.includes("error")) {
                        const img = document.createElement("img");
                        if (content.includes("info")) {
                            img.src = basePath + "/images/info.svg";
                        } else if (content.includes("warn")) {
                            img.src = basePath + "/images/warning.svg";
                        } else {
                            img.src = basePath + "/images/error.svg";
                        }
                        img.style.width = "16px";
                        img.style.height = "16px";
                        tbodyTd.appendChild(img);
                    } else {
                        tbodyTd.innerText = content;
                    }
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
        generateTimeGrid: function (startJd, currentJd) {
            if (!currentJd || !startJd) return;
            if (!_formula || _formula.timeSettings.length == 0) return;

            //将sendTimeStamp转换成时间对象
            let currentDate = Cesium.JulianDate.toDate(currentJd);
            let startDate = _formula.EpochStartTime ?
                moment(_formula.EpochStartTime, "YYYY-MM-DD HH:mm:ss").toDate() :
                Cesium.JulianDate.toDate(startJd);


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
                if (items[0].toUpperCase().indexOf("UTC") > -1 || items[0].toUpperCase().indexOf("UTCG") > -1) {
                    innerText = currentDate.toISOString();
                    innerText = "UTC: " + innerText;
                } else if (items[0].toUpperCase() === "EPSEC") {
                    let precision = timeSetting.Precision ? timeSetting.Precision : 0;
                    let epochSeconds = (currentDate.getTime() - startDate.getTime()) / 1000;
                    innerText = parseFloat(epochSeconds.toFixed(precision));
                    innerText = "场景时间: " + innerText + "秒";
                }
                firstTd.text(innerText);
            }
            //
        },
        generateHeader: function (divContent, setting) {
            const title = setting.Name || setting.Display.Box.Name
            if (divContent) {
                // 增加一个 img 背景图片
                const imgDiv = document.createElement("div");
                imgDiv.className = "title-img";
                divContent.appendChild(imgDiv);

                // 创建 text div
                const textDiv = document.createElement("div");
                textDiv.className = "title-text";
                textDiv.textContent = title;
                divContent.appendChild(textDiv);

                const leftLine = document.createElement("div");
                leftLine.className = "left-line";
                _parentContainer.appendChild(leftLine);

                const rightLine = document.createElement("div");
                rightLine.className = "right-line";
                _parentContainer.appendChild(rightLine);

                const bottomLine = document.createElement("div");
                bottomLine.className = "bottom-line";
                _parentContainer.appendChild(bottomLine);

            } else {
                console.warn("generateHeader divContent is null");
            }
        },
        generateGaugeChart: function (divContent, setting, bizData) {
            let gaugeChart = echarts.init(divContent);
            let chartOptions = {
                series: [
                    {
                        name: setting.Display.Items[0].Label,
                        type: 'gauge',
                        splitNumber: (bizData.max - bizData.min) / 10,
                        axisLine: {            // 坐标轴线
                            lineStyle: {       // 属性lineStyle控制线条样式
                                color: [[0.2, '#00fff3'], [0.8, '#FFC107'], [1, '#DC3545']],
                                width: 16
                            }
                        },
                        axisTick: {
                            distance: -16,
                            length: 8,
                            lineStyle: {
                                color: '#fff',
                                width: 1
                            }
                        },
                        splitLine: {
                            distance: -16,
                            length: 16,
                            lineStyle: {
                                color: '#fff',
                                width: 2
                            }
                        },
                        axisLabel: {
                            color: 'inherit',
                            distance: -20,
                            fontSize: 14
                        },
                        title: {
                            show: false,
                            // offsetCenter: [0, '-10%'],
                            fontSize: 16
                        },
                        pointer: {
                            itemStyle: {
                                color: 'inherit'
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
                let box = document.getElementById(fn.generateWindowId(_boxType.Report, reportResult.dataIndex));
                if (!box) return;
                divContent = document.getElementById(fn.generateChartContainerId(box, reportResult.dataIndex));
            }
            if (!reportResult || !reportResult.res) return;
            let dData = reportResult.res;

            // 创建表格元素
            let table = document.getElementById(fn.getContentTableId(divContent, _boxType.Report));
            if (!table) {
                table = document.createElement("table");
                table.id = fn.getContentTableId(divContent, _boxType.Report);
                divContent.appendChild(table);
            }

            // 创建并设置 colgroup
            let colgroup = document.querySelector("#" + table.id + " tbody");
            if (!colgroup) {
                let caption = document.createElement("caption");
                // 为caption设置样式
                caption.style.background = "#043272";
                caption.style.padding = "8px 0";
                caption.style.fontWeight = "800";
                caption.style.color = "#febc21"
                caption.innerText = reportResult.entity.name;
                table.appendChild(caption);
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
                    if (i != dData.titles.length - 1) {
                        // 给 tr 设置样式
                        tr.style.borderBottom = "1px solid rgba(255,255,255,0.4)";
                    }
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
                let box = document.getElementById(fn.generateWindowId(_boxType.Chart, graphResult.dataIndex));
                if (!box) return;
                divContent = document.getElementById(fn.generateChartContainerId(box, graphResult.dataIndex));
            }
            if (!graphResult || !graphResult.res) return;

            for (const key in graphResult.res) {
                //如果result不是对象就 continue
                if (typeof graphResult.res[key] !== 'object') continue;
                // 使用正则表达式匹配键名
                const match = key.match(/^y(\d*)$/);
                if (match) {    // y轴
                    dataChart.setPostureYAxisAndSeries(graphResult, key, setting);
                } else {    // x轴
                    dataChart.setPostureXAxis(graphResult, key);
                }
            }

            var charts = echarts.init(divContent);
            //{chartType:0,y:{....values:[{经度}{纬度}]},y2:{}}
            let option = _postureEChartOptions[graphResult.dataIndex];
            option.title.text = graphResult.entity.name;
            option && charts.setOption(option);
        },
        /**
         * 设置姿态统计图的echart x轴
         * @param {*} graphResult 
         * @param {*} key 
         */
        setPostureXAxis: function (graphResult, key) {
            let xRes = graphResult.res[key];
            let chartOption = _postureEChartOptions[graphResult.dataIndex];
            if (!chartOption.xAxis) {
                chartOption.xAxis = {
                    type: key,
                    data: [],
                    axisLine: {
                        lineStyle: {
                            color: '#ffffff' //'#93FE94' // x轴线的颜色
                        }
                    },
                    splitLine: { show: false }
                }
            }
            chartOption.xAxis.type = key;
            let xdata = xRes.values ? xRes.values : null;
            let xVal = xdata && xdata.values && xdata.values.length > 0 ? xdata.values[0] : null;
            chartOption.xAxis.data.push(xVal);
            _postureEChartOptions[graphResult.dataIndex] = chartOption;
        },
        /**
         * 设置姿态统计图的echart y轴和series
         * @param {*} graphResult 
         * @param {*} key 
         */
        setPostureYAxisAndSeries: function (graphResult, key, setting) {
            let ydata = graphResult.res[key];
            let yList = ydata ? ydata.values : [];
            if (yList.length > 2) {
                // debugger;
            };
            let chartOption = _postureEChartOptions[graphResult.dataIndex];
            if (!chartOption) return;

            let findedIndex = -1;
            let currentYi = 0;
            for (let yi = 0; yi < yList.length; yi++) {
                for (let i = 0; i < chartOption.yAxis.length; i++) {
                    let yAxis = chartOption.yAxis[i];
                    if (yAxis.yKey === key && yAxis.yi === yi) {
                        findedIndex = i;
                        currentYi = yi;
                        break;
                    }
                }

                if (findedIndex === -1) {
                    let yIndex = chartOption.yAxis.length;
                    yAxis = { type: 'value' };
                    yAxis.axisLine = {
                        lineStyle: {
                            color: '#ffffff'
                        }
                    };
                    yAxis.axisLabel = {
                        color: '#ffffff'
                    };
                    yAxis.splitLine = { show: false };
                    yAxis.name = graphResult.res[key].title;
                    yAxis.position = yIndex === 0 ? 'left' : 'right';
                    yAxis.yKey = key;
                    yAxis.yi = currentYi;
                    chartOption.yAxis.push(yAxis);
                }
            }

            this.setPostureSeries(graphResult, key, setting);

            for (let i = 0; i < chartOption.yAxis.length; i++) {
                let yAxis = chartOption.yAxis[i];
                let yScale = this.getPostureYScale(graphResult, yAxis.yKey, yAxis.yi);
                if (yScale) {
                    yAxis.min = yScale.min;
                }
                chartOption.yAxis[i] = yAxis;
            }
            _postureEChartOptions[graphResult.dataIndex] = chartOption;
        },

        /**
         * 设置姿态统计图的echart series
         * @param {*} res 
         * @param {*} key 
         * 如果key==='y',match[1] 将是空字符串，这时 index 将保持为 0。
         *      如果key为y{数字}，如 y2，则 match[1] 为 2，index 将被设置为 2 - 1 = 1
         */
        setPostureSeries: function (graphResult, key, setting) {
            let ydata = graphResult.res[key];
            let chartOption = _postureEChartOptions[graphResult.dataIndex];
            let y = ydata ? ydata.values : [];
            for (let yi = 0; yi < y.length; yi++) {
                let isSeriesFinded = false;
                if (chartOption.series.length > 0) {
                    for (let j = 0; j < chartOption.series.length; j++) {
                        if (chartOption.series[j].yKey === key && chartOption.series[j].yi === yi) {
                            dataChart.doSetPostureSeries(graphResult, key, yi, j, setting);
                            isSeriesFinded = true;
                            break;
                        }
                    }
                }
                if (!isSeriesFinded) {
                    dataChart.initPostureSeries(graphResult, key, yi);
                }
            }
            _postureEChartOptions[graphResult.dataIndex] = chartOption;
        },
        /**
         * 获取姿态统计图的echart y轴刻度
         * @param {*} graphResult 
         * @param {*} yKey 
         * @param {*} yi 
         * @returns 
         */
        getPostureYScale: function (graphResult, yKey, yi) {
            let chartOption = _postureEChartOptions[graphResult.dataIndex];
            if (!chartOption) return;

            let res = {
                min: null,
                max: null
            };

            let series = chartOption.series;
            let yKeySeries = series.filter(serie => serie.yKey === yKey);
            if (yKeySeries.length <= 0) return null;

            let serie = yKeySeries[yi];

            for (let j = 0; j < serie.data.length; j++) {
                let valObj = typeof (serie.data[j]) === 'object' ? serie.data[j].value : serie.data[j];
                let val = valObj && valObj.length > 1 ? parseFloat(valObj[1]) : parseFloat(valObj);
                if (res.min === null || val < res.min) {
                    res.min = val;
                }
                if (res.max === null || val > res.max) {
                    res.max = val;
                }
            }
            return res;
        },
        /**
         * 设置姿态统计图的echart series
         * @param {*} res 
         * @param {*} key 
         * @param {*} yi 
         * @param {*} seriesIndex 
         */
        doSetPostureSeries: function (graphResult, key, yi, seriesIndex, setting) {
            let res = graphResult.res;
            let y = res[key].values;
            let chartOption = _postureEChartOptions[graphResult.dataIndex];
            if (!chartOption) return;
            if (res.chartType === _postureChartType.Time.id) {
                let scaleCount = setting.XScaleCount || _echartsSerieDataLength;
                if (scaleCount < chartOption.series[seriesIndex].data.length) {
                    chartOption.series[seriesIndex].data.shift();

                }
                let timeValue = this.getPostureChartTimeValue(res, false);
                let seriesData = { name: timeValue, value: [timeValue, y[yi].values[0]] };
                chartOption.series[seriesIndex].data.push(seriesData);
            } else {
                chartOption.series[seriesIndex].data.push(y[yi].values[0]);
            }
            _postureEChartOptions[graphResult.dataIndex] = chartOption;
        },

        /**
         * 初始化姿态统计图的echart series
         * @param {*} graphResult 
         * @param {*} key 
         * @param {*} yi 当前Y轴中也可能包含多个值，yi表示当前Y轴的第{n}个值
         */
        initPostureSeries: function (graphResult, key, yi) {
            let res = graphResult.res;
            let chartOption = _postureEChartOptions[graphResult.dataIndex];
            if (!chartOption) return;

            let ydata = res[key];
            let y = ydata.values;
            let series = { name: y[yi].title, type: 'line', dimensionName: y[yi].dimensionName, data: [], yKey: key, yi: yi };
            if (res.chartType === _postureChartType.Time.id) {
                let timeValue = this.getPostureChartTimeValue(res, false);
                series.data.push({ name: timeValue, value: [timeValue, y[yi].values[0]] });
            } else {
                series.data = [y[yi].values[0]];
            }
            chartOption.series.push(series);
            let legendIndex = chartOption.legend.data.length;
            chartOption.legend.data.push(y[yi].title);
            chartOption.color.push(_echartsColors[legendIndex]);
            _postureEChartOptions[graphResult.dataIndex] = chartOption;
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


    const Aerospace = {
        id: "Plugins_aerospace",
        menu: {
            click: function (ele) {
                //如果没登录则提示登录
                if (!userViewerModel.isLogin) {
                    layer.msg('请先登录', {
                        icon: 0, // 图标类型，0表示警告图标
                        offset: 't', // 显示在屏幕顶部
                        time: 2000 // 显示时间（毫秒）
                    });
                    return;
                }
                // 获取方案
                HttpClient.build().get(
                    '/m/pluginFile/getFiles?pluginId=aerospace' + '&folder=data' + '&name=',
                    Aerospace,
                    "afterFormulaReceived"
                );
            }
        },
        /**
         * 接收数据，显示表格
         * @param {*} arr json数据 array
         */
        afterFormulaReceived: function (arr) {
            arr = arr.result;
            const newArr = arr.map(item => {
                return {
                    id: item.name,
                    name: item.name,
                    localTime: new Date(item.time).toLocaleString(),
                    ...item
                }
            })

            let self = this;
            let width = 660;
            openNewLayerIndex = layer.open({
                type: 1,
                title: ['太空态势方案选择', 'color:#fff;'],
                shadeClose: true,
                shade: false,
                area: [width + 'px', '400px'], // 宽高
                offset: ['140px', ($(window).width() - width) / 2 + 'px'],
                success: function (layero, index) {
                    self.loadFormulaWindow(newArr);
                },
                content: $('#plugins_aerospace_container'),
                anim: -1, // 0-6 的动画形式，-1 不开启
                btn: [],
            });
        },
        /**
         * 加载方案
         * @param {*} data 
         */
        loadScenario: function (data) {
            if (!currentScenario.dataSource) {
                let today = data.EpochStartTime ? moment.utc(data.EpochStartTime).toDate() : new Date();
                let nextDay = moment(today).add(1, 'days');
                let utcStart = moment(today).utc().format();
                let utcEnd = moment(nextDay).utc().format();
                let option = {
                    name: data.ScenarioName,
                    centralBody: data.CentralBody,
                    startTime: utcStart,
                    endTime: utcEnd,
                    id: data.Id,
                    uploader: { id: userViewerModel.userId },
                    description: data.Description,
                    globalAttribute: {
                        DIS: {
                            Entity: {
                                noFindCreate: true,
                                Connection: {
                                    url: data.Host,
                                    dataAdapter: data.Parser
                                }
                            }
                        }
                    }
                };
                currentScenario.createScene(option).then(ret => {
                    this.setDataAdapterHandler(data.Parser);
                });
            } else {
                this.setDataAdapterHandler(data.Parser);
            }
        },
        setDataAdapterHandler: function (dataAdapter) {
            const signalRDataAdapter = Cesium.DataAdapter.get(dataAdapter);
            signalRDataAdapter.messageHandler = (data) => {
                if (!signalRDataAdapter.startJd) {
                    if (_formula.EpochStartTime) {
                        let time = _formula.EpochStartTime.replace("UTCG", "");
                        signalRDataAdapter.startJd = Cesium.JulianDate.fromIso8601(time);
                    } else {
                        signalRDataAdapter.startJd = signalRDataAdapter.dataJd;
                    }
                }
                dataParser.onReceiveSpaceData(data);
            }
        },

        openFormulaWindow: function (formulaData, updateName) {
            const _this = this;
            layer.open({
                type: 1,
                title: ['更新方案', 'color:#fff;'],
                shadeClose: true,
                shade: false,
                area: ['600px', '900px'], // 宽高
                success: function (layero, index) {
                    let formulaTree = new FormulaTree();
                    formulaTree.render(formulaData);
                    // 添加事件
                    formulaTree.addEvent(updateName, formulaTree.event.apply, (formulaData) => {
                        _this.removeSubWindows();
                        _this.showSubWindows(formulaData[0]);
                        _this.loadScenario(formulaData[0]);
                    });
                },
                content: $('#json-editor'),
            });
        },

        formulaSettingWindow: function (parentLayerIndex) {
            let self = this;
            let width = 700;
            openNewLayerIndex = layer.open({
                type: 1,
                title: ['太空态势方案选择', 'color:#fff;'],
                shadeClose: true,
                shade: false,
                area: [width + 'px', '800px'], // 宽高
                offset: ['140px', ($(window).width() - width) / 2 + 'px'],
                success: function (layero, index) {
                    layer.close(parentLayerIndex);
                    let fs = new FormulaSetting();
                    fs.renderTree();
                },
                content: $('#plugins_aerospace_container'),
                anim: -1, // 0-6 的动画形式，-1 不开启
                btn: [],
            });
        },

        uploadFormulaWindow: function () {
            const _this = this;
            const uploadFileName = document.getElementById('upload-formula-select-label');
            const fileNameInput = document.getElementById('upload-formula-input');
            let fileContent = '';
            const uploadFormulaBtn = document.getElementById('upload-select-btn');
            const uploadInput = document.getElementById('upload-formula-select-input');
            const uploadBtn = document.getElementById('upload-formula-btn');

            function handleuploadFormulaBtnClick() {
                uploadInput.click();
            }

            function handleUploadInputChange(event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        fileContent = e.target.result;
                        uploadFileName.innerText = `选择的文件名: ${file.name}`;
                    };
                    reader.readAsText(file);
                }
            }

            function handleUploadBtnClick() {
                // 获取 fileNameInput 的值
                const fileName = fileNameInput.value;
                if (!fileName) {
                    layer.msg('请输入文件名', {
                        icon: 0, // 图标类型，0表示警告图标
                        offset: 't', // 显示在屏幕顶部
                        time: 2000 // 显示时间（毫秒）
                    });
                    return
                }
                if (!fileContent) {
                    layer.msg('请选择文件', {
                        icon: 0, // 图标类型，0表示警告图标
                        offset: 't', // 显示在屏幕顶部
                        time: 2000 // 显示时间（毫秒）
                    });
                    return
                }

                // 校验 json 格式 fileContent
                try {
                    const json = JSON.parse(fileContent);
                    // 上传文件
                    // 校验成功后，将 fileName 文件名和 fileContent 传给后端
                    const data = {
                        name: fn.getFormulaFileName(fileName),
                        pluginId: 'aerospace',
                        folder: 'data',
                        content: fileContent,
                    };
                    $.post(ctx + '/m/pluginFile/uploadFile', data, function (ret) {
                        if (ret.messageType === 'SUCCESS') {
                            layer.msg("上传成功");
                        } else {
                            layer.msg('上传失败:' + ret.content);
                        }
                    });
                } catch (e) {
                    layer.msg('文件内容格式不正确', {
                        icon: 0, // 图标类型，0表示警告图标
                        offset: 't', // 显示在屏幕顶部
                        time: 2000 // 显示时间（毫秒）
                    });
                }
            }

            uploadFormulaLayerIndex = layer.open({
                type: 1,
                title: ['上传方案', 'color:#fff;'],
                shadeClose: true,
                shade: false,
                area: ['600px', '400px'], // 宽高
                success: function (layero, index) {
                    // 点击选择文件，弹出文件选择框
                    uploadFormulaBtn.addEventListener('click', handleuploadFormulaBtnClick);
                    // 为 input 添加 change 事件监听器
                    uploadInput.addEventListener('change', handleUploadInputChange);
                    uploadBtn.addEventListener('click', handleUploadBtnClick);

                },
                end: function () {
                    // 清除数据
                    fileNameInput.value = '';
                    uploadFileName.innerText = '选择的文件名: ';
                    fileContent = '';
                    // 移除现有的事件监听器
                    uploadFormulaBtn.removeEventListener('click', handleuploadFormulaBtnClick);
                    uploadInput.removeEventListener('change', handleUploadInputChange);
                    uploadBtn.removeEventListener('click', handleUploadBtnClick);
                },
                content: $('#upload-formula-container'),
            });
        },
        /**
         * 新建方案窗口
         */
        newFormulaWindow: function (formulaArr) {
            const _this = this;
            layer.open({
                type: 1,
                title: ['新建方案', 'color:#fff;'],
                shadeClose: true,
                shade: false,
                area: ['600px', '900px'], // 宽高
                success: function (layero, index) {
                    let formulaTree = new FormulaTree();
                    // formulaTree.render(formulaTree.getTemplate());
                    formulaTree.newFormulaByTemplate(formulaArr).then(template => {
                        formulaTree.render(template);
                        // 添加事件
                        formulaTree.addEvent(null, formulaTree.event.apply, (template) => {
                            _this.removeSubWindows();
                            _this.showSubWindows(template[0]);
                            _this.loadScenario(template[0]);
                        });
                    });
                },
                content: $('#json-editor'),
            });
        },
        /**
         * 加载方案窗口
         * @param {*} arr 
         */
        loadFormulaWindow: function (arr) {
            let layerIndex = 0
            const closeLayer = () => {
                layer.closeLast()
            }
            const _this = this;
            layerIndex = layer.open({
                type: 1,
                title: ['太空态势方案选择', 'color:#fff;'],
                shadeClose: true,
                shade: false,
                area: ['760px', '300px'], // 宽高
                offset: ['140px', ($(window).width() - 450) + 'px'],
                success: function (layero, index) {
                    layui.use('table', function () {
                        var table = layui.table;
                        var form = layui.form;

                        // 初始化表格
                        table.render({
                            elem: '#data_table',
                            even: true, // 启用斑马纹效果
                            cols: [[
                                { field: 'name', title: 'ID', hide: true },
                                { field: 'name', title: '方案名称' },
                                { field: 'localTime', title: '最后修改时间' },
                                { title: '操作', toolbar: '#deleteBtnTpl', width: 100 } // 添加操作列
                            ]],
                            data: arr
                        });

                        // 行单击事件( 双击事件为: rowDouble )
                        table.on('row(data_table)', function (obj) {
                            obj.setRowChecked({
                                type: 'radio' // radio 单选模式；checkbox 复选模式
                            });
                        });

                        // 处理删除按钮点击事件
                        table.on('tool(data_table)', function (obj) {
                            const currentData = obj.data; // 获取当前行数据
                            const fileName = fn.getFormulaFileName(currentData.name);
                            const layEvent = obj.event; // 获取 lay-event 对应的值
                            if (layEvent === 'delete') {
                                layer.confirm('确定删除这行吗？', function (index) {
                                    // 发送请求到服务器删除数据
                                    $.get('/m/pluginFile/delFile?pluginId=aerospace&folder=data&name=' + fileName, function (ret) {
                                        if (ret.messageType == "SUCCESS") {
                                            layer.msg("删除成功！");
                                            obj.del(); // 删除对应行（tr）的DOM结构，并更新缓存
                                            layer.close(index);
                                        } else {
                                            layer.msg(ret.content);
                                        }
                                    });
                                });
                            }
                        });

                        // 上传方案
                        document.getElementById('uploadBtn').onclick = function () {
                            closeLayer();
                            _this.uploadFormulaWindow();
                        }

                        // 新建方案
                        document.getElementById('formulaBtn').onclick = function () {
                            closeLayer();
                            _this.newFormulaWindow(arr);
                        }

                        // 打开方案
                        document.getElementById('openBtn').onclick = async function () {
                            // 获取表格的选中行数据
                            var checkedLine = layui.table.checkStatus('data_table');
                            if (checkedLine.data.length > 0) {
                                closeLayer();
                                const lineData = checkedLine.data[0]
                                // 请求方案数据
                                const path = lineData.path + '?t=' + new Date().getTime();
                                const response = await fetch(path);
                                const content = await response.json();
                                const formulaData = [content]
                                const updateName = fn.getFormulaFileName(lineData.name);
                                _this.openFormulaWindow(formulaData, updateName);
                            } else {
                                layui.use('layer', function () {
                                    var layer = layui.layer;
                                    // 显示一个提示框
                                    layer.msg('请选择要打开的方案', {
                                        icon: 0, // 图标类型，0表示警告图标
                                        offset: 't', // 显示在屏幕顶部
                                        time: 3000 // 显示时间（毫秒）
                                    });
                                });
                            }
                        }

                    });

                    // 打开方案
                    document.getElementById('confirmBtn').onclick = async function () {
                        // 获取表格的选中行数据
                        var checkedLine = layui.table.checkStatus('data_table');
                        if (checkedLine.data.length > 0) {
                            const lineData = checkedLine.data[0]
                            const path = lineData.path + '?t=' + new Date().getTime();
                            const response = await fetch(path);
                            const content = await response.json();
                            _this.showSubWindows(content);
                            _this.loadScenario(content);
                            closeLayer()
                        } else {
                            layui.use('layer', function () {
                                var layer = layui.layer;
                                // 显示一个提示框
                                layer.msg('请选择要加载的方案', {
                                    icon: 0, // 图标类型，0表示警告图标
                                    offset: 't', // 显示在屏幕顶部
                                    time: 3000 // 显示时间（毫秒）
                                });
                            });
                        }
                    };
                },
                content: $('#plugins_aerospace_container'),
            });
        },
        /**
         * 移除子窗口
         */
        removeSubWindows: function () {
            // 移除所有的id 为divReport开头的Div层
            const divReports = document.querySelectorAll('div[id^="divReport"]');
            divReports.forEach(div => div.remove());
            // 移除所有的id 为divChart开头的Div层
            const divCharts = document.querySelectorAll('div[id^="divChart"]');
            divCharts.forEach(div => div.remove());
            // 移除所有的id 为divTime开头的Div层
            const divTimes = document.querySelectorAll('div[id^="divTime"]');
            divTimes.forEach(div => div.remove());
            // 移除所有的id 为divMessage开头的Div层
            const divMessages = document.querySelectorAll('div[id^="divMessage"]');
            divMessages.forEach(div => div.remove());
            // 移除所有的id 为divBusiness开头的Div层
            const divBusinesse = document.querySelectorAll('div[id^="divBusiness"]');
            divBusinesse.forEach(div => div.remove());
        },
        /**
         * 显示子窗口
         * @param {*} data 
         */
        showSubWindows: function (data) {
            let self = this;
            _formula = fn.initFormulaConfig(data);
            self.showMultiWindow(_formula.bizSettings);
            self.showMultiWindow(_formula.timeSettings);
            self.showGridWindow(_formula.headerSettings);
            self.showGridWindow(_formula.messageSettings);
            self.showMultiWindow(_formula.postureReportSettings);
            self.showMultiWindow(_formula.postureChartSettings);
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
                    dataChart.generateGaugeChart(chartContainer, setting, { value: 0, min: 0, max: 100 });
                } else if (setting.Display.ChartType == "Thermometer") {
                    dataChart.generateTemperatureChart(chartContainer, setting, { value: 0, min: 0, max: 100 });
                } else if (setting.WindowType === _boxType.Time) {
                    dataChart.initTimeGrid(chartContainer, setting);
                } else if (setting.WindowType === _boxType.Report) {
                    dataChart.generatePostureReport(chartContainer, setting, { dataIndex: i });
                } else if (setting.WindowType === _boxType.Chart) {
                    _postureEChartOptions.push({
                        title: {
                            text: '',
                            left: 'center', // 水平居中
                            top: '26px',     // 垂直顶部
                            textStyle: { color: '#febc21' }
                        },
                        xAxis: null, yAxis: [], series: [],
                        legend: { data: [] }, color: [],
                        axisPointer: {
                            animation: true
                        },
                        tooltip: {
                            trigger: 'axis'
                        },
                        grid: {
                            left: '2px',
                            bottom: '3px',
                            top: '80px',
                            containLabel: true
                        },
                    });
                    dataChart.generatePostureChart(chartContainer, setting, { dataIndex: i });
                }

            };
        },
        showGridWindow: function (boxSettings) {
            if (!boxSettings || boxSettings.length == 0) return;

            if (document.getElementById(fn.generateWindowId(boxSettings[0].WindowType, 0))) {
                return;
            }

            let boxSetting = boxSettings[0];
            //生成样式
            let style = fn.parseBoxStyle(boxSetting);

            //生成窗体
            let subWindow = boxSetting.WindowType === _boxType.Header ?
                fn.openBoxWindow(style, boxSetting, 0, false) :
                fn.openBoxWindow(style, boxSetting, 0, true);
            //生成图表容器
            let chartContainer = fn.generateChartContainer(boxSetting.Display, subWindow);
            if (boxSetting.WindowType === _boxType.Message) {
                dataChart.generateMessageGrid(chartContainer, boxSetting.Display, []);
            } else if (boxSetting.WindowType === _boxType.Header) {
                dataChart.generateHeader(chartContainer, boxSetting);
            }
        }
    };

    // HttpClient.build().get(WebApi.spaceData.formulaUrl, Aerospace, "afterFormulaReceived");
    // HttpClient.build().get('/m/pluginFile/getFiles?pluginId=aerospace' + '&folder=data' + '&name=', Aerospace, "afterFormulaReceived");
    //    远程调用方案
    // SignalRClient.build(WebApi.spaceData.hub).listen("receiveSpaceData", dataParser);
    Plugins.add(Aerospace);
})();
