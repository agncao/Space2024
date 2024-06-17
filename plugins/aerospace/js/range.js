/**
 * 参考代码： https://www.jq22.com/code2592
 */
let initRange = (function () {
    /**
     * 
     * @param {*} containerId 
     * @param {*} option 对象
     * option = {min,max,current}
     */
    var init = function (containerId, option) {
        const container = document.getElementById(containerId);
        if (!container) {
            return;
        }
        // 创建温度计 div
        const base = document.createElement('div');
        base.setAttribute('id', 'temperature-base');
        container.appendChild(base);
        // 温度计容器
        const temperatureContainer = document.createElement('div');
        temperatureContainer.setAttribute('id', 'termometer');
        base.appendChild(temperatureContainer);

        // 温度计
        const temperature = document.createElement('div');
        temperature.setAttribute('id', 'temperature');
        // temperature.style.height = '0';
        temperature.setAttribute('data-value', '0°C');
        temperatureContainer.appendChild(temperature);

        // 温度计 graduations
        const graduations = document.createElement('div');
        graduations.setAttribute('id', 'graduations');
        temperatureContainer.appendChild(graduations);


        // 创建一个 div 放到 container 中
        const playground = document.createElement('div');
        playground.setAttribute('id', 'playground');
        container.appendChild(playground);

        // const rangeContainer = document.createElement('div');
        // rangeContainer.setAttribute('id', 'range');
        // 创建三个 input 放到 rangeContainer 中
        // const inputMin = document.createElement('input');
        // inputMin.setAttribute('type', 'text');
        // inputMin.setAttribute('id', 'minTemp');
        // inputMin.setAttribute('value', option.min);
        // rangeContainer.appendChild(inputMin);

        // const inputCurrent = document.createElement('input');
        // inputCurrent.setAttribute('id', 'input-current');
        // inputCurrent.setAttribute('type', 'range');
        // inputCurrent.setAttribute('min', option.min);
        // inputCurrent.setAttribute('max', option.max);
        // inputCurrent.setAttribute('value', option.current);
        // rangeContainer.appendChild(inputCurrent);

        // const inputMax = document.createElement('input');
        // inputMax.setAttribute('type', 'text');
        // inputMax.setAttribute('id', 'maxTemp');
        // inputMax.setAttribute('value', option.max);
        // rangeContainer.appendChild(inputMax);

        // 创建 unit p 标签
        // const unit = document.createElement('p');
        // unit.setAttribute('id', 'unit');
        // unit.innerHTML = "°C";
        // playground.appendChild(unit);

        // playground.appendChild(rangeContainer);

        base.appendChild(playground);

        const units = {
            Celcius: "°C",
            Fahrenheit: "°F"
        };

        const config = {
            minTemp: option.min,
            maxTemp: option.max,
            unit: "Celcius"
        };


        // Change min and max temperature values
        // const tempValueInputs = document.querySelectorAll("input[type='text']");

        // tempValueInputs.forEach(input => {
        //     input.addEventListener("change", event => {
        //         const newValue = event.target.value;

        //         if (isNaN(newValue)) {
        //             return input.value = config[input.id];
        //         } else {
        //             config[input.id] = input.value;
        //             range[input.id.slice(0, 3)] = config[input.id]; // Update range
        //             return setTemperature(); // Update temperature
        //         }
        //     });
        // });

        // Change temperature

        const range = document.querySelector("#input-current");
        console.log('setTemperature range', range);
        // const temperature = document.getElementById("temperature");

        function setTemperature() {
            temperature.style.height = (option.current - config.minTemp) / (config.maxTemp - config.minTemp) * 100 + "%";
            console.log('setTemperature temperature.style.height', temperature.style.height);
            temperature.dataset.value = option.current + units[config.unit];
            // console.log('setTemperature temperature.dataset.value', temperature.dataset.value);
        }

        // range.addEventListener("input", setTemperature);
        setTimeout(setTemperature);
    }

    return { init }

    // init('range', { min: -20, max: 50, current: 0 });
})()