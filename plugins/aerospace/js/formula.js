(function () {
    const template = [
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
    ];

    layui.use(['tree'], function () {
        var tree = layui.tree
            , layer = layui.layer;

        //开启节点操作图标
        tree.render({
            elem: '#aerospace_formula_container'
            , data: template
            , edit: ['update'] //操作节点的图标
            , click: function (obj) {
                //生成一个layui的输入框
                layer.open({
                    type: 1
                    , title: obj.data
                    , content: '<input type="text" id="input" placeholder="请输入内容">'
                });
            }
        });
    });

})();