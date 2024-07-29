class FormulaTree {
    constructor() {
        this.nodeType = {
            keyword: 'keyword',
            leaf: 'leaf',
            node: 'node'
        };
        this.valueType = {
            keyValue: 'key-value',
            json: 'json'
        };
        this.event = {
            add: 'add',
            delete: 'delete',
            save: 'save',
            apply: 'apply'
        }
        this.valueConvertParam = {
            pos: 'Position',
            string: 'String'
        }

        this.jsonDataCopy = [];

        this.initialData = [];

        this.layerui = layui.use(['tree', 'layer'], function () {
            return { tree: layui.tree, layer: layui.layer };
        });
    }

    newFormulaByTemplate = async (formulaArr) => {
        try {
            const response = await fetch('/plugins/aerospace/config/template.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const templateData = await response.json();
            templateData[0].Id = new Date().getTime();
            templateData[0].Name = FileUtils.createUniqueName("态势展示方案", formulaArr, "name");
            this.initialData = templateData;
            return templateData;
        } catch (error) {
            console.error('Failed to fetch template.json:', error);
        }
    };

    getContentFromTemplate = async () => {
        try {
            const response = await fetch('/plugins/aerospace/config/template.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const templateData = await response.json();
            return templateData;
        } catch (error) {
            console.error('Failed to fetch template.json:', error);
        }
    };


    init = (jsonArr) => {
        let self = this;
        function getSettingTree(item, setting, index) {
            function arrayToStr(arr) {
                if (!arr) arr = [];
                return JSON.stringify(arr);
            }
            function getLeafNode(property, value, idPath = property, valueType = self.valueType.keyValue) {
                return { title: `${property}: ${value}`, id: `${item.Id}-setting-${index}-${idPath}`, setId: index, nodeType: self.nodeType.leaf, valueType: valueType };
            }
            function getKeyNode(keyword, idPath = keyword) {
                return { title: `${keyword}`, id: `${item.Id}-setting-${index}-${idPath}`, setId: index, nodeType: self.nodeType.keyword };
            }
            function getDisplayChildren() {
                let res = [];
                if (setting.WindowType === "Business" || setting.WindowType === "Message") {
                    let node = getLeafNode('Items', arrayToStr(setting.Display.Items), 'display-items');
                    node.validation = 'validateItems';
                    res.push(node);
                }
                if (setting.WindowType === "Time") {
                    let node = getLeafNode('Items', setting.Display.Items, 'display-items');
                    node.validation = 'notEmptyValidate';
                    res.push(node);
                }
                if (setting.WindowType === "Business") {
                    res.push(getLeafNode('ChartType', setting.Display.ChartType, 'display-chartType'));
                }

                let node = getKeyNode('Box', 'display-box');
                let offsetNode = getLeafNode('Offset', arrayToStr(setting.Display.Box.Offset), 'display-box-offset');
                offsetNode.validation = 'validatePosition';
                offsetNode.valueConvert = 'string2Array';
                offsetNode.valueConvertParam = self.valueConvertParam.pos;
                let areaNode = getLeafNode('Area', arrayToStr(setting.Display.Box.Area), 'display-box-area');
                areaNode.validation = 'validatePosition';
                areaNode.valueConvert = 'string2Array';
                areaNode.valueConvertParam = self.valueConvertParam.pos;
                node.children = [
                    getLeafNode('Name', setting.Display.Box.Name, 'display-box-name'),
                    offsetNode,
                    areaNode,
                    getLeafNode('Class', setting.Display.Box.Class, 'display-box-class'),
                ];
                res.push(node);

                node = getKeyNode('Content', 'display-content');
                let cOffNode = getLeafNode('Offset', arrayToStr(setting.Display.Content.Offset), 'display-content-offset');
                cOffNode.validation = 'validatePosition';
                cOffNode.valueConvert = 'string2Array';
                cOffNode.valueConvertParam = self.valueConvertParam.pos;
                let cAreaNode = getLeafNode('Area', arrayToStr(setting.Display.Content.Area), 'display-content-area');
                cAreaNode.validation = 'validatePosition';
                cAreaNode.valueConvert = 'string2Array';
                cAreaNode.valueConvertParam = self.valueConvertParam.pos;
                node.children = [
                    cOffNode,
                    cAreaNode,
                    getLeafNode('Class', setting.Display.Content.Class, 'display-content-class'),
                ];
                res.push(node);
                return res;
            }
            let obj = {
                title: setting.Name || '输入设置名称',
                id: `${item.Id}-setting-${index}`,
                setId: index,
                nodeType: self.nodeType.node,
                children: []
            }
            obj.children.push(getLeafNode('WindowType', setting.WindowType));
            if (setting.WindowType === "Report" || setting.WindowType === "Chart") {
                obj.children.push(getLeafNode('EntityId', setting.EntityId));
                obj.children.push(getLeafNode('ReportName', setting.ReportName));
                if (setting.WindowType === "Chart") {
                    let node = getLeafNode('XScaleCount', setting.XScaleCount);
                    node.validation = 'isPositiveInteger';
                    obj.children.push(node);
                }
            } else if (setting.WindowType === "Time") {
                obj.children.push(getLeafNode('Precision', setting.Precision));
            }
            let displayNode = getKeyNode('Display');
            displayNode.children = getDisplayChildren();
            obj.children.push(displayNode);

            return obj;
        };

        return jsonArr.map(item => {
            let treeData = {
                title: item.Name || '设置方案名称',
                id: item.Id,
                spread: true,
                nodeType: self.nodeType.root,
                validation: 'notEmptyValidate',
                children: [
                    { title: `ScenarioName: ${item.ScenarioName}`, id: `${item.Id}-scenarioname`, nodeType: self.nodeType.leaf, validation: 'notEmptyValidate' },
                    { title: `Host: ${item.Host}`, id: `${item.Id}-host`, nodeType: self.nodeType.leaf, validation: 'notEmptyValidate' },
                    { title: `CentralBody: ${item.CentralBody}`, id: `${item.Id}-centralbody`, nodeType: self.nodeType.leaf, validation: 'notEmptyValidate' },
                    { title: `Parser: ${item.Parser}`, id: `${item.Id}-parser`, nodeType: self.nodeType.leaf, validation: 'notEmptyValidate' },
                    { title: `Description: ${item.Description}`, id: `${item.Id}-description`, nodeType: self.nodeType.leaf, validation: 'notEmptyValidate' },
                    {
                        title: 'Settings',
                        id: `${item.Id}-settings`,
                        nodeType: self.nodeType.keyword,
                        children: item.Settings.map((setting, index) => getSettingTree(item, setting, index))
                    }
                ]
            }
            return treeData;
        });
    };

    render = (jsonArr) => {
        let self = this;
        this.jsonDataCopy = JSON.parse(JSON.stringify(jsonArr));
        this.layerui.tree.render({
            elem: '#settings-container',
            data: self.init(jsonArr),
            showLine: true,
            spread: true, // 默认展开所有节点
            isJump: true, // 是否允许点击节点时弹出新窗口跳转
            click: function (obj) {
                var data = obj.data;  //获取当前点击的节点数据
                if (data.nodeType === self.nodeType.keyword) {
                    return;
                }
                const isKeyValue = data.valueType === self.valueType.keyValue
                let index = -1;
                let itemIndex = -1;
                const id = data.id + '';
                const len = id.split('-').length
                let boxOrContent = ''; // box or content or items
                if (len == 6) {
                    // 1721583270712-setting-1-display-content-class
                    boxOrContent = id.split('-')[4]
                    if (boxOrContent == 'items') {
                        itemIndex = id.split('-')[5]
                    }
                }
                if (id.includes('setting') && len > 2) {
                    index = id.split('-')[2]
                }
                const dataArr = data.title.split(':')
                const key = dataArr.length > 1 ? dataArr[0] : null;
                const defaultValue = dataArr.length > 1 ? dataArr[1] : '';
                self.layerui.layer.prompt({
                    formType: 2,
                    value: defaultValue,
                    title: key ? '请输入[' + key + ']的值' : '请输入值',
                    area: ['300px', '40px'] // 自定义文本域宽高
                }, function (text, renderIndex) {
                    if (data.validation) {
                        const yes = self[data.validation](text);
                        if (!yes) {
                            return;
                        }
                    }
                    if (data.valueConvert) {
                        text = self[data.valueConvert](text, data.valueConvertParam);
                    }
                    const changeId = data.id;
                    self.updateSetting(key, text, jsonArr, index, changeId, len, boxOrContent, isKeyValue, itemIndex);

                    self.layerui.layer.close(renderIndex);
                }
                );
            }
        });

        this.updateSetting = (key, value, jsonArr, index, changeId, len, boxOrContent, isKeyValue, itemIndex) => {
            // 找到 jsonArr 中对应的 key，然后修改为 value
            const data = jsonArr[0]
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
                    const targetSettingsItem = settings[index]
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

            this.render(jsonArr);
        };
    }

    addSettingTemplate = async (selectedSettingType) => {
        //查找出setting => setting.WindowType == selectedSettingType 的settings，可能是多个对象，可能是一个对象，如果是多个返回第一个

        const templateData = await this.getContentFromTemplate();
        let subSettings = templateData[0].Settings.filter(setting => setting.WindowType == selectedSettingType);
        if (subSettings) {
            this.jsonDataCopy[0].Settings.push(subSettings[0]);
        }
        this.render(this.jsonDataCopy)
    }

    removeDeleteSetting = (selectedIndices, jsonArr) => {
        selectedIndices.sort((a, b) => b - a).forEach(index => {
            jsonArr[0].Settings.splice(index, 1);
            // 删除 settings 中 index 下标的数据
        });
        this.render(jsonArr);
    }

    addEvent = (updateName, eventName, callback) => {
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
                    document.getElementById('add-setting-confirm').onclick = function () {
                        // 获取选择的 setting 类型
                        const selectElem = document.getElementById('add-setting-select');
                        const selectedSettingType = selectElem.value;
                        if (selectedSettingType) {
                            closeAddSettingLayer()
                            // 在 jsonArr 中增加一个新的 setting
                            _this.addSettingTemplate(selectedSettingType)
                            if (eventName == _this.event.add) {
                                callback(JSON.parse(JSON.stringify(_this.jsonDataCopy)));
                            }
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
            // 弹窗显示 checkbox 组件
            const closeDeleteSettingLayer = () => {
                const selectElem = document.getElementById('delete-setting-select-container');
                if (selectElem) {
                    selectElem.remove();
                }
                layer.closeLast()
            }
            layer.open({
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
                    debugger

                    // 动态生成 checkbox 数据
                    //_this.jsonDataCopy[0].Settings过滤出WindowType!=Header
                    const settings = _this.jsonDataCopy[0].Settings.filter(setting => setting.WindowType != 'Header');
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
                        const selectedIndices = Array.from(checkboxElems).map(elem => elem.getAttribute('data-index'));
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

                    if (eventName == _this.event.delete) {
                        callback(JSON.parse(JSON.stringify(_this.jsonDataCopy)));
                    }
                }
            });
        }

        // 保存 json
        document.getElementById('save-json').onclick = function () {
            if (!_this.jsonDataCopy || _this.jsonDataCopy.length == 0) {
                return
            }
            const name = `${_this.jsonDataCopy[0].Name}.json`;
            const data = {
                name: updateName ? updateName : name,
                pluginId: 'aerospace',
                folder: 'data',
                content: JSON.stringify(_this.jsonDataCopy[0]),
            };
            $.post(ctx + '/m/pluginFile/uploadFile', data, function (ret) {
                if (ret.messageType === 'SUCCESS') {
                    layer.msg("保存成功");
                    if (eventName == _this.event.save) {
                        callback(JSON.parse(JSON.stringify(_this.jsonDataCopy)));
                    }
                } else {
                    layer.msg('保存失败:' + ret.content);
                }
            });
        };
        // 应用
        document.getElementById('apply-json').onclick = function () {
            if (eventName == _this.event.apply) {
                callback(JSON.parse(JSON.stringify(_this.jsonDataCopy)));
            }
        };
    }

    string2Array = (pos, convertType = this.valueConvertParam.string) => {
        if (!pos) return [];
        return pos
            .replace(/[\[\]]/g, '') // Remove square brackets
            .split(',')             // Split by comma
            .map(item => {
                let val = item.trim();
                if (convertType == this.valueConvertParam.pos) {
                    val = val.replace(/^['"]|['"]$/g, '');
                    if (!this.isPercentFormat(val)) {
                        val = parseFloat(val);
                    }
                }
                return val;
            }) // Trim whitespace
    };

    isPercentFormat = (value) => {
        return /^\d+(\.\d+)?%$/.test(value);
    }

    isPositiveInteger = (value) => {
        const regex = /^[1-9]\d*$/;
        const isValid = regex.test(value);
        if (!isValid) {
            this.layerui.layer.msg('输入的数据必须是正整数');
        }
        return isValid;
    };

    validatePosition = (position) => {
        if (!position) {
            return true;
        }

        const posArr = this.string2Array(position);
        let yes = true;
        if (posArr.length != 2) {
            yes = false;
        } else {
            //每个元素可以转换成float，或者可以转换成小数的百分数字符串
            posArr.forEach(item => {
                const num = parseFloat(item);
                if (isNaN(num) && !this.isPercentFormat(item)) {
                    yes = false;
                }
            });
        }
        if (!yes) {
            this.layerui.layer.msg('输入的数据格式不正确');
        }
        return yes;
    };
    validateItems = (items) => {
        if (!items) {
            this.layerui.layer.msg('输入的数据必须是JSON格式');
            return;
        }
        try {
            JSON.parse(items);
        } catch (e) {
            this.layerui.layer.msg('输入的数据必须是JSON格式');
            return;
        }
    };
    notEmptyValidate = (text) => {
        if (!text || text.trim() === '') {
            this.layerui.layer.msg('不可为空');
            return false;
        }
        return true;
    };
}