import * as Prox from '../../ProxyServer/Proxy.js'
export class APIServices {
    constructor(url, method, data) {
        
        this.setURL(url);
        this.setMethod(method);
        this.setData(data);
    }
    
    setAuthToken(authToken) {
        if (authToken != undefined) {
            this.authToken = authToken;
        }
    }
    
    setMethod(method) {
        if (method != undefined) {
            this.method = method.toLowerCase();
        }
    }
    
    setData(data) {
        if (data != undefined) {
            this.data = data;
        }
    }
    
    setURL(url) {
        if (url != undefined) {
            this.url = url;
        }
    }
    
    startService() {
        
        let proxy = new Prox.Proxy();
        
        if (this.method == "post") {
            return proxy.sendPostRequest(this.url, this.data);
        } else if (this.method == "get") {
            return proxy.sendGetRequest(this.url);
        } else {
            return;
        }
        
    }
}