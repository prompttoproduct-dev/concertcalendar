# Security Implementation

This directory contains comprehensive security measures for the CitySounds NYC project.

## Components

### 1. **validation.ts** - Input Validation & Sanitization
- **Webhook payload validation** using Zod schemas for Ticketmaster and Eventbrite
- **Search query validation** with regex patterns to prevent injection attacks
- **API key format validation** to ensure proper key structure
- **String sanitization** removes dangerous characters and limits length
- **Header validation** for webhook authentication

### 2. **crypto.ts** - Cryptographic Operations
- **HMAC signature validation** for webhook authenticity
  - Ticketmaster: SHA256 with hex encoding
  - Eventbrite: SHA256 with base64 encoding
- **Timing-safe comparison** prevents timing attacks
- **Secure token generation** for internal use
- **Data hashing** for sensitive information

### 3. **rate-limiting.ts** - Rate Limiting & Abuse Prevention
- **IP-based rate limiting**: 100 requests per 15 minutes
- **Automatic cleanup** of expired entries
- **Configurable thresholds** for different endpoints
- **Memory-efficient tracking** with automatic garbage collection

### 4. **environment.ts** - Secure Configuration Management
- **API key validation** ensures proper format and length
- **Required environment variable checking**
- **Sensitive data masking** for logs and error messages
- **Centralized key management** with caching

### 5. **audit-log.ts** - Security Event Monitoring
- **Comprehensive event logging** for security incidents
- **Severity-based handling** (low, medium, high, critical)
- **Database persistence** for critical events
- **Automated alerting** through console logging
- **Payload sanitization** removes sensitive information

## Security Events Tracked

| Event Type | Severity | Description |
|------------|----------|-------------|
| `webhook_received` | Low | Normal webhook reception |
| `invalid_signature` | High | Failed signature validation |
| `rate_limit_exceeded` | Medium | IP exceeded rate limits |
| `validation_failed` | Medium | Invalid payload structure |
| `suspicious_query` | Medium | Potentially malicious search patterns |

## Implementation Status

✅ **Phase 1: Critical Webhook Security**
- HMAC signature validation implemented
- Input validation with Zod schemas
- Rate limiting protection
- Security headers added
- Environment validation

✅ **Phase 2: Input Validation Hardening**
- Search query sanitization
- Parameterized database queries
- API parameter validation
- Error message sanitization

✅ **Phase 3: Configuration Security**
- Database function security (search_path fixed)
- Security event logging table
- Audit trail implementation

⚠️ **Phase 4: Remaining Manual Configuration**
- OTP expiry settings (requires Supabase dashboard configuration)

## Usage Examples

### Webhook Security
```typescript
// Automatic validation in webhook handlers
const result = await webhookHandler.handleTicketmasterWebhook(
  req.body,
  req.headers,
  clientIp
)
```

### Search Validation
```typescript
// All searches are automatically validated
const results = await apiService.searchConcerts({
  query: "jazz concert",  // Sanitized and validated
  priceRange: "under-50"  // Enum validation
})
```

### Security Monitoring
```typescript
// Automatic logging of security events
await AuditLogger.logInvalidSignature('ticketmaster', clientIp)
```

## Security Best Practices Implemented

1. **Defense in Depth**: Multiple layers of validation and security
2. **Principle of Least Privilege**: Restrictive database policies
3. **Input Validation**: All user inputs validated and sanitized
4. **Secure Communication**: HMAC signatures for webhook authentication
5. **Rate Limiting**: Protection against abuse and DoS attacks
6. **Audit Logging**: Complete trail of security events
7. **Error Handling**: No sensitive information in error messages
8. **Configuration Security**: Secure environment variable management

## Monitoring & Alerts

Security events are logged with appropriate severity levels:
- **Console logging** for immediate monitoring
- **Database storage** for critical events requiring investigation
- **Structured logging** for easy parsing and analysis

## Next Steps

1. **Monitor security logs** for unusual patterns
2. **Configure OTP expiry** in Supabase dashboard (≤ 10 minutes recommended)
3. **Set up external monitoring** for critical security events
4. **Regular security audits** of webhook endpoints
5. **Update API keys regularly** following rotation best practices