/*
 * @Descripttion: 
 * @version: 
 * @Author: alan.lau
 * @Date: 2022-11-07 11:36:27
 * @LastEditors: alan.lau
 * @LastEditTime: 2022-11-29 10:01:12
 */
(function () {
    let tableData = [];
    var Demo = {
        //插件唯一编号
        id: "Plugins_Plot",
        menu: {
            click: function (element) {
                console.log('点击菜单');
                var width = $(window).width() - 100;
                if (width > 1460) {
                    width = 1460;
                }
                const openNewLayerIndex = layer.open({
                    type: 1,
                    title: "标绘",
                    shadeClose: true,
                    shade: false,
                    area: ['400px', '350px'], // 宽高
                    // offset: [$(window).height() - 400, ($(window).width() - width) + 'px'],
                    offset: [100 + 'px', 50 + 'px'],
                    success: function (layero, index) { },
                    content: $('#plugins_Plot'),
                    btn: [],
                    end: function () {
                        vueThis.handleRadioChange('无')
                    }
                });
                // this.addbegin();
            }
        },
        addEntity: function () {
            // if (this.entity) {
            //     solarSystem.removeEntity(this.entity);
            //     this.entity = undefined;
            // }
            // this.entity = solarSystem.addEntity({
            //     position: Cesium.Cartesian3.fromDegrees(115.59777, 30.03883),
            //     point: {
            //         pixelSize: 5,
            //         color: Cesium.Color.RED,
            //         outlineColor: Cesium.Color.WHITE,
            //         outlineWidth: 2
            //     },
            //     label: {
            //         text: "测试",
            //         font: "24px Helvetica",
            //         fillColor: Cesium.Color.SKYBLUE,
            //         outlineColor: Cesium.Color.BLACK,
            //         outlineWidth: 2,
            //         style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            //         pixelOffset: new Cesium.Cartesian2(0, -30)
            //     }
            // });
        },
        addCzml: function () {

            if (this.dataSource) {
                solarSystem.removeDataSource(this.dataSource, true);
                this.dataSource = undefined;
            }
            var dataSourcePromise = solarSystem.createCzmlDataSource("resources/czml/simple.czml");
            var that = this;
            solarSystem.addDataSource(dataSourcePromise).then(function (ds) {
                that.dataSource = ds;
            });
        },
        addPrimitives: function () {
            var numPoints = 100000;
            if (this.pointPrimitives) {
                solarSystem.removePrimitive(this.pointPrimitives);
                this.pointPrimitives = undefined;
            }
            this.pointPrimitives = solarSystem.addPrimitive(
                new Cesium.PointPrimitiveCollection()
            );
            var base = solarSystem.baseViewer.scene.globe.ellipsoid.radii.x;
            var color = Cesium.Color.LIGHTSKYBLUE;
            var outlineColor = Cesium.Color.BLACK;

            for (var j = 0; j < numPoints; ++j) {
                var position = new Cesium.Cartesian3(
                    16000000 * Math.random() - 8000000, -((4000000 * j) / numPoints + base),
                    2000000 * Math.random() - 1000000
                );

                this.pointPrimitives.add({
                    pixelSize: 5,
                    color: color,
                    outlineColor: outlineColor,
                    outlineWidth: 0,
                    position: position,
                });
            }
        },
        clear: function () {
            if (this.entity) {
                solarSystem.removeEntity(this.entity);
                this.entity = undefined;
            }
            if (this.dataSource) {
                solarSystem.removeDataSource(this.dataSource, true);
                this.dataSource = undefined;
            }
            if (this.pointPrimitives) {
                solarSystem.removePrimitive(this.pointPrimitives);
                this.pointPrimitives = undefined;
            }
        },
        addbegin: function () {

            // console.log(solarSystem.baseViewer.scene.primitives);
            // console.log(new Cesium.ScreenSpaceEventHandler(solarSystem.baseViewer.scene.canvas));
            var handler = new Cesium.ScreenSpaceEventHandler(solarSystem.baseViewer.scene.canvas)
            // console.log(handler);
            // 移出点击事件
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
            var that = this
            // console.log(this);
            // console.log(window);
            let viewer = solarSystem.baseViewer
            // console.log(solarSystem);

            Debris.getInstance(viewer).start(() => {
                console.log('初始化完成')
                let values = Debris.getInstance()._debrisMap.values()
                // console.log(values);
                let data = Array.from(values, (n) => n._satrec)
                // console.log(vueThis);
                vueThis.fillSearchTable(data, true)
                // vueThis.tableData = data.length < vueThis.pagesize ? data : data.slice(0, vueThis.pagesize)
                // console.log(vueThis.tableData);

                // if (true) vueThis.total = data.length

            })
            // console.log(solarSystem.baseViewer);
            handler.setInputAction(function (movement) {
                if (movement.position != null) {
                    var pick = viewer.scene.pick(movement.position)
                    console.log('pick 选中了PointPrimitive对象:' + pick.id)
                    if (Cesium.defined(pick)) {
                        if (Debris.getInstance().hasOrbit(pick.id)) {
                            Debris.getInstance().removeOrbit(pick.id)
                            that.tableData2.splice(
                                that.tableData2.findIndex((n) => n.satnum === pick.id),
                                1
                            )
                        } else {
                            Debris.getInstance().addOrbit(pick.id)
                            // 更新table1的值
                            // console.log(that);
                            let index = tableData.findIndex((v) => v.satnum === pick.id)
                            console.log(index);
                            if (index > -1) tableData[index].showOrbit = true

                            // 更新table2的值
                            let sat = Debris.getInstance().getDebris(pick.id)
                            // console.log(sat);
                            sat._satrec.showOrbit = true
                            vueThis.tableData2.push(sat._satrec)
                        }
                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

        }

    };
    Plugins.add(Demo);
})();