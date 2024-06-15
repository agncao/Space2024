/*
 * @Descripttion: 
 * @version: 
 * @Author: alan.lau
 * @Date: 2022-11-07 11:11:33
 * @LastEditors: alan.lau
 * @LastEditTime: 2022-11-17 14:56:47
 */
(function () {
    let tableData = [];
    let tableData2 = [];
    var Demo = {
        //插件唯一编号
        id: "Plugins_Debris",
        menu: {
            click: function (element) {
                console.log('点击菜单');
                var width = $(window).width() - 100;
                if (width > 1460) {
                    width = 1460;
                }
                const openNewLayerIndex = layer.open({
                    type: 1,
                    title: "空间在轨物体",
                    shadeClose: true,
                    shade: false,
                    area: [width + 'px', '342px'], // 宽高
                    offset: [$(window).height() - 400, ($(window).width() - width) + 'px'],
                    success: function (layero, index) { },
                    content: $('#plugins_Debris'),
                    maxmin: true,
                    btn: [],
                    end: function () {
                        Debris.getInstance().clear()

                    },
                    min: function (layero, index) {
                        console.log(layero);
                        setTimeout(function () {
                            layero.css({ 'left': 'inherit', 'right': '0px' })

                        })
                    }

                });
                this.addbegin();
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