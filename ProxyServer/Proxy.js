export class Proxy {
    
    baseURL = "https://cy247w1nga.execute-api.us-west-2.amazonaws.com/three/";
    
    async sendPostRequest(url, data) {
        return await axios.post(this.baseURL + url, data);
    }
    
    async sendGetRequest(url) {
        console.log("Proxy GET Request", url);

        return await $.ajax({
            type: "GET",
            url: this.baseURL + url
        });
    }
            
}