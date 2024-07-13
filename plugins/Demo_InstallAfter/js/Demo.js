(function() {

    var Demo = {
    	//插件唯一编号,需要和json里的id保持一致
        id: "Plugins_Demo_InstallAfter",
        //插件安装后触发的方法
        installAfter: function() {
        	$('#plugins_Demo_InstallAfter').show();
        },
        addEntity: function() {
            if (this.entity) {
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
        clear: function() {
            if (this.entity) {
                solarSystem.removeEntity(this.entity);
                this.entity = undefined;
            }
        }
    };
    Plugins.add(Demo);
})();
