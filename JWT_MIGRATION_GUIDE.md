# JWT Authentication Migration Guide

## Overview

The AI Movie Recommender API has been upgraded from traditional API key authentication to JSON Web Token (JWT) based authentication, providing enhanced security, better session management, and improved scalability.

## Key Benefits of JWT Authentication

- **Enhanced Security**: Stateless tokens with built-in expiration
- **Better Performance**: Reduced Redis dependency for authentication
- **Session Management**: Refresh token rotation and token revocation
- **Granular Permissions**: Role-based access control
- **Standard Protocol**: Industry-standard authentication flow

## Migration Process

### Backward Compatibility

🎉 **Good News!** Your existing API keys will continue to work during the transition period. The API now supports **hybrid authentication** - both legacy API keys and new JWT tokens.

### Authentication Methods Supported

#### 1. JWT Authentication (Recommended)
```javascript
// Get JWT token first
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ apiKey: 'your-api-key' })
});

const { data } = await loginResponse.json();
const { accessToken } = data;

// Use JWT token for API requests
const response = await fetch('/api/search?q=action movies', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

#### 2. Legacy API Key (Still Supported)
```javascript
// Your existing code continues to work
const response = await fetch('/api/search?q=action movies', {
  headers: { 'X-RapidAPI-Key': 'your-api-key' }
});

// Or with Authorization header
const response = await fetch('/api/search?q=action movies', {
  headers: { 'Authorization': 'your-api-key' }
});
```

## New Authentication Endpoints

### 1. Login - Exchange API Key for JWT
```http
POST /api/auth/login
Content-Type: application/json

{
  "apiKey": "your-api-key",
  "email": "user@example.com" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "24h",
    "tokenType": "Bearer",
    "user": {
      "userId": "user_12345678",
      "email": "user@example.com",
      "plan": "basic",
      "permissions": ["read", "search", "details"],
      "rateLimit": {
        "requests": 100,
        "window": "1h"
      }
    }
  }
}
```

### 2. Refresh - Get New Access Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### 3. Validate - Check Token Status
```http
GET /api/auth/validate
Authorization: Bearer your-access-token
```

### 4. Revoke - Logout/Invalidate Token
```http
POST /api/auth/revoke
Authorization: Bearer your-access-token
```

## Client Implementation Examples

### JavaScript/Node.js with Auto-Refresh

```javascript
class ScreenpickClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.accessToken = null;
    this.refreshToken = null;
  }

  async login() {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: this.apiKey })
    });

    if (response.ok) {
      const { data } = await response.json();
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      return data;
    }
    throw new Error('Login failed');
  }

  async refreshAccessToken() {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });

    if (response.ok) {
      const { data } = await response.json();
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      return data;
    }
    throw new Error('Token refresh failed');
  }

  async apiCall(endpoint, options = {}) {
    if (!this.accessToken) {
      await this.login();
    }

    let response = await fetch(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': \`Bearer \${this.accessToken}\`
      }
    });

    // Auto-refresh on token expiry
    if (response.status === 401) {
      await this.refreshAccessToken();
      response = await fetch(endpoint, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': \`Bearer \${this.accessToken}\`
        }
      });
    }

    return response;
  }

  async search(query) {
    const response = await this.apiCall(\`/api/search?q=\${encodeURIComponent(query)}\`);
    return response.json();
  }

  async getMovieDetails(movieId) {
    const response = await this.apiCall(\`/api/details?id=\${movieId}\`);
    return response.json();
  }
}

// Usage
const client = new ScreenpickClient('your-api-key');
const movies = await client.search('romantic comedies');
```

### Python Implementation

```python
import requests
import json
from datetime import datetime, timedelta

class ScreenpickClient:
    def __init__(self, api_key, base_url='https://screenpick.fun'):
        self.api_key = api_key
        self.base_url = base_url
        self.access_token = None
        self.refresh_token = None
        self.token_expires_at = None

    def login(self):
        response = requests.post(
            f'{self.base_url}/api/auth/login',
            json={'apiKey': self.api_key}
        )
        
        if response.status_code == 200:
            data = response.json()['data']
            self.access_token = data['accessToken']
            self.refresh_token = data['refreshToken']
            # Assume token expires in 24 hours
            self.token_expires_at = datetime.now() + timedelta(hours=23)
            return data
        else:
            raise Exception(f'Login failed: {response.text}')

    def refresh_access_token(self):
        response = requests.post(
            f'{self.base_url}/api/auth/refresh',
            json={'refreshToken': self.refresh_token}
        )
        
        if response.status_code == 200:
            data = response.json()['data']
            self.access_token = data['accessToken']
            self.refresh_token = data['refreshToken']
            self.token_expires_at = datetime.now() + timedelta(hours=23)
            return data
        else:
            raise Exception(f'Token refresh failed: {response.text}')

    def get_headers(self):
        if not self.access_token or datetime.now() >= self.token_expires_at:
            if self.refresh_token:
                self.refresh_access_token()
            else:
                self.login()
        
        return {'Authorization': f'Bearer {self.access_token}'}

    def search(self, query):
        response = requests.get(
            f'{self.base_url}/api/search',
            params={'q': query},
            headers=self.get_headers()
        )
        return response.json()

    def get_movie_details(self, movie_id):
        response = requests.get(
            f'{self.base_url}/api/details',
            params={'id': movie_id},
            headers=self.get_headers()
        )
        return response.json()

# Usage
client = ScreenpickClient('your-api-key')
movies = client.search('romantic comedies')
```

## Migration Timeline

### Phase 1: Immediate (Now Available)
- ✅ JWT infrastructure deployed
- ✅ New authentication endpoints live
- ✅ Hybrid authentication support
- ✅ Backward compatibility maintained

### Phase 2: Recommended Adoption (Next 3 months)
- 📅 Update your applications to use JWT authentication
- 📅 Test new authentication flow in staging
- 📅 Implement token refresh logic

### Phase 3: Legacy Deprecation (6+ months)
- 📅 Legacy API key authentication will be deprecated
- 📅 Advanced JWT features (role-based permissions)
- 📅 Enhanced security features

## Error Handling

### JWT-Specific Errors

```json
{
  "success": false,
  "error": {
    "code": "token_expired",
    "message": "Token has expired",
    "details": "Use refresh token to obtain new access token",
    "requestId": "req_123456",
    "timestamp": "2025-09-16T10:30:00Z"
  }
}
```

### Common Error Codes
- `invalid_api_key`: API key not recognized
- `token_expired`: Access token has expired
- `invalid_refresh_token`: Refresh token is invalid or expired
- `insufficient_permissions`: User lacks required permissions
- `rate_limit_exceeded`: API rate limit exceeded

## Best Practices

### 1. Token Storage
```javascript
// Store tokens securely
localStorage.setItem('screenpick_access_token', accessToken);
localStorage.setItem('screenpick_refresh_token', refreshToken);

// For server-side applications, use secure session storage
```

### 2. Automatic Token Refresh
```javascript
// Implement automatic token refresh
const interceptor = (response) => {
  if (response.status === 401) {
    return refreshToken().then(() => retryRequest());
  }
  return response;
};
```

### 3. Error Handling
```javascript
// Handle different authentication states
try {
  const result = await apiCall();
} catch (error) {
  if (error.code === 'token_expired') {
    await refreshToken();
    return retryRequest();
  }
  throw error;
}
```

### 4. Security Considerations
- Store refresh tokens securely
- Implement token rotation
- Use HTTPS in production
- Handle token expiration gracefully
- Implement logout functionality

## Testing Your Migration

### 1. Test JWT Login
```bash
curl -X POST https://screenpick.fun/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"apiKey": "your-api-key"}'
```

### 2. Test API with JWT
```bash
curl -X GET "https://screenpick.fun/api/search?q=action%20movies" \\
  -H "Authorization: Bearer your-jwt-token"
```

### 3. Test Legacy API Key (Backward Compatibility)
```bash
curl -X GET "https://screenpick.fun/api/search?q=action%20movies" \\
  -H "X-RapidAPI-Key: your-api-key"
```

## Support

If you need assistance with the migration:
- 📧 Email: support@screenpick.fun
- 📚 Documentation: https://screenpick.fun/docs
- 🐛 Issues: Create a GitHub issue

## FAQ

**Q: Do I need to change my code immediately?**
A: No, your existing API key authentication will continue to work. We recommend migrating to JWT for better security and features.

**Q: What happens to my existing API key?**
A: Your API key remains valid and can be used to obtain JWT tokens through the login endpoint.

**Q: How long do JWT tokens last?**
A: Access tokens expire in 24 hours, refresh tokens expire in 7 days.

**Q: Can I use both authentication methods?**
A: Yes, the API supports hybrid authentication during the transition period.

**Q: Will rate limits change?**
A: No, your existing rate limits are preserved and enhanced with JWT authentication.
