(function() {

    var Demo = {
        //插件唯一编号,需要和json里的id保持一致
        id: "Plugins_Demo_Menu",
        menu: {
            //点击菜单后触发的事件
            click: function(element) {
                const openNewLayerIndex = layer.open({
                    type: 1,
                    title: "示例_点击菜单后显示",
                    shadeClose: true,
                    shade: false,
                    area: '340px', // 宽高
                    offset: ['140px', ($(window).width() - 450) + 'px'],
                    success: function(layero, index) {
                    },
                    content: $('#plugins_Demo_Menu'),
                    btn: [],
                    end: function() {
                    	//关闭窗口时删除所有添加的对象
                    	Demo.clear();
                    }
                });
            }
        },
        addEntity: function() {
            if (this.entity) {
            	//删除Entity对象
                solarSystem.removeEntity(this.entity);
                this.entity = undefined;
            }
            this.entity = solarSystem.addEntity({
                position: Cesium.Cartesian3.fromDegrees(115.59777, 30.03883),
                point: {
                    pixelSize: 5,
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2
                },
                label: {
                    text: "测试",
                    font: "24px Helvetica",
                    fillColor: Cesium.Color.SKYBLUE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    pixelOffset: new Cesium.Cartesian2(0, -30)
                }
            });
        },
        addCzml: function() {
            if (this.dataSource) {
                solarSystem.removeDataSource(this.dataSource, true);
                this.dataSource = undefined;
            }
            var dataSourcePromise = solarSystem.createCzmlDataSource("plugins/Demo_Menu/czml/simple.czml");
            var that = this;
            solarSystem.addDataSource(dataSourcePromise).then(function(ds) {
                that.dataSource = ds;
            });
        },
        addPrimitives: function() {
            if (this.IntervalHanlder) {
                clearInterval(this.IntervalHanlder);
            }
            this.IntervalHanlder = setInterval(Demo.addPrimitives_, 50);
        },
        addPrimitives_: function() {
            var numPoints = 100000;
            if (Demo.pointPrimitives) {
                Demo.pointPrimitives.removeAll();
            } else {
                Demo.pointPrimitives = solarSystem.addPrimitive(
                    new Cesium.PointPrimitiveCollection()
                );
            }
            var base = solarSystem.baseViewer.scene.globe.ellipsoid.radii.x;
            var color = Cesium.Color.LIGHTSKYBLUE;
            var outlineColor = Cesium.Color.BLACK;

            for (var j = 0; j < numPoints; ++j) {
                var position = new Cesium.Cartesian3(
                    16000000 * Math.random() - 8000000,
                    -((4000000 * j) / numPoints + base),
                    2000000 * Math.random() - 1000000
                );

                Demo.pointPrimitives.add({
                    pixelSize: 5,
                    color: color,
                    outlineColor: outlineColor,
                    outlineWidth: 0,
                    position: position,
                });
            }
        },
        clear: function() {
            if (this.IntervalHanlder) {
                clearInterval(this.IntervalHanlder);
                this.IntervalHanlder = undefined;
            }
            if (this.entity) {
                solarSystem.removeEntity(this.entity);
                this.entity = undefined;
            }
            if (this.dataSource) {
                solarSystem.removeDataSource(this.dataSource, true);
                this.dataSource = undefined;
            }
            if (this.pointPrimitives) {
                this.pointPrimitives.removeAll();
            }
            if (this.labelPrimitives) {
                this.labelPrimitives.removeAll();
                solarSystem.removePrimitive(this.labelPrimitives);
                this.labelPrimitives = undefined;
            }
        }
    };
    //把插件对象添加到插件管理器
    Plugins.add(Demo);
})();
