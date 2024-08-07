(function () {
    //定义RealTime数据接收解析器
    var spaceDataAdapter = {
        //解析器名称，需要保持唯一,避免与其他解析器重复，否则无法使用
        key: "spaceDataParser",
        //是否和服务器同步时间
        isSynTime: true,
        //系统时间秒数
        sysTime: -1,
        //数据时间
        dataJd: new Cesium.JulianDate(),
        startJd: null,
        //服务器发送时间间隔，默认为1秒、之后会根据接收数据间隔通过位置姿态更新器更新
        timeStep: 1,
        //创建连接，并监听消息接收
        instance: function (url, rtNetWork) {
            this.rtNetWork = rtNetWork;
            var connection = new signalR.HubConnectionBuilder().withUrl(url).build();
            connection.on("receiveSpaceData", spaceDataAdapter.message);
            connection.start().then(function () {
                spaceDataAdapter.isSynTime = true;
            }).catch(function (err) {
                return console.error(err.toString());
            });
            return connection;
        },        //消息接收方法
        message: function (msg) {
            try {
                var data = $.parseJSON(msg);
                spaceDataAdapter.parse(data);

            } catch (e) {
                console.log(e);
            }


        },
        //消息接收方法
        parse: function (data) {
            try {
                var sysTime = window.performance.now() / 1000;
                //解析数据对应的时间
                var time = data.time;
                time = time.replace("UTCG", "");
                var jd = Cesium.JulianDate.fromIso8601(time);

                if (spaceDataAdapter.sysTime > 0) {
                    if (Cesium.JulianDate.lessThan(spaceDataAdapter.dataJd, jd)) {
                        //设置两次位置对应的仿真时间间隔
                        spaceDataAdapter.timeStep = Cesium.JulianDate.secondsDifference(jd, spaceDataAdapter.dataJd);
                        spaceDataAdapter.dataJd = jd;
                        //设置两次位置接收的系统时间间隔
                        spaceDataAdapter.systemTimeStep = sysTime - spaceDataAdapter.sysTime;
                        spaceDataAdapter.sysTime = sysTime;
                    }
                } else {
                    spaceDataAdapter.dataJd = jd;
                    spaceDataAdapter.sysTime = sysTime;
                }


                //解析Entity对象集，并进行更新
                var entities = data.entities;
                if (entities) {
                    for (var key in entities) {
                        if (entities.hasOwnProperty(key)) {
                            //根据当前打开的场景通过key（源对象编号）获取场景内对应的Entity对象
                            var entity = spaceDataAdapter.rtNetWork.dataSource.getRealTimeEntity(key);
                            //如果没有，并且场景未设置：自动创建对象，则继续下一个对象更新
                            if (!Cesium.defined(entity) && spaceDataAdapter.rtNetWork.noFindCreate !== true) {
                                continue;
                            }
                            //获取Entity对应的数据
                            var value = entities[key];

                            if (!Cesium.defined(entity)) {

                                //获得场景的全局属性设置
                                var globalAttribute = CommonUtil.defaultVal(spaceDataAdapter, "rtNetWork.dataSource.globalAttribute", {});
                                //根据数据创建Entity
                                var entityJson = EntityUpdater.createEntity(jd, key, value, globalAttribute);
                                if (entityJson) {
                                    //将Entity添加至场景内
                                    entity = spaceDataAdapter.rtNetWork.dataSource.entities.add(entityJson);
                                    //为Entity在场景树状结构里添加节点
                                    sceneViewModel.addNode(entity);
                                }
                            }
                            //未找到对象继续下一步
                            if (!Cesium.defined(entity)) {
                                continue;
                            }
                            //设置对象的中心天体
                            if (value.centralBody) entity.centralBody = value.centralBody;

                            //更新对象
                            EntityUpdater.update(jd, entity, value);
                        }
                    }
                }


                //解析Entity对象集，并进行更新
                var primitives = data.primitives;
                if (primitives) {
                    for (var key in primitives) {
                        if (primitives.hasOwnProperty(key)) {
                            //获取Primitive对应的数据
                            var value = primitives[key];
                            PrimitiveUpdater.update(jd, key, value);
                        }
                    }
                }

                if (spaceDataAdapter.isSynTime) {
                    //更新场景时间
                    Cesium.JulianDate.clone(jd, solarSystem.clock.currentTime);
                    spaceDataAdapter.isSynTime = false;
                }
                //根据实收时间差和数据时间差，调整播放倍数
                var timeStep = spaceDataAdapter.timeStep;
                if (spaceDataAdapter.systemTimeStep) {
                    var multiplier = timeStep / spaceDataAdapter.systemTimeStep;
                    solarSystem.clock.multiplier = multiplier;
                }
                //如果数据时间小于或大于场景时间阈值，则更新场景时间
                var dt = Cesium.JulianDate.secondsDifference(jd, solarSystem.clock.currentTime);
                if (dt < 0 || dt > (spaceDataAdapter.timeStep + 0.03 * spaceDataAdapter.timeStep)) {
                    Cesium.JulianDate.clone(jd, solarSystem.clock.currentTime);
                }
                if (spaceDataAdapter.messageHandler) {
                    spaceDataAdapter.messageHandler(data);
                }
            } catch (e) {
                console.log(e);
            }


        },
        destroy: function (nwInstance) {
            //销毁场景时关闭连接
            if (nwInstance && nwInstance.stop) nwInstance.stop();
            //清除Primitive对象
            PrimitiveUpdater.clear();
        }
    };
    //注册RealTime对象消息接收处理器
    Cesium.DataAdapter.add(spaceDataAdapter);
})();

