(function () {

    var Demo = {
        //插件唯一编号,需要和json里的id保持一致
        id: "Plugins_Ziyou",
        menu: {
            //点击菜单后触发的事件
            click: function (element) {

                if (!sceneViewModel.dataSource) {
                    layer.msg("请先新建或打开场景！");
                    return;
                }

                const openNewLayerIndex = layer.open({
                    type: 1,
                    title: "自由",
                    shadeClose: true,
                    shade: false,
                    area: '440px', // 宽高
                    offset: ['140px', ($(window).width() - 450) + 'px'],
                    success: function (layero, index) {
                        
                        var dataSource = sceneViewModel.dataSource;
                        var clock = dataSource.clock;
                        var startTime = Cesium.JulianDate.toIso8601(clock.startTime, 2);
                        $("#Ziyou_epoch").val(startTime);
                    },
                    content: $('#plugins_Ziyou'),
                    btn: [],
                    end: function () {
                        //关闭窗口
                    }
                });
            }
        },

        //  打开场景浏览器，选择目标对象
        selectEntity: function (inputClass) {
            var id = $("." + inputClass).attr("value");
            var selectedEntity;
            if (id && id.indexOf(" ") > 0) {
                selectedEntity = {
                    id: id.indexOf(" ")[0]
                }
            }
            EntityParentSelector.show({
                selectedEntity: selectedEntity,
                //				isParent:false,
                handler: function (entity) {
                    this.TargetEntity = entity;
                    $("." + inputClass).attr("value", entity.id);
                    $("." + inputClass).html(entity.name);
                },
                owner: this
            });
        },

        //  1 获取目标对象在epoch时刻的位置和速度
        //  2 根据 epoch，位置速度，“a/b/c/d”，组成一个Json对象，调用webapi,
        //  3 webapi 返回 .a,.e文件，创建一个新的对象，使用.a,.e文件
        //  4 返回的.e文件更新目标对象的位置（改用stk external积分器）
        invokeZiyouApi: function (type) {
            var webapi = $("#Ziyou_webAPI").val();
            var epoch = $("#Ziyou_epoch").val();
            var epochTime = Cesium.JulianDate.fromIso8601(epoch);
            
            var dataSource = sceneViewModel.dataSource;
            var clock = dataSource.clock;
            var startTime = clock.startTime;

            var stopTime = clock.stopTime;
            if(Cesium.JulianDate.lessThan(epochTime, startTime)||Cesium.JulianDate.greaterThan(epochTime, stopTime)){
                layer.alert("开始时间不在场景时间范围["+startTime.toString()+"-"+stopTime.toString()+"]，请重新设置！");
                return;
            }
            //获取对象的位置VGT对象
            var point_vgt = Cesium.VGT.Point.get(this.TargetEntity.id + " Center");
            //根据位置VGT对象获取epoch对应的位置信息
            var position = point_vgt.getValueInCbReferenceFrame(epochTime, this.TargetEntity.centralBody, Cesium.ReferenceFrame.INERTIAL);
            //获取对象的速度VGT对象
            var velocity_vgt = Cesium.VGT.Vector.get(this.TargetEntity.id + " Velocity");
            //根据速度VGT对象获取epoch对应的速度信息
            var velocity = velocity_vgt.getValueInCbReferenceFrame(epochTime, this.TargetEntity.centralBody, Cesium.ReferenceFrame.INERTIAL);
            //构建webapi参数对象
            var params = {
                epoch: epoch,
                type: type,
                position: [position.x, position.y, position.z, velocity.x, velocity.y, velocity.z]
            };
            console.log(params);
            var that = this;
            //调用webapi服务
            PromiseUtils.postPromise({
                url: webapi,
                data: params
            }).then(function (ret) {
                console.log(ret);
                //根据结果信息在场景里添加对象
                that.addTargetEntity(ret);
                that.addZiyouEntity(ret);

            }).otherwise(function (e) {
                var error = e.message || e;
                layer.msg(error);
            });
        },

        //  添加目标飞行器
        addTargetEntity: function (data) {

            //根据.a、.e内容，新建一个对象
            var e = data.Target_StkEpheFile;
            var position = this.createPosition(e);
            
            var targetEntity = this.TargetEntity;
            //获取当前场景对象
            var dataSource = sceneViewModel.dataSource;
            var clock = dataSource.clock;
            var epochTime = Cesium.JulianDate.fromIso8601(position.epoch);
            //设置场景开始时间为历元时间
            clock.startTime=epochTime;
            clock.currentTime = epochTime;
            //同步Viewer的时间为场景时间
            var viewer = solarSystem.baseViewer;
            viewer.clock.currentTime = clock.currentTime;
            viewer.clock.stopTime = clock.stopTime;
            viewer.clock.startTime = clock.startTime;
            viewer.timeline.zoomTo(clock.startTime, clock.stopTime);
            var startTime = clock.startTime.toString();
            var stopTime = clock.stopTime.toString()
            //对象名称
            var name = "Target";
            var entityType = "satellite";
            var data = {
                availability: startTime + "/" + stopTime,
                centralBody: targetEntity.centralBody,
                entityType: entityType,
                A805_Properties: {
                    propagator: "StkExternal",
                    StkExternal: {
                        startTime: startTime,
                        stopTime: stopTime,
                        replaceFileEpoch: false,
                        firstEpoch: startTime
                    },
                    orientation: {
                        method: "Standard",
                        StkExternal: {
                            isUse: true
                        }
                    }
                },
                name: name,
                isSameName: true,
                position: position,
                //orientation: orientation,
                path: Object.clone(sceneViewModel.globalAttribute.path),
                billboard: Object.clone(sceneViewModel.globalAttribute.billboard),
                label: Object.clone(sceneViewModel.globalAttribute.label),
                model: Object.clone(sceneViewModel.globalAttribute.model)
            };
            //更新对象名称，如果已存在则+1
			ProtoTreeData.updateEntityName(data);
            //更新对象label，如果和名称一致则将label.text设置和name相同
            ProtoTreeData.updateIsSameName(data);

            data.billboard.heightReference = "NONE";
            data.billboard.verticalOrigin = "CENTER";

            data.label.heightReference = "NONE";
            data.model.heightReference = "NONE";
            var entityTypeInfo = entityTypeUtils.getTypeInfo(entityType);
            if (entityTypeInfo) {
                data.billboard.image = entityTypeInfo.icon;
                data.model.gltf = entityTypeInfo.model;
            }

            //根据data设置，创建并返回新建的Entity对象
            var entity = Cesium.CzmlDataSource.processEntityPacket(data);
            if (entity) {
                //将Entity添加至场景内
                dataSource.entities.add(entity);
                //为Entity在场景树状结构里添加节点
                sceneViewModel.addNode(entity);
            }
        },

        //  添加自由飞行器
        addZiyouEntity: function (data) {
            var targetEntity = this.TargetEntity;
            //获取当前场景对象
            var dataSource = sceneViewModel.dataSource;
            var clock = dataSource.clock;
            var startTime = clock.startTime.toString();
            var stopTime = clock.stopTime.toString()
            //根据.a、.e内容，新建一个对象
            var e = data.Ziyou_StkEpheFile;
            var position = this.createPosition(e);
            var a = data.Ziyou_StkAttiFile;
            var orientation = this.createOrientation(a);
            //对象名称
            var name = "ziyou";
            var entityType = "satellite";
            var data = {
                availability: startTime + "/" + stopTime,
                centralBody: targetEntity.centralBody,
                entityType: entityType,
                A805_Properties: {
                    propagator: "StkExternal",
                    StkExternal: {
                        startTime: startTime,
                        stopTime: stopTime,
                        replaceFileEpoch: false,
                        firstEpoch: startTime
                    },
                    orientation: {
                        method: "Standard",
                        StkExternal: {
                            isUse: true
                        }
                    }
                },
                name: name,
                isSameName: true,
                position: position,
                orientation: orientation,
                path: Object.clone(sceneViewModel.globalAttribute.path),
                billboard: Object.clone(sceneViewModel.globalAttribute.billboard),
                label: Object.clone(sceneViewModel.globalAttribute.label),
                model: Object.clone(sceneViewModel.globalAttribute.model)
            };
            //更新对象名称，如果已存在则+1
			ProtoTreeData.updateEntityName(data);
            //更新对象label，如果和名称一致则将label.text设置和name相同
            ProtoTreeData.updateIsSameName(data);

            data.billboard.heightReference = "NONE";
            data.billboard.verticalOrigin = "CENTER";

            data.label.heightReference = "NONE";
            data.model.heightReference = "NONE";
            var entityTypeInfo = entityTypeUtils.getTypeInfo(entityType);
            if (entityTypeInfo) {
                data.billboard.image = entityTypeInfo.icon;
                data.model.gltf = entityTypeInfo.model;
            }

            //根据data设置，创建并返回新建的Entity对象
            var entity = Cesium.CzmlDataSource.processEntityPacket(data);
            if (entity) {
                //将Entity添加至场景内
                dataSource.entities.add(entity);
                //为Entity在场景树状结构里添加节点
                sceneViewModel.addNode(entity);
            }
        },

        //根据.e文件内容生成Entity的position属性
        createPosition: function (fileText) {
            var result = Cesium.StkHelper.readStkEphemerisFile(fileText);
            var epoch = result.epoch;
            var position = {
                interpolationAlgorithm: result.interpolationAlgorithm,
                interpolationDegree: result.interpolationDegree,
                referenceFrame: result.referenceFrame,
                epoch: epoch
            };

            if (result.type == "cartesianVelocity" || (result.cartesianVelocity && result.cartesianVelocity.length > 0)) {
                position.cartesianVelocity = result.cartesianVelocity;
            } else if (result.type == "cartesian" || (result.cartesian && result.cartesian.length > 0)) {
                position.cartesian = result.cartesian;
            }
            return position;
        },
        //根据.a文件内容生成Entity的orientation属性
        createOrientation: function (fileText) {
            var result = Cesium.StkHelper.readStkAttitudeFile(fileText);
            var epoch = result.epoch;
            var orientation = {
                interpolationAlgorithm: result.interpolationAlgorithm,
                interpolationDegree: result.interpolationDegree,
                epoch: epoch,
                unitQuaternion: result.unitQuaternion
            };
            return orientation;
        }
    };
    //把插件对象添加到插件管理器
    Plugins.add(Demo);
})();
