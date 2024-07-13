/**
 * 参考代码： https://www.jq22.com/code2592
 */
let ThermometerChart = (function () {
    let ThermometerChart = {
        temperatureBase: null,
        temperatureContainer: null,
        temperatureSymbols: null,
        graduations: null,
        playground: null,

        init: function (containerId) {
            const container = document.getElementById(containerId);
            if (!container) {
                return;
            }
            // 创建温度计 div
            this.temperatureBase = document.getElementById('temperature-base');
            if (!this.temperatureBase) {
                this.temperatureBase = document.createElement('div');
                this.temperatureBase.setAttribute('id', 'temperature-base');
                container.appendChild(this.temperatureBase);
            }

            // 温度计容器
            this.temperatureContainer = document.getElementById('thermometer');
            if (!this.temperatureContainer) {
                this.temperatureContainer = document.createElement('div');
                this.temperatureContainer.setAttribute('id', 'thermometer');
                this.temperatureBase.appendChild(this.temperatureContainer);
            }

            // 温度计
            this.temperatureSymbols = document.getElementById('temperature');
            if (!this.temperatureSymbols) {
                this.temperatureSymbols = document.createElement('div');
                this.temperatureSymbols.setAttribute('id', 'temperature');
                // temperature.style.height = '0';
                this.temperatureSymbols.setAttribute('data-value', '0°C');
                this.temperatureContainer.appendChild(this.temperatureSymbols);
            }

            // 温度计 graduations
            this.graduations = document.getElementById('graduations');
            if (!this.graduations) {
                this.graduations = document.createElement('div');
                this.graduations.setAttribute('id', 'graduations');
                this.temperatureContainer.appendChild(this.graduations);
            }

            // 生成刻度线和刻度文字
            const minTemp = this.config.minTemp;
            const maxTemp = this.config.maxTemp;
            const step = 20; // 刻度间隔

            for (let temp = minTemp; temp <= maxTemp; temp += step) {
                const graduation = document.createElement('div');
                graduation.classList.add('graduation');

                const label = document.createElement('span');
                label.classList.add('graduation-label');
                label.textContent = temp + ' °C';

                const labelLine = document.createElement('span');
                labelLine.classList.add('graduation-label-line');
                labelLine.textContent = '-';

                graduation.appendChild(label);
                graduation.appendChild(labelLine);
                this.graduations.appendChild(graduation);

                // 设置刻度线的位置
                const position = ((temp - minTemp) / (maxTemp - minTemp)) * 100;
                graduation.style.bottom = position + '%';
            }


            // 创建一个 div 放到 container 中
            this.playground = document.getElementById('playground');
            if (!this.playground) {
                this.playground = document.createElement('div');
                this.playground.setAttribute('id', 'playground');
                this.temperatureBase.appendChild(this.playground);
            }

            return this;
        },
        setOption: function (option) {
            this.temperatureSymbols.style.height =
                (option.current - this.config.minTemp) / (this.config.maxTemp - this.config.minTemp) * 100
                + "%";
            console.log('setTemperature temperature.style.height', this.temperatureSymbols.style.height);
            this.temperatureSymbols.dataset.value = option.current + this.units[this.config.unit];
            // console.log('setTemperature temperature.dataset.value', temperature.dataset.value);
        },
        units: {
            Celcius: "°C",
            Fahrenheit: "°F"
        },
        config: {
            minTemp: 0,
            maxTemp: 100,
            unit: "Celcius"
        },
    };
    return ThermometerChart;


    // init('range', { min: -20, max: 50, current: 0 });
})()