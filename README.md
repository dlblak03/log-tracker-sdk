# LogTracker.js

A lightweight JavaScript SDK for tracking user sessions and events in your applications.

## Installation

```bash
npm install logtracker.js
```

## Quick Start

```javascript
import { createLogTrackerClient } from 'logtracker.js';

const client = createLogTrackerClient({
  url: 'https://your-log-analyzer.com',
  application_id: 'your-app-id',
  public_key: 'your-public-key'
});
```

## Usage

### Starting a Session

Track when a user starts a session in your application:

```javascript
const sessionId = await client.trackSession(
  'pre-authentication',  // Session type
  'user@example.com',    // User identifier
  {
    linkId: 'link-123',        // Optional: Link ID
    metadata: { device: 'mobile' },  // Optional: Metadata object
    timeout: 30                // Optional: Session timeout in minutes (default: 30)
  }
);

console.log('Session started:', sessionId);
```

**Session Types:**
- `'pre-authentication'` - Before user logs in
- `'authenticated'` - After user logs in
- `'refresh-authentication'` - When refreshing auth tokens

**Note:** Sessions automatically expire after the specified timeout period. Call `untrackSession()` to end a session early.

### Ending a Session

Track when a user's session ends:

```javascript
await client.untrackSession(sessionId);
```

## API Reference

### `createLogTrackerClient(config)`

Creates a new LogTracker client instance.

**Parameters:**
- `config.url` (string) - Base URL of your log analyzer server
- `config.application_id` (string) - Your application ID
- `config.public_key` (string) - Your public API key

**Returns:** `LogTrackerServerClient`

---

### `trackSession(type, user, optional?)`

Starts tracking a new user session.

**Parameters:**
- `type` (Session) - Type of session: `'pre-authentication'`, `'authenticated'`, or `'refresh-authentication'`
- `user` (string) - User identifier (email, username, or user ID)
- `optional` (object, optional) - Optional configuration object:
  - `linkId` (string | null) - Optional link or referral ID
  - `metadata` (object | null) - Optional metadata object with additional session information
  - `timeout` (number) - Session timeout in minutes (default: 30)

**Returns:** `Promise<string>` - The session ID

**Example:**
```javascript
const sessionId = await client.trackSession(
  'authenticated',
  'john.doe@example.com',
  {
    linkId: 'ref-123',
    metadata: {
      browser: 'Chrome',
      version: '120.0.0',
      platform: 'MacOS'
    },
    timeout: 60  // Session expires in 60 minutes
  }
);
```

---

### `untrackSession(id)`

Ends a tracked session.

**Parameters:**
- `id` (string) - The session ID returned from `trackSession()`

**Returns:** `Promise<void>`

**Example:**
```javascript
await client.untrackSession(sessionId);
```

## Error Handling

The SDK throws `LogTrackerError` for failed requests:

```javascript
import { LogTrackerError } from 'logtracker.js';

try {
  const sessionId = await client.trackSession(
    'authenticated',
    'user@example.com'
  );
} catch (error) {
  if (error instanceof LogTrackerError) {
    console.error('Status:', error.status);
    console.error('Message:', error.message);
  }
}
```

**Common Error Codes:**
- `400` - Bad request (missing required fields)
- `401` - Unauthorized (invalid credentials)
- `500` - Server error

## Complete Example

```javascript
import { createLogTrackerClient, LogTrackerError } from 'logtracker.js';

// Initialize client
const client = createLogTrackerClient({
  url: 'https://analytics.myapp.com',
  application_id: 'app_123',
  public_key: 'pk_abc123'
});

async function trackUserSession(userId) {
  try {
    // Start session with 45-minute timeout
    const sessionId = await client.trackSession(
      'authenticated',
      userId,
      {
        metadata: { source: 'web-app' },
        timeout: 45
      }
    );

    console.log('Session started:', sessionId);

    // ... your application logic ...

    // End session when user logs out (or wait for automatic timeout)
    await client.untrackSession(sessionId);
    console.log('Session ended');

  } catch (error) {
    if (error instanceof LogTrackerError) {
      console.error(`Error ${error.status}: ${error.message}`);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

trackUserSession('user@example.com');
```

## TypeScript Support

This SDK is written in TypeScript and includes type definitions:

```typescript
import {
  createLogTrackerClient,
  LogTrackerConfig,
  LogTrackerError
} from 'logtracker.js';

const config: LogTrackerConfig = {
  url: 'https://your-server.com',
  application_id: 'app-id',
  public_key: 'public-key'
};

const client = createLogTrackerClient(config);
```

## License

MIT

## Author

Dalton Lee Blake
