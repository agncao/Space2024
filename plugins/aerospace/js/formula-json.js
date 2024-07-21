

class FormulaTree {
    constructor() {

        this.jsonDataCopy = [];

        this.initialData = [{
            Id: null,
            Name: "态势展示方案",
            ScenarioName: "航空态势展示",
            Host: "https://localhost:7234/receiver",
            CentralBody: "Earth",
            EpochStartTime: null,
            Parser: "spaceDataParser",
            Description: "航空态势展示",
            Settings: []
        }];

        this.layerui = layui.use(['tree', 'layer'], function () {
            return { tree: layui.tree, layer: layui.layer };
        });
        this.getSettingTemplate = (settingName, windowType, reportName, entityId,
            boxOff, boxArea, contentOff, contentArea,
            items, bizChartType) => {
            let obj = {
                Name: settingName,
                WindowType: windowType,
                EntityId: entityId,
                ReportName: reportName,
                Display: {
                    Box: {
                        Name: reportName,
                        Offset: boxOff,
                        Area: boxArea,
                        Class: "data-layout"
                    },
                    Content: {
                        Offset: contentOff,
                        Area: contentArea,
                        Class: "data-content"
                    }
                }
            }
            if (windowType === "Time") {
                obj.Precision = 3;
                obj.Display.Items = items[0];
                obj.Display.Box.Class = "time-layout";
                obj.Display.Content.Class = "";
            }
            if (windowType === "Message") {
                obj.Display.Box.Class = "data-layout";
                obj.Display.Content.Class = "message";
                obj.Display.Items = items;
            }
            if (windowType === "Business") {
                obj.Display.ChartType = bizChartType;
                obj.Display.Items = items;
            }
            if (windowType === "Header") {
                obj.Display.Box.Class = "page-title-layout";
                obj.Display.Content.Class = "page-title-text-box";
            }
            return obj;
        };
        this.getTemplate = () => {
            let self = this;
            this.initialData[0].Settings.push(self.getSettingTemplate("数据报表-1", "Report", "大地纬度-经度", "Satellite/ICO_G1_32763", [106, -50], [], [], [0, 0]));
            this.initialData[0].Settings.push(self.getSettingTemplate("数据报表-2", "Report", "固定系位置-速度", "Satellite/ICO_G1_32763", [302, -50], [], [32, 4], [0, 0]));
            this.initialData[0].Settings.push(self.getSettingTemplate("数据报表-3", "Report", "惯性系位置、速度", "Satellite/ICO_G1_32763", [610, -50], [], [32, 4], [0, 0]));
            this.initialData[0].Settings.push(self.getSettingTemplate("数据报表-4", "Report", "Beta角度", "Satellite/ICO_G1_32763", [908, -50], [], [32, 4], [0, 0]));
            this.initialData[0].Settings.push(self.getSettingTemplate("数据报表-5", "Report", "Beta角度", "Satellite/ICO_G1_32763", [1168, -50], [], [32, 4], [0, 0]));
            this.initialData[0].Settings.push(self.getSettingTemplate("统计图-1", "Chart", "固定系位置-速度", "Satellite/CARTOSAT-2A_32783", [364, 50], [500, 320], [40, 0], []));
            this.initialData[0].Settings.push(self.getSettingTemplate("统计图-2", "Chart", "Beta角度", "Satellite/CARTOSAT-2A_32783", [714, 50], [500, 320], [40, 0], []));
            this.initialData[0].Settings.push(self.getSettingTemplate("时间-1", "Time", "时间", "", [33, 680], [430, 40], [0, 0], [], ["UTCG"]));
            this.initialData[0].Settings.push(self.getSettingTemplate("时间-2", "Time", "时间", "", [33, -700], [250, 40], [0, 0], [], ["EpSec"]));
            this.initialData[0].Settings.push(self.getSettingTemplate("消息-1", "Message", "消息", "", [1062, 50], [500, 254], [15, 0], [], [
                { Id: "Level", Label: "级别" },
                { Id: "EntityId", Label: "实体Id" },
                { Id: "Content", Label: "内容" },
                { Id: "Time", Label: "消息时间" }
            ]));
            this.initialData[0].Settings.push(self.getSettingTemplate("温度计", "Business", "温度计", "", [120, 312], [238, 216], [32, 0], [], [{ id: "averageTemperature", Label: "平均温度" }], "Thermometer"));
            this.initialData[0].Settings.push(self.getSettingTemplate("温度仪表盘", "Business", "温度计", "", [120, 312], [238, 216], [32, 0], [], [{ id: "enveromentTemperature", Label: "环境温度" }], "Gauge"));
            this.initialData[0].Settings.push(self.getSettingTemplate("航天态势数据大屏", "Header", "", "", [0, 0], ["100%", 100], [4, 4], []));

            let data = JSON.parse(JSON.stringify(this.initialData));
            data[0].Id = (new Date()).getTime();
            return data;
        }

        let self = this;
        this.init = (jsonData) => {
            function getSettingTree(item, setting, index) {
                function arrayToStr(arr) {
                    if (!arr) arr = [];
                    return JSON.stringify(arr);
                }
                function getLeafNode(property, value, idPath = property, valueType = 'key-value') {
                    if (property) {
                        return { title: `${property}: ${value}`, id: `${item.Id}-setting-${index}-${idPath}`, setId: index, nodeType: 'leaf', valueType: valueType };
                    }
                    return { title: `${value}`, id: `${item.Id}-setting-${index}-${idPath}`, setId: index, nodeType: 'leaf', valueType: valueType };
                }
                function getKeyNode(keyword, idPath = keyword) {
                    return { title: `${keyword}`, id: `${item.Id}-setting-${index}-${idPath}`, setId: index, nodeType: 'keyword' };
                }
                function getDisplayChildren() {
                    let res = [];
                    if (setting.WindowType === "Business" || setting.WindowType === "Message") {
                        let node = getKeyNode('Items', 'display-items');
                        node.children = [];
                        for (let i = 0; i < setting.Display.Items.length; i++) {
                            let str = JSON.stringify(setting.Display.Items[i]);
                            node.children.push(getLeafNode(null, str, 'display-items-' + i, 'json'));
                        }
                        res.push(node);
                    }
                    if (setting.WindowType === "Business") {
                        res.push(getLeafNode('ChartType', setting.Display.ChartType, 'display-chartType'));
                    }
                    if (setting.WindowType === "Time") {
                        res.push(getLeafNode('Items', arrayToStr(setting.Display.Items), 'display-items'));
                    }

                    let node = getKeyNode('Box', 'display-box');
                    node.children = [
                        getLeafNode('Name', arrayToStr(setting.Display.Box.Name), 'display-box-name'),
                        getLeafNode('Offset', arrayToStr(setting.Display.Box.Offset), 'display-box-offset'),
                        getLeafNode('Area', arrayToStr(setting.Display.Box.Area), 'display-box-area'),
                        getLeafNode('Class', setting.Display.Box.Class, 'display-box-class'),
                    ];
                    res.push(node);

                    node = getKeyNode('Content', 'display-content');
                    node.children = [
                        getLeafNode('Offset', arrayToStr(setting.Display.Content.Offset), 'display-content-offset'),
                        getLeafNode('Area', arrayToStr(setting.Display.Content.Area), 'display-content-area'),
                        getLeafNode('Class', setting.Display.Content.Class, 'display-content-class'),
                    ];
                    res.push(node);
                    return res;
                }
                let obj = {
                    title: setting.Name || '输入设置名称',
                    id: `${item.Id}-setting-${index}`,
                    setId: index,
                    nodeType: 'node',
                    children: []
                }
                obj.children.push(getLeafNode('WindowType', setting.WindowType));
                if (setting.WindowType === "Report" || setting.WindowType === "Chart") {
                    obj.children.push(getLeafNode('EntityId', setting.EntityId));
                    obj.children.push(getLeafNode('ReportName', setting.ReportName));
                } else if (setting.WindowType === "Time") {
                    obj.children.push(getLeafNode('Precision', setting.Precision));
                }
                let displayNode = getKeyNode('Display');
                displayNode.children = getDisplayChildren();
                obj.children.push(displayNode);

                return obj;
            };

            return jsonData.map(item => {
                let treeData = {
                    title: item.Name || 设置方案名称,
                    id: item.Id,
                    spread: true,
                    nodeType: 'root',
                    children: [
                        { title: `ScenarioName: ${item.ScenarioName}`, id: `${item.Id}-scenarioname`, nodeType: 'leaf' },
                        { title: `Host: ${item.Host}`, id: `${item.Id}-host`, nodeType: 'leaf' },
                        { title: `CentralBody: ${item.CentralBody}`, id: `${item.Id}-centralbody`, nodeType: 'leaf' },
                        { title: `Parser: ${item.Parser}`, id: `${item.Id}-parser`, nodeType: 'leaf' },
                        { title: `Description: ${item.Description}`, id: `${item.Id}-description`, nodeType: 'leaf' },
                        {
                            title: 'Settings',
                            id: `${item.Id}-settings`,
                            nodeType: 'keyword',
                            children: item.Settings.map((setting, index) => getSettingTree(item, setting, index))
                        }
                    ]
                }
                return treeData;
            });
        };

        this.render = (jsonData) => {
            this.jsonDataCopy = JSON.parse(JSON.stringify(jsonData));
            this.layerui.tree.render({
                elem: '#settings-container',
                data: self.init(jsonData),
                showLine: true,
                isJump: true, // 是否允许点击节点时弹出新窗口跳转
                click: function (obj) {
                    var data = obj.data;  //获取当前点击的节点数据
                    if (data.nodeType == 'keyword') {
                        return;
                    }
                    const isKeyValue = data.valueType == 'key-value'
                    console.log("🚀 ~ FormulaTree ~ constructor ~ isKeyValue:", isKeyValue)
                    let index = -1;
                    let itemIndex = -1;
                    const id = data.id + '';
                    const len = id.split('-').length
                    let boxOrContent = ''; // box or content or items
                    console.log("🚀 ~ FormulaTree ~ constructor ~ len:", len)
                    if (len == 6) {
                        // 1721583270712-setting-1-display-content-class
                        boxOrContent = id.split('-')[4]
                        console.log("🚀 ~ FormulaTree ~ constructor ~ boxOrContent:", boxOrContent)
                        if (boxOrContent == 'items') {
                            itemIndex = id.split('-')[5]
                            console.log("🚀 ~ FormulaTree ~ constructor ~ itemIndex:", itemIndex)
                        }
                    }
                    if (id.includes('setting') && len > 2) {
                        index = id.split('-')[2]
                    }
                    console.log("🚀 ~ FormulaTree ~ click ~ index:", index)
                    self.layerui.layer.prompt(
                        function (text, renderIndex) {
                            const dataArr = data.title.split(':')
                            console.log("🚀 ~ FormulaTree ~ constructor ~ dataArr:", dataArr)
                            const changeId = data.id;
                            if (dataArr.length > 1) {
                                const key = dataArr[0]
                                self.updateSetting(key, text, jsonData, index, changeId, len, boxOrContent, isKeyValue, itemIndex);
                            } else {
                                self.updateSetting(null, text, jsonData, index, changeId, len, boxOrContent, isKeyValue, itemIndex);
                            }

                            self.layerui.layer.close(renderIndex);
                        }
                    );
                }
            });

            this.toFormula = (treeData) => {
                return treeData.map(node => {
                    const item = {
                        Id: node.id.split('-')[0],
                        Name: node.title.split(': ')[1],
                        ScenarioName: node.children[0].title.split(': ')[1],
                        Host: node.children[1].title.split(': ')[1],
                        EpochStartTime: null,
                        CentralBody: node.children[2].title.split(': ')[1],
                        Parser: node.children[3].title.split(': ')[1],
                        Description: node.children[4].title.split(': ')[1],
                        Settings: node.children[6].children.map(settingNode => ({
                            Name: settingNode.title,
                            WindowType: settingNode.children[0].title.split(': ')[1],
                            EntityId: settingNode.children[1].title.split(': ')[1],
                            ReportName: settingNode.children[2].title.split(': ')[1],
                            Display: {
                                Box: {
                                    Name: settingNode.children[3].children[0].title.split(': ')[1],
                                    Offset: settingNode.children[3].children[1].title.split(': ')[1].split(', ').map(Number),
                                    Area: [],
                                    Class: "data-layout"
                                },
                                Content: {
                                    Offset: settingNode.children[3].children[2].title.split(': ')[1].split(', ').map(Number),
                                    Area: [],
                                    Class: "data-content"
                                }
                            }
                        }))
                    };
                    return item;
                });
            };

            this.updateSetting = (key, value, jsonData, index, changeId, len, boxOrContent, isKeyValue, itemIndex) => {
                // 找到 jsonData 中对应的 key，然后修改为 value
                const data = jsonData[0]
                let isFind = false;
                if (key) {
                    if (index == -1) {
                        Object.keys(data).forEach(objKey => {
                            if (objKey == key) {
                                isFind = true;
                                data[key] = value
                            }
                        })
                    }

                    if (!isFind) {
                        const settings = data.Settings;
                        console.log("🚀 ~ FormulaTree ~ constructor ~ settings:", settings)
                        console.log("🚀 ~ FormulaTree ~ constructor ~ len:", len)
                        const targetSettingsItem = settings[index]
                        console.log("🚀 ~ FormulaTree ~ constructor ~ targetSettingsItem:", targetSettingsItem)
                        if (len == 4) {
                            Object.keys(targetSettingsItem).forEach(targetSettingKey => {
                                if (targetSettingKey == key) {
                                    isFind = true;
                                    targetSettingsItem[targetSettingKey] = value
                                }
                            })
                        } else if (len == 5) {
                            const display = targetSettingsItem.Display
                            if (display) {
                                const item = display.Items;
                                if (item) {
                                    if (isKeyValue) {
                                        display.Items = value;
                                    }
                                }
                            }
                        } else if (len == 6) {
                            if (!isFind) {
                                const display = targetSettingsItem.Display
                                if (display) {
                                    if (boxOrContent == 'box') {
                                        const box = display.Box;
                                        Object.keys(box).forEach(boxKey => {
                                            if (boxKey == key) {
                                                isFind = true;
                                                box[boxKey] = value;
                                            }
                                        })
                                    } else if (boxOrContent == 'content') {
                                        const content = display.Content;
                                        Object.keys(content).forEach(contentKey => {
                                            if (contentKey == key) {
                                                isFind = true;
                                                content[contentKey] = value;
                                            }
                                        })
                                    } else if (boxOrContent == 'items') {
                                        const items = display.Items;
                                        // TODO: value 是否是 json 校验
                                        items[itemIndex] = value;
                                    }
                                }
                            }
                        }

                    }
                } else {
                    const id = data.Id;
                    if (id == changeId) {
                        // 修改的root节点：态势展示方案
                        data.Name = value;
                    } else {
                        const settings = data.Settings;
                        if (index != -1) {
                            settings[index].Name = value;
                        }
                    }
                }

                this.render(jsonData);
            };

            this.editSetting = (index) => {
                const setting = jsonData.Settings[index];
                const newWindowType = prompt('Enter WindowType:', setting.WindowType);
                const newEntityId = prompt('Enter EntityId:', setting.EntityId);
                const newReportName = prompt('Enter ReportName:', setting.ReportName);

                if (newWindowType) self.updateSetting(index, 'WindowType', newWindowType);
                if (newEntityId) self.updateSetting(index, 'EntityId', newEntityId);
                if (newReportName) self.updateSetting(index, 'ReportName', newReportName);
            };
        };

        this.addSettingTemplate = (selectedSettingType) => {
            // 根据不同的类型创建 setting 对象
            if (selectedSettingType == 'Time') {
                this.jsonDataCopy[0].Settings.push(this.getSettingTemplate("时间模板", "Time", "时间", "", [33, 680], [430, 40], [0, 0], [], ["UTCG"]))
            } else if (selectedSettingType == 'Message') {
                this.jsonDataCopy[0].Settings.push(this.getSettingTemplate("消息模板1", "Message", "消息", "", [1062, 50], [500, 254], [15, 0], [], [
                    { Id: "Level", Label: "级别" },
                    { Id: "EntityId", Label: "实体Id" },
                    { Id: "Content", Label: "内容" },
                    { Id: "Time", Label: "消息时间" }
                ]))
            } else if (selectedSettingType == 'Business') {
                this.jsonDataCopy[0].Settings.push(this.getSettingTemplate("温度计模板", "Business", "温度计", "", [120, 312], [238, 216], [32, 0], [{ id: "averageTemperature", Label: "平均温度" }], "Thermometer"))
            } else if (selectedSettingType == 'Report') {
                this.jsonDataCopy[0].Settings.push(this.getSettingTemplate("数据报表模板", "Report", "大地纬度-经度", "Satellite/ICO_G1_32763", [106, -50], [], [], [0, 0]))
            } else if (selectedSettingType == 'Chart') {
                this.jsonDataCopy[0].Settings.push(this.getSettingTemplate("统计图模板", "Chart", "固定系位置-速度", "Satellite/CARTOSAT-2A_32783", [364, 50], [500, 320], [40, 0], []))
            }
            this.render(this.jsonDataCopy)
        }

        this.removeDeleteSetting = (selectedIndices, jsonData) => {
            selectedIndices.forEach(index => {
                jsonData[0].Settings.splice(index, 1);
            })
            this.render(jsonData);
        }

        this.addEvent = () => {
            const _this = this;
            // 增加 setting
            document.getElementById('add-setting').onclick = function () {
                // 弹窗显示 select 组件
                let addSettingLayerIndex = 0
                const closeAddSettingLayer = () => {
                    console.log('closeAddSettingLayer');
                    const selectElem = document.getElementById('add-setting-select-container');
                    if (selectElem) {
                        selectElem.remove();
                    }
                    layer.closeLast()
                }
                addSettingLayerIndex = layer.open({
                    type: 1,
                    title: ['选择 setting 类型', 'color:#fff;'],
                    shadeClose: true,
                    shade: false,
                    area: ['500px', '400px'], // 宽高
                    success: function (layero, index) {
                        layui.use('form', function () {
                            const form = layui.form;
                            form.render('select'); // 渲染 select 组件
                        })

                        // 绑定确定按钮
                        document.getElementById('add-setting-confirm').onclick = function () {                            // 获取选择的 setting 类型
                            const selectElem = document.getElementById('add-setting-select');
                            const selectedSettingType = selectElem.value;
                            if (selectedSettingType) {
                                closeAddSettingLayer()
                                // 在 jsonData 中增加一个新的 setting
                                _this.addSettingTemplate(selectedSettingType)
                            } else {
                                layer.msg('请选择 setting 的类型', {
                                    time: 2000
                                })
                            }

                        }

                        document.getElementById('add-setting-cancel').onclick = function () {
                            closeAddSettingLayer()
                        }
                    },
                    content: `
                        <div id="add-setting-select-container" class="layui-form">
                            <select id="add-setting-select" name="select">
                                <option value="">请选择 setting 的类型</option>
                                <option value="Time">Time</option>
                                <option value="Message">Message</option>
                                <option value="Business">Business</option>
                                <option value="Report">Report</option>
                                <option value="Chart">Chart</option>
                            </select>

                            <div class="add-setting-btn-container">
                                <button id="add-setting-cancel" type="button" class="layui-btn layui-btn-sm layui-btn-primary">取消</button>
                                <button id="add-setting-confirm" type="button" class="layui-btn layui-bg-blue layui-btn-sm">确定</button>
                            </div>
                        </div>
                    `,
                });
            }

            // 删除 setting
            document.getElementById('delete-setting').onclick = function () {
                console.log('click delete setting');
                // 弹窗显示 checkbox 组件
                let deleteSettingLayerIndex = 0
                const closeDeleteSettingLayer = () => {
                    console.log('closeDeleteSettingLayer');
                    const selectElem = document.getElementById('delete-setting-select-container');
                    if (selectElem) {
                        selectElem.remove();
                    }
                    layer.closeLast()
                }
                deleteSettingLayerIndex = layer.open({
                    type: 1,
                    title: ['选择要删除的 setting', 'color:#fff;'],
                    shadeClose: true,
                    shade: false,
                    area: ['500px', '400px'],
                    content: `
                    <div id="delete-setting-layer">
                        <div id="delete-checkbox-container"></div>
                        <div class="delete-setting-btn-container">
                            <button id="delete-setting-cancel" type="button" class="layui-btn layui-btn-sm layui-btn-primary">取消</button>
                            <button id="delete-setting-confirm" type="button" class="layui-btn layui-bg-blue layui-btn-sm">确定</button>
                        </div>
                    </div>
                    `,
                    success: function (layero, index) {

                        // 动态生成 checkbox 数据
                        const settings = _this.jsonDataCopy[0].Settings
                        console.log("🚀 ~ FormulaTree ~ settings:", settings)
                        const checkboxData = settings.map((setting, index) => ({
                            value: setting.Name,
                            title: setting.Name,
                            index: index
                        }));

                        // 插入 checkbox 元素
                        const checkboxContainer = document.getElementById('delete-checkbox-container');
                        checkboxData.forEach(item => {
                            const checkboxWrapper = document.createElement('div');
                            checkboxWrapper.className = 'layui-form-item';

                            const checkboxElem = document.createElement('input');
                            checkboxElem.type = 'checkbox';
                            checkboxElem.name = 'checkbox';
                            checkboxElem.value = item.value;
                            checkboxElem.title = item.title;
                            checkboxElem.className = 'layui-checkbox';
                            checkboxElem.setAttribute('lay-skin', 'primary');
                            checkboxElem.setAttribute('lay-filter', 'checkbox');
                            checkboxElem.setAttribute('data-index', item.index);
                            checkboxWrapper.appendChild(checkboxElem);

                            const labelElem = document.createElement('label');
                            labelElem.className = 'layui-form-label';
                            labelElem.innerText = item.title;
                            checkboxWrapper.appendChild(labelElem);

                            checkboxContainer.appendChild(checkboxWrapper);
                        });

                        layui.use('form', function () {
                            const form = layui.form;
                            form.render('checkbox'); // 渲染 checkbox 组件
                        })

                        // 绑定确定按钮
                        document.getElementById('delete-setting-confirm').onclick = function () {
                            // 获取 checkbox 的选中项
                            const checkboxElems = document.querySelectorAll('#delete-checkbox-container input[type="checkbox"]:checked');
                            console.log("🚀 ~ FormulaTree ~ checkboxElems:", checkboxElems)
                            const selectedIndices = Array.from(checkboxElems).map(elem => elem.getAttribute('data-index'));
                            console.log('Selected Indices:', selectedIndices);
                            if (selectedIndices.length > 0) {
                                _this.removeDeleteSetting(selectedIndices, _this.jsonDataCopy)
                                closeDeleteSettingLayer()
                            } else {
                                layer.msg('请选择要删除的 setting')
                            }
                        }

                        // 绑定取消按钮
                        document.getElementById('delete-setting-cancel').onclick = function () {
                            closeDeleteSettingLayer()
                        }
                    },
                    end: function () {
                        // 在弹出层关闭时移除 checkbox 组件
                        const checkboxContainer = document.getElementById('delete-checkbox-container');
                        if (checkboxContainer) {
                            checkboxContainer.innerHTML = '';
                        }
                    }
                });
            }

            // 保存 json
            document.getElementById('save-json').onclick = function () {
                console.log('click save json: ', _this.jsonDataCopy);
                if (!_this.jsonDataCopy || _this.jsonDataCopy.length == 0) {
                    console.warn('_this.jsonDataCopy is null');
                    return
                }
                const name = "方案" + new Date().getTime() + ".json";
                const data = {
                    name: name,
                    pluginId: 'aerospace',
                    folder: 'data',
                    content: JSON.stringify(_this.jsonDataCopy[0]),
                };
                $.post(ctx + '/m/pluginFile/uploadFile', data, function (ret) {
                    if (ret.messageType === 'SUCCESS') {
                        layer.msg("上传成功！文件路径：" + ret.result);
                        that.getFiles();
                    } else {
                        layer.msg('保存成功');
                    }
                });

                // HttpClient.build().post(WebApi.spaceData.uploadFile, {
                //     pluginId: 'aerospace',
                //     name: name,
                //     folder: "data",
                //     content: JSON.stringify(_this.jsonDataCopy[0])
                // }, (res) => {
                //     console.log(' 保存 json res: ', res);
                //     layer.msg('保存成功');
                //     closeDeleteSettingLayer();
                //     _this.jsonDataCopy = [];
                // });
            }
        }
    }
}