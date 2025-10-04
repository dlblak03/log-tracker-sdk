export interface LogTrackerConfig {
    url: string;
    application_id: string;
    public_key: string;
}

type Session = 'pre-authentication' | 'authenticated' | 'refresh-authentication';
type FrontendEvent =
    // Core interactions
    | 'page_view'
    | 'click'
    | 'form_submit'

    // Errors
    | 'error';
type BackendEvent =
    // API
    | 'api_call'

    // Auth
    | 'auth_attempt'
type BackendErrorEvent =
    // Errors
    | 'auth_failure'
    | 'api_error'
    | 'error'
    | 'validation_error';
type BackendSuccessEvent =
    // Success
    | 'api_success'
    | 'auth_success'

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

interface EventStartResponse {
    event_id: string;
}

interface ErrorResponse {
    error: string;
}

interface TrackSessionOptional {
    linkId?: string;
    metadata?: JsonObject;
    timeout?: number;
}

interface TrackBackendOptional {
    linkId?: string;
    metadata?: JsonObject;
}

interface TrackBackendEventObject {
    sessionId: string;
    source: 'Backend';
    type: BackendEvent | BackendErrorEvent | BackendSuccessEvent;
    linkId: string | null;
    metadata: JsonObject | null;
    startTime: number;
}

interface BackendEventRequest {
    sessionId: string;
    source: 'Backend';
    type: BackendEvent | BackendErrorEvent | BackendSuccessEvent;
    linkId: string | null;
    metadata: JsonObject | null;
    duration: number;
    timestamp: string;
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

        const response = await fetch(`${this.url}/api/track/sessions`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(requestBody)
        });

        const result = await this.handleResponse<SessionStartResponse>(response);
        return result.session_id;
    }

    async untrackSession(sessionId: string): Promise<void> {
        const response = await fetch(`${this.url}/api/track/sessions/${sessionId}/end`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ timestamp: new Date().toISOString() })
        });

        await this.handleResponse<void>(response);
    }

    trackBackendEvent(type: BackendEvent, sessionId: string, optional: TrackBackendOptional = {}): TrackBackendEventObject {
        const {
            linkId = null,
            metadata = null
        } = optional;

        return {
            sessionId,
            source: 'Backend',
            type,
            linkId,
            metadata,
            startTime: performance.now()
        };
    }

    async untrackBackendEvent(eventObject: TrackBackendEventObject): Promise<string> {
        const duration = performance.now() - eventObject.startTime;

        const requestBody: BackendEventRequest = {
            sessionId: eventObject.sessionId,
            source: eventObject.source,
            type: eventObject.type,
            linkId: eventObject.linkId,
            metadata: eventObject.metadata,
            duration,
            timestamp: new Date().toISOString()
        };

        const response = await fetch(`${this.url}/api/track/events/backend`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(requestBody)
        });

        const result = await this.handleResponse<EventStartResponse>(response);
        return result.event_id;
    }

    async trackBackendErrorEvent(type: BackendErrorEvent, sessionId: string, optional: TrackBackendOptional = {}): Promise<string> {
        const {
            linkId = null,
            metadata = null
        } = optional;
        
        const requestBody: BackendEventRequest = {
            sessionId: sessionId,
            source: 'Backend',
            type: type,
            linkId: linkId,
            metadata: metadata,
            duration: 1,
            timestamp: new Date().toISOString()
        };

        const response = await fetch(`${this.url}/api/track/events/backend`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(requestBody)
        });

        const result = await this.handleResponse<EventStartResponse>(response);
        return result.event_id;
    }

    async trackBackendSuccessEvent(type: BackendSuccessEvent, sessionId: string, optional: TrackBackendOptional = {}): Promise<string> {
        const {
            linkId = null,
            metadata = null
        } = optional;
        
        const requestBody: BackendEventRequest = {
            sessionId: sessionId,
            source: 'Backend',
            type: type,
            linkId: linkId,
            metadata: metadata,
            duration: 1,
            timestamp: new Date().toISOString()
        };

        const response = await fetch(`${this.url}/api/track/events/backend`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(requestBody)
        });

        const result = await this.handleResponse<EventStartResponse>(response);
        return result.event_id;
    }
}

export const createLogTrackerServerClient = (config: LogTrackerConfig) => {
    return new LogTrackerServerClient(config);
}

export default LogTrackerServerClient;
export { LogTrackerServerClient, LogTrackerError };