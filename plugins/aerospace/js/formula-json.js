class FormulaTree {
    constructor() {
        this.initialData = [
            {
                "Id": "1",
                "Name": "态势展示方案",
                "ScenarioName": "航空态势展示",
                "Host": "https://localhost:7234/receiver",
                "EpochStartTime": null,
                "CentralBody": "Earth",
                "Parser": "spaceDataParser",
                "Description": "航空态势展示",
                "Settings": [
                    {
                        "Name": "数据报表L1",
                        "WindowType": "Report",
                        "EntityId": "Satellite/ICO_G1_32763",
                        "ReportName": "大地纬度-经度",
                        "Display": {
                            "Box": {
                                "Name": "大地纬度-经度",
                                "Offset": [106, -50],
                                "Area": [],
                                "Class": "data-layout"
                            },
                            "Content": {
                                "Offset": [],
                                "Area": [0, 0],
                                "Class": "data-content"
                            }
                        }
                    },
                    {
                        "Name": "数据报表L2",
                        "WindowType": "Report",
                        "EntityId": "Satellite/ICO_G1_32763",
                        "ReportName": "固定系位置-速度",
                        "Display": {
                            "Box": {
                                "Name": "固定系位置-速度",
                                "Offset": [302, -50],
                                "Area": [],
                                "Class": "data-layout"
                            },
                            "Content": {
                                "Offset": [32, 4],
                                "Area": [0, 0],
                                "Class": "data-content"
                            }
                        }
                    },
                    {
                        "Name": "数据报表L3",
                        "WindowType": "Report",
                        "EntityId": "Satellite/ICO_G1_32763",
                        "ReportName": "惯性系位置、速度",
                        "Display": {
                            "Box": {
                                "Name": "惯性系位置、速度",
                                "Offset": [610, -50],
                                "Area": [],
                                "Class": "data-layout"
                            },
                            "Content": {
                                "Offset": [32, 4],
                                "Area": [0, 0],
                                "Class": "data-content"
                            }
                        }
                    },
                    {
                        "Name": "数据报表L4",
                        "WindowType": "Report",
                        "EntityId": "Satellite/CARTOSAT-2A_32783",
                        "ReportName": "大地纬度-经度-高度-速度大小",
                        "Display": {
                            "Box": {
                                "Name": "大地纬度-经度-高度-速度大小",
                                "Offset": [908, -50],
                                "Area": [],
                                "Class": "data-layout"
                            },
                            "Content": {
                                "Offset": [32, 4],
                                "Area": [0, 0],
                                "Class": "data-content"
                            }
                        }
                    },
                    {
                        "Name": "数据报表L5",
                        "WindowType": "Report",
                        "EntityId": "Satellite/CALSPHERE_1_00900",
                        "ReportName": "大地纬度-经度",
                        "Display": {
                            "Box": {
                                "Name": "大地纬度-经度",
                                "Offset": [1168, -50],
                                "Area": [],
                                "Class": "data-layout"
                            },
                            "Content": {
                                "Offset": [32, 4],
                                "Area": [0, 0],
                                "Class": "data-content"
                            }
                        }
                    },
                    {
                        "Name": "XXX统计图1",
                        "WindowType": "Chart",
                        "EntityId": "Satellite/CARTOSAT-2A_32783",
                        "ReportName": "固定系位置-速度",
                        "Display": {
                            "Box": {
                                "Name": "固定系位置-速度",
                                "Offset": [364, 50],
                                "Area": [500, 320],
                                "Class": "data-layout"
                            },
                            "Content": {
                                "Offset": [40, 0],
                                "Area": [],
                                "Class": "data-content"
                            }
                        }
                    },
                    {
                        "Name": "XXX统计图2",
                        "WindowType": "Chart",
                        "EntityId": "Satellite/CARTOSAT-2A_32783",
                        "ReportName": "Beta角度",
                        "Display": {
                            "Box": {
                                "Name": "Beta角度",
                                "Offset": [714, 50],
                                "Area": [500, 320],
                                "Class": "data-layout"
                            },
                            "Content": {
                                "Offset": [40, 0],
                                "Area": [],
                                "Class": "data-content"
                            }
                        }
                    },
                    {
                        "Name": "时间T1",
                        "WindowType": "Time",
                        "Precision": 3,
                        "EntityId": "",
                        "Display": {
                            "Box": {
                                "Name": "仿真时间",
                                "Offset": [33, 680],
                                "Area": [430, 40],
                                "Class": "time-layout"
                            },
                            "Content": {
                                "Offset": [0, 0],
                                "Area": [],
                                "Class": ""
                            },
                            "Items": "UTCG"
                        }
                    },
                    {
                        "Name": "时间T2",
                        "WindowType": "Time",
                        "Precision": 3,
                        "EntityId": "",
                        "Display": {
                            "Box": {
                                "Name": "仿真时间",
                                "Offset": [33, -700],
                                "Area": [250, 40],
                                "Class": "time-layout"
                            },
                            "Content": {
                                "Offset": [0, 0],
                                "Area": [],
                                "Class": ""
                            },
                            "Items": "EpSec"
                        }
                    },
                    {
                        "Name": "消息M1",
                        "WindowType": "Message",
                        "EntityId": "",
                        "Display": {
                            "Box": {
                                "Name": "消息",
                                "Offset": [1062, 50],
                                "Area": [500, 254],
                                "Class": "data-layout"
                            },
                            "Content": {
                                "Offset": [15, 0],
                                "Area": [],
                                "Class": "message"
                            },
                            "Items": [
                                {
                                    "Id": "Level",
                                    "Label": "级别"
                                },
                                {
                                    "Id": "EntityId",
                                    "Label": "实体Id"
                                },
                                {
                                    "Id": "Content",
                                    "Label": "内容"
                                },
                                {
                                    "Id": "Time",
                                    "Label": "消息时间"
                                }
                            ]
                        }
                    },
                    {
                        "Name": "温度计R1",
                        "WindowType": "Business",
                        "EntityId": "",
                        "Display": {
                            "ChartType": "Thermometer",
                            "Box": {
                                "Name": "平均温度",
                                "Offset": [120, 312],
                                "Area": [238, 216],
                                "Class": "data-layout"
                            },
                            "Content": {
                                "Offset": [32, 0],
                                "Area": [],
                                "Class": "data-content"
                            },
                            "Items": [
                                {
                                    "Id": "averageTemperature",
                                    "Label": "平均温度"
                                }
                            ]
                        }
                    },
                    {
                        "Name": "温度仪表盘",
                        "WindowType": "Business",
                        "EntityId": "",
                        "Display": {
                            "ChartType": "Gauge",
                            "Box": {
                                "Name": "环境温度",
                                "Offset": [120, 50],
                                "Area": [238, 216],
                                "Class": "data-layout"
                            },
                            "Content": {
                                "Offset": [32, 0],
                                "Area": [],
                                "Class": "data-content"
                            },
                            "Items": [
                                {
                                    "Id": "enveromentTemperature",
                                    "Label": "环境温度"
                                }
                            ]
                        }
                    },
                    {
                        "Name": "航天态势数据大屏",
                        "WindowType": "Header",
                        "EntityId": "",
                        "Display": {
                            "Box": {
                                "Name": "",
                                "Offset": [0, 0],
                                "Area": ["100%", 100],
                                "Class": "page-title-layout"
                            },
                            "Content": {
                                "Offset": [4, 4],
                                "Area": [],
                                "Class": "page-title-text-box"
                            }
                        }
                    }
                ]
            }
        ]
            ;

        this.layerui = layui.use(['tree', 'layer'], function () {
            return { tree: layui.tree, layer: layui.layer };
        });

        this.getTemplate = () => {
            let data = JSON.parse(JSON.stringify(this.initialData));
            data.Id = (new Date()).getTime();
            return data;
        }

        let self = this;
        this.init = (jsonData) => {
            return jsonData.map(item => ({
                title: item.Name || 设置方案名称,
                id: item.Id,
                spread: true,
                children: [
                    { title: `ScenarioName: ${item.ScenarioName}`, id: `${item.Id}-scenarioname` },
                    { title: `Host: ${item.Host}`, id: `${item.Id}-host` },
                    { title: `CentralBody: ${item.CentralBody}`, id: `${item.Id}-centralbody` },
                    { title: `Parser: ${item.Parser}`, id: `${item.Id}-parser` },
                    { title: `Description: ${item.Description}`, id: `${item.Id}-description` },
                    {
                        title: 'Settings',
                        id: `${item.Id}-settings`,
                        children: item.Settings.map((setting, index) => ({
                            title: setting.Name || 'Unnamed Setting',
                            id: `${item.Id}-setting-${index}`,
                            children: [
                                { title: `WindowType: ${setting.WindowType}`, id: `${item.Id}-setting-${index}-windowtype` },
                                { title: `EntityId: ${setting.EntityId}`, id: `${item.Id}-setting-${index}-entityid` },
                                { title: `ReportName: ${setting.ReportName}`, id: `${item.Id}-setting-${index}-reportname` },
                                {
                                    title: 'Display',
                                    id: `${item.Id}-setting-${index}-display`,
                                    children: [
                                        { title: `Box Name: ${setting.Display.Box.Name}`, id: `${item.Id}-setting-${index}-display-box-name` },
                                        { title: `Box Offset: ${setting.Display.Box.Offset.join(', ')}`, id: `${item.Id}-setting-${index}-display-box-offset` },
                                        { title: `Content Offset: ${setting.Display.Content.Offset.join(', ')}`, id: `${item.Id}-setting-${index}-display-content-offset` }
                                    ]
                                }
                            ]
                        }))
                    }
                ]
            }));
        };
        this.render = (jsonData) => {
            this.layerui.tree.render({
                elem: '#settings-container',
                data: self.init(jsonData),
                showLine: true,
                isJump: true, // 是否允许点击节点时弹出新窗口跳转
                click: function (obj) {
                    var data = obj.data;  //获取当前点击的节点数据
                    self.layerui.layer.prompt({ title: '正在修改' + data.title.split(':')[0] + '的值' },
                        function (text, index) {
                            if (!obj.children) {
                                self.updateSetting(null, data.title.split(':')[0], text, jsonData);
                            } else {
                                if (data.title.split(':')[0] !== 'Setting') {
                                    self.updateSetting(index, data.title.split(':')[0], text, jsonData);
                                }
                            }

                            self.layerui.layer.close(index);
                        });
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
            this.addSetting = () => {
                formData.Settings.push({
                    Name: '',
                    WindowType: 'Report',
                    EntityId: '',
                    ReportName: '',
                    Display: {
                        Box: {
                            Name: '',
                            Offset: [],
                            Area: [],
                            Class: ''
                        },
                        Content: {
                            Offset: [],
                            Area: [],
                            Class: ''
                        }
                    }
                });
                render(jsonData);
            };
            this.removeSetting = (index, jsonData) => {
                jsonData.Settings.splice(index, 1);
                render(jsonData);
            };

            this.updateSetting = (index, key, value, jsonData) => {
                if (!index) {
                    jsonData[key] = value;
                } else {
                    jsonData.Settings[index][key] = value;
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
    }
}