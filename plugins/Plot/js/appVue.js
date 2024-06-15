
/*
 * @Descripttion: 
 * @version: 
 * @Author: alan.lau
 * @Date: 2022-11-11 16:03:10
 * @LastEditors: alan.lau
 * @LastEditTime: 2022-11-29 13:33:09
 */

var vueThis = new Vue({
    el: '#plot',
    data: function () {
        return {
            radio1: '无',
            mapWnd: undefined,
            plotLayer: undefined
        }
    },
    mounted() {


        // debugger;
        // solarSystem.baseViewer.scene.globe.depthTestAgainstTerrain = false
        // this.mapWnd = new LhMapWnd(solarSystem.baseViewer)
        // this.plotLayer = this.mapWnd.getMap().addPlotLayer()
        // this.plotLayer.setMapWnd(this.mapWnd)
        // KeyHelper.start()

        // 测试压缩库
        solarSystem.baseViewer.scene.globe.depthTestAgainstTerrain = false
        this.mapWnd = new LhMapWnd(solarSystem.baseViewer)
        this.plotLayer = this.mapWnd.getMap().addPlotLayer()
        this.plotLayer.setMapWnd(this.mapWnd)

        // this.mapWnd.setTool('Point')
        // this.mapWnd.setTool('Line')
        // this.mapWnd.setTool('Polygon')
        // debugger

        // mapWnd = new Cesium.MapWnd(solarSystem.baseViewer);
        // plotLayer = mapWnd.getMap().addPlotLayer();
        // plotLayer.setMapWnd(mapWnd);
        // mapWnd.setTool("Line");

    },
    methods: {
        handleRadioChange(value) {
            switch (value) {
                case '打开':
                    try {
                        document.getElementById("file-input").click();
                    } catch (e) {
                        console.log(e);
                    }
                    break
                case '保存':
                    let map = this.mapWnd.getMap()
                    // let t = map.hello();
                    let ret = map.save("我的态势标注.json")
                    console.log(ret);
                    break
                case '点':
                    this.mapWnd.setTool('Point')
                    break
                case '线段':
                    this.mapWnd.setTool('Line')
                    break
                case '折线':
                    this.mapWnd.setTool('Polyline')
                    break
                case '多边形':
                    this.mapWnd.setTool('Polygon')
                    break
                case "矩形":
                    this.mapWnd.setTool("Rectangle");
                    break
                case "圆形":
                    this.mapWnd.setTool("Circle");
                    break
                case "圆弧":
                    this.mapWnd.setTool("Arc");
                    break
                case "曲线":
                    this.mapWnd.setTool("Curve");
                    break
                case "拱形":
                    this.mapWnd.setTool("Arch");
                    break
                case "曲面":
                    this.mapWnd.setTool("CurvedSurface");
                    break
                case "椭圆":
                    this.mapWnd.setTool("Ellipse");
                    break
                case "直细箭头":
                    this.mapWnd.setTool("StraightThinArrow");
                    break
                case "粗尖头箭头":
                    this.mapWnd.setTool("FatPointedArrow")
                    break
                case "粗直箭头":
                    this.mapWnd.setTool("FatStraightArrow")
                    break
                case "进攻方向":
                    this.mapWnd.setTool("AttackArrow")
                    break
                case "进攻方向（尾）":
                    this.mapWnd.setTool("AttackArrowTail")
                    break
                case "分队战斗行动":
                    this.mapWnd.setTool("SquadCombatArrow")
                    break
                case "分队战斗行动（尾）":
                    this.mapWnd.setTool("SquadCombatArrowTail")
                    break
                case "双箭头":
                    this.mapWnd.setTool("DoubleArrow")
                    break
                case "矩形旗":
                    this.mapWnd.setTool("RectangleFlag")
                    break
                case "三角旗":
                    this.mapWnd.setTool("TriangleFlag")
                    break
                case "曲面旗":
                    this.mapWnd.setTool("CurveFlag")
                    break
                case "集结地":
                    this.mapWnd.setTool("GatheringPlace")
                    break
            }
        },
        handleChange(e) {
            let plotLayer = this.mapWnd.getMap().getEditPlotLayer();

            plotLayer.close();
            var file = e.target.files[0];
            console.log(file);
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = (readerEvent) => {
                var content = readerEvent.target.result; // this is the content!
                let json = JSON.parse(content);
                plotLayer.load(json);
            };
        },
    }
})