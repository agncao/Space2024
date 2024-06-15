class SignalRClient {
    constructor(url) {
        this.url = url;
        this.connection = null;
        this.listenPromise = null;
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

            self.connection.start().then(() => {
                console.log("Connected to SignalR ",event,"server " );
            }).catch(err => {
                console.error("Error connecting to SignalR ",event,"server: ", err);
                throw err;
            });
        };
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
    static build(url) {
        return new HttpClient();
    }

    get(url, callback) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.json(); // 解析 JSON 数据
            })
            .then(data => {
                callback(data); // 使用解析后的数据调用回调函数
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}

