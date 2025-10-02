export interface LogTrackerConfig {
    url: string;
    application_id: string;
    public_key: string;
}

type Session = 'pre-authentication' | 'authenticated' | 'refresh-authentication';
type Event = 'page_view' | 'click' | 'error';

interface JsonObject {
    [key: string]: any;
}

interface SessionStartRequest {
    type: Session;
    user: string;
    linkId?: string | null;
    metadata?: JsonObject | null;
    timestamp: string;
    endAt: string;
}

interface SessionStartResponse {
    session_id: string;
}

interface ErrorResponse {
    error: string;
}

interface TrackSessionOptional {
    linkId?: string | null;
    metadata?: JsonObject | null;
    timeout?: number;
}

class LogTrackerError extends Error {
    constructor(message: string, public status: number) {
        super(message);
        this.name = 'LogTrackerError';
    }
}

class LogTrackerServerClient {
    private url: string;
    private application_id: string;
    private public_key: string;

    constructor(config: LogTrackerConfig) {
        this.url = config.url;
        this.application_id = config.application_id;
        this.public_key = config.public_key;
    }

    private getHeaders(): HeadersInit {
        return {
            'Content-Type': 'application/json',
            'x-application-id': this.application_id,
            'x-public-key': this.public_key
        };
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        const data = await response.json();

        if (!response.ok) {
            const errorData = data as ErrorResponse;
            throw new LogTrackerError(
                errorData.error || 'An error occurred',
                response.status
            );
        }

        return data as T;
    }

    async trackSession(type: Session, user: string, optional: TrackSessionOptional = {}): Promise<string> {
        const {
            linkId = null,
            metadata = null,
            timeout = 30
        } = optional;

        const requestBody: SessionStartRequest = {
            type,
            user,
            linkId,
            metadata,
            timestamp: new Date().toISOString(),
            endAt: new Date(new Date().getTime() + timeout * 60 * 1000).toISOString()
        };

        const response = await fetch(`${this.url}/track/sessions`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(requestBody)
        });

        const result = await this.handleResponse<SessionStartResponse>(response);
        return result.session_id;
    }

    async untrackSession(id: string): Promise<void> {
        const response = await fetch(`${this.url}/track/sessions/${id}/end`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ timestamp: new Date().toISOString() })
        });

        await this.handleResponse<void>(response);
    }
}

export const createLogTrackerClient = (config: LogTrackerConfig) => {
    return new LogTrackerServerClient(config);
}

export default LogTrackerServerClient;
export { LogTrackerServerClient, LogTrackerError };