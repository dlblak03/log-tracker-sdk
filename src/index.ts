export interface LogTrackerConfig {
    url: string;
    application_id: string;
    public_key: string;
}

type Session = 'pre-authentication' | 'authenticated' | 'refresh-authentication';
type Event = 'page_view' | 'click' | 'error';

class LogTrackerServerClient {
    private url: string;
    private application_id: string;
    private public_key: string;

    constructor(config: LogTrackerConfig) {
        this.url = config.url;
        this.application_id = config.application_id;
        this.public_key = config.public_key;
    }

    async trackSession(type: Session, user: string, linkId: string | null = null): Promise<string> {
        const response = await fetch(`${this.url}/track/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Application-ID': this.application_id,
                'X-Public-Key': this.public_key
            },
            body: JSON.stringify({ type, user, linkId, timestamp: new Date().toISOString() })
        });

        const result = await response.json();
        return result.session_id;
    }

    async untrackSession(id: string) {
        const response = await fetch(`${this.url}/track/sessions/${id}/end`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Application-ID': this.application_id,
                'X-Public-Key': this.public_key
            },
            body: JSON.stringify({ timestamp: new Date().toISOString() })
        });
    }
}

export const createLogTrackerClient = (config: LogTrackerConfig) => {
    return new LogTrackerServerClient(config);
}

export default LogTrackerServerClient;
export { LogTrackerServerClient };