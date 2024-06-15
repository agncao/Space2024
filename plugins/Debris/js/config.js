/*
 * @Descripttion:
 * @version:
 * @Author: alan.lau
 * @Date: 2022-03-25 16:24:15
 * @LastEditors: alan.lau
 * @LastEditTime: 2022-07-03 18:47:15
 */
const config = {
    debris9: 'http://www.astrox.cn:8765/ssc',
    satcat: 'satcat.txt',
    debris: 'ssc.json',
    style: {
        active: {
            billboardSymbolizer: {
                color: '#00ff00',
                pixelSize: 5.5
            }
        },
        dead: {
            billboardSymbolizer: {
                color: '#ffa500',
                pixelSize: 5.5
            }
        },
        debris: {
            billboardSymbolizer: {
                color: '#808080',
                pixelSize: 5.5
            }
        },
        rocket: {
            billboardSymbolizer: {
                color: '#ff1919',
                pixelSize: 6.5
            }
        },
        unknown: {
            billboardSymbolizer: {
                color: '#ffffff',
                pixelSize: 5.5
            }
        },
        label: {
            textSymbolizer: {
                fontsize: 16,
                color: '#ffff00'
            }
        }
    }
}
window.config = config;