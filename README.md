# LogStream

JavaScript SDK for tracking user sessions and events.

## Setup

```javascript
import { createLogTrackerClient } from 'logstream';

const client = createLogTrackerClient({
  url: 'https://your-server.com',
  application_id: 'your-app-id',
  public_key: 'your-public-key'
});
```

## Usage

### Track Session

```javascript
const sessionId = await client.trackSession(
  'authenticated',
  'user@example.com',
  {
    linkId: 'link-123',
    metadata: { device: 'mobile' },
    timeout: 30  // minutes
  }
);
```

**Session Types:** `'pre_authentication'` | `'authenticated'` | `'refresh_authentication'`

### End Session

```javascript
await client.untrackSession(sessionId);
```

### Track Backend Events

```javascript
// Start tracking an event (e.g., API call, DB query)
const event = client.trackBackendEvent('api_call', sessionId, {
  linkId: 'request-123',
  metadata: { endpoint: '/api/users' }
});

// Complete the event (measures duration automatically)
const eventId = await client.untrackBackendEvent(event);
```

**Event Types:** `'api_call'` | `'auth_attempt'` | `'db_query'` | `'external_api_call'`

### Track Backend Success/Error Events

```javascript
// Track instant success event
await client.trackBackendSuccessEvent('auth_success', sessionId, {
  metadata: { userId: '123' }
});

// Track instant error event
await client.trackBackendErrorEvent('validation_error', sessionId, {
  metadata: { field: 'email' }
});
```

**Success Types:** `'api_success'` | `'auth_success'` | `'db_query_success'`
**Error Types:** `'api_error'` | `'auth_failure'` | `'validation_error'` | `'error'`

## Error Handling

```javascript
import { LogTrackerError } from 'logstream';

try {
  await client.trackSession('authenticated', 'user@example.com');
} catch (error) {
  if (error instanceof LogTrackerError) {
    console.error(error.status, error.message);
  }
}
```

## TypeScript

```typescript
import { createLogTrackerClient, LogTrackerConfig } from 'logstream';

const config: LogTrackerConfig = {
  url: 'https://your-server.com',
  application_id: 'app-id',
  public_key: 'public-key'
};
```

## License

MIT - Dalton Lee Blake
