class LogTrackerServer {
    constructor(application_id, api_key, api_url) {
        this.application_id = application_id;
        this.api_key = api_key;
        this.api_url = api_url;
    }
}

class LogTrackerClient {
    constructor(proxy_url) {
        this.proxy_url = proxy_url;
    }
}