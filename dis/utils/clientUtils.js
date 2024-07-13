class SignalRClient {
    constructor(url) {
        this.url = url;
        this.connection = null;
        this.listenPromise = null;
        this.reconnectInterval = 5000; // 重连间隔时间，例如5000毫秒（5秒）
    }

    // build 方法，建立连接
    static build(url) {
        const client = new SignalRClient(url);
        client.connection = new signalR.HubConnectionBuilder()
            .withUrl(client.url)
            .configureLogging(signalR.LogLevel.Information)
            .build();

        return client;
    }

    listen(event, handler) {
        let self = this;
        if (!self.connection) {
            console.error("Connection not established.");
            throw new Error("Connection not established");
        } else {
            self.connection.on(event, (message) => {
                console.log(`Message copied from ${event}: ${message}`);
                self.eventHandle(event, message, handler);
            });

            self.startConnection(event);
        };
    }

    startConnection(event) {
        let self = this;
        self.connection.start().then(() => {
            console.log("Connected to SignalR ", event, "server ");
        }).catch(err => {
            console.error("Error connecting to SignalR ", event, "server: ", err);
            setTimeout(() => self.startConnection(event), self.reconnectInterval); // 尝试重新连接
        });
    }

    eventHandle(event, msg, handler) {
        // event第一个字母大写
        let methodName = "on" + event.charAt(0).toUpperCase() + event.slice(1);
        console.log("methodName:" + methodName);

        if (typeof handler[methodName] === 'function') {
            handler[methodName](msg); // 调用方法
        } else {
            console.error("Method not found: " + methodName);
            throw new Error("Method not found: " + methodName); // 抛出异常
        }
    }
}

class HttpClient {
    constructor() {
    }
    static build() {
        return new HttpClient();
    }

    post(url, data, callback, errorHandle) {
        let self = this;
        self.url = url;

        // 使用 fetch 进行 POST 请求
        fetch(url, {
            method: 'POST', // 使用 POST 方法
            headers: {
                'Content-Type': 'application/json' // 设置请求头，表明发送的是 JSON 数据
            },
            body: JSON.stringify(data) // 将 JavaScript 对象转换为 JSON 字符串
        })
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json(); // 将响应解析为 JSON
            })
            .then(d => {
                console.log('Response data:', d);
                callback(d);
            })
            .catch(error => {
                console.error(error);
                errorHandle(error);
            });
    }

    get(url, handler, event) {
        let self = this;
        self.url = url;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.status);
                }
                return response.json(); // 解析 JSON 数据
            })
            .then(data => {
                self.eventHandle(data, handler, event);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    parseEventName(url) {
        // 使用 URL 对象解析传入的 URL
        const parsedUrl = new URL(url);
        // 获取路径部分，并去除首尾的斜杠
        const path = parsedUrl.pathname.replace(/^\/|\/$/g, '');
        // 将路径分割成数组
        const segments = path.split('/');

        // 根据路径段的数量选择操作
        if (segments.length === 0) {
            return ''; // 没有路径
        } else if (segments.length === 1) {
            // 只有一个路径节点，首字母大写
            return segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
        } else {
            // 取最后两个路径节点
            const lastTwoSegments = segments.slice(-2);
            // 将每个部分转换为首字母大写
            const formattedSegments = lastTwoSegments.map(segment =>
                segment.charAt(0).toUpperCase() + segment.slice(1)
            );
            // 将处理后的部分连接成一个字符串
            return formattedSegments.join('');
        }
    }

    eventHandle(msg, handler, event) {
        const eventName = event ? event : "on" + this.parseEventName(this.url);
        handler[eventName](msg);
    }
}

