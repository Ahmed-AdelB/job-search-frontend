# API Response Examples - Operations Pages

**Author:** Ahmed Adel Bakr Alderai
**Version:** 1.0

Complete JSON response examples for all API endpoints required by the operations pages.

---

## Deploy Endpoints

### GET /api/deploy/status

```json
{
  "status": "running",
  "current_version": "v1.2.45",
  "last_deploy_time": "2026-03-19T14:32:00Z",
  "uptime_seconds": 345600,
  "running": true
}
```

### GET /api/deploy/history

```json
{
  "history": [
    {
      "version": "v1.2.45",
      "date": "2026-03-19T14:32:00Z",
      "status": "success",
      "duration_seconds": 127,
      "triggered_by": "ahmed@example.com"
    },
    {
      "version": "v1.2.44",
      "date": "2026-03-19T12:15:00Z",
      "status": "success",
      "duration_seconds": 95,
      "triggered_by": "ci-system"
    },
    {
      "version": "v1.2.43",
      "date": "2026-03-19T09:45:00Z",
      "status": "failed",
      "duration_seconds": 45,
      "triggered_by": "ahmed@example.com"
    }
  ]
}
```

### POST /api/deploy/rebuild

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Build started successfully. Check status for updates."
}
```

### POST /api/deploy/rollback

**Request Body:**
```json
{
  "version": "v1.2.44"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rollback to v1.2.44 initiated"
}
```

---

## Logs Endpoints

### GET /api/logs

Query Parameters:
- `level` (optional): DEBUG, INFO, WARNING, ERROR, CRITICAL
- `agent` (optional): agent name filter
- `search` (optional): search text in message
- `limit` (default 100): number of logs
- `offset` (default 0): pagination offset

**Response:**
```json
{
  "logs": [
    {
      "timestamp": "2026-03-19T14:32:45.123Z",
      "level": "INFO",
      "agent": "job_discovery",
      "message": "Started job discovery for LinkedIn",
      "context": {
        "source": "linkedin",
        "job_count": 15,
        "duration_ms": 2340
      }
    },
    {
      "timestamp": "2026-03-19T14:32:30.456Z",
      "level": "WARNING",
      "agent": "email_sender",
      "message": "Rate limit approaching for Gmail account",
      "context": {
        "account": "sender@example.com",
        "remaining": 8,
        "limit": 100,
        "reset_in_minutes": 45
      }
    },
    {
      "timestamp": "2026-03-19T14:32:15.789Z",
      "level": "ERROR",
      "agent": "apply_executor",
      "message": "Failed to submit application",
      "context": {
        "job_id": "12345",
        "error_code": "form_field_validation",
        "field": "resume_file",
        "error_detail": "File size exceeds 5MB limit"
      }
    },
    {
      "timestamp": "2026-03-19T14:31:50.012Z",
      "level": "DEBUG",
      "agent": "authentication",
      "message": "JWT token validated",
      "context": {
        "user_id": "user_123",
        "token_age_seconds": 3600,
        "expiry_seconds": 7200
      }
    },
    {
      "timestamp": "2026-03-19T14:31:25.345Z",
      "level": "CRITICAL",
      "agent": "database",
      "message": "Database connection lost",
      "context": {
        "pool_size": 20,
        "active_connections": 15,
        "retry_count": 3,
        "last_retry_delay_ms": 5000
      }
    }
  ],
  "stats": {
    "error_count_today": 12,
    "warning_count_today": 47,
    "total_entries": 2845
  },
  "agents": [
    "job_discovery",
    "email_sender",
    "apply_executor",
    "authentication",
    "database",
    "outreach_campaign"
  ]
}
```

---

## Alerts/Notifications Endpoints

### GET /api/alerts

**Response:**
```json
{
  "notifications": [
    {
      "id": "notif_001",
      "type": "error",
      "title": "Application Failed",
      "message": "Failed to submit application to TechCorp - Validation Error",
      "read": false,
      "created_at": "2026-03-19T15:00:00Z",
      "action_url": "/dashboard/applications/app_123"
    },
    {
      "id": "notif_002",
      "type": "success",
      "title": "Deployment Successful",
      "message": "Version v1.2.45 deployed successfully",
      "read": false,
      "created_at": "2026-03-19T14:32:00Z",
      "action_url": "/dashboard/deploy"
    },
    {
      "id": "notif_003",
      "type": "warning",
      "title": "High Error Rate",
      "message": "Error rate exceeded 5% in the last hour",
      "read": true,
      "created_at": "2026-03-19T14:15:00Z",
      "action_url": "/dashboard/logs?level=ERROR"
    },
    {
      "id": "notif_004",
      "type": "info",
      "title": "Job Search Complete",
      "message": "Found 42 matching jobs for your profile",
      "read": true,
      "created_at": "2026-03-19T13:45:00Z",
      "action_url": "/dashboard/jobs?status=new"
    }
  ],
  "unread_count": 2
}
```

### PUT /api/alerts/{id}/read

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true
}
```

### PUT /api/alerts/read-all

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "marked_as_read": 15
}
```

---

## Admin Endpoints

### GET /api/admin/tenants

**Response:**
```json
{
  "tenants": [
    {
      "id": "tenant_001",
      "name": "Acme Corporation",
      "slug": "acme-corp",
      "plan": "enterprise",
      "user_count": 245,
      "status": "active",
      "created_at": "2025-01-15T10:00:00Z"
    },
    {
      "id": "tenant_002",
      "name": "TechStart Inc",
      "slug": "techstart-inc",
      "plan": "professional",
      "user_count": 42,
      "status": "active",
      "created_at": "2025-06-20T14:30:00Z"
    },
    {
      "id": "tenant_003",
      "name": "Startup Phase",
      "slug": "startup-phase",
      "plan": "starter",
      "user_count": 8,
      "status": "active",
      "created_at": "2026-02-01T09:00:00Z"
    }
  ]
}
```

### POST /api/admin/tenants

**Request Body:**
```json
{
  "name": "New Tenant Ltd",
  "slug": "new-tenant-ltd",
  "plan": "professional"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tenant created successfully",
  "tenant": {
    "id": "tenant_004",
    "name": "New Tenant Ltd",
    "slug": "new-tenant-ltd",
    "plan": "professional",
    "user_count": 0,
    "status": "active",
    "created_at": "2026-03-19T15:30:00Z"
  }
}
```

### GET /api/admin/health

**Response:**
```json
{
  "cpu_usage": 42.5,
  "memory_usage": 68.3,
  "disk_usage": 55.1,
  "uptime_seconds": 1296000,
  "request_count_hour": 4521,
  "error_count_hour": 8
}
```

### POST /api/admin/maintenance/clean-tasks

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Cleanup completed",
  "stats": {
    "abandoned_tasks_deleted": 147,
    "orphaned_records_cleaned": 89,
    "duration_seconds": 23
  }
}
```

### GET /api/admin/mcp

**Response:**
```json
{
  "sessions": [
    {
      "id": "session_001",
      "name": "MCP:Claude",
      "status": "connected",
      "last_activity": "2026-03-19T15:28:00Z"
    },
    {
      "id": "session_002",
      "name": "MCP:LLMValidator",
      "status": "connected",
      "last_activity": "2026-03-19T15:25:30Z"
    },
    {
      "id": "session_003",
      "name": "MCP:FileTools",
      "status": "disconnected",
      "last_activity": "2026-03-19T14:50:00Z"
    }
  ],
  "tools": [
    {
      "name": "fetch_web_content",
      "description": "Fetch and parse web content from URLs",
      "input_schema": {
        "url": {
          "type": "string",
          "description": "The URL to fetch"
        },
        "timeout_seconds": {
          "type": "integer",
          "description": "Request timeout in seconds (default 30)"
        }
      }
    },
    {
      "name": "search_database",
      "description": "Search database records by criteria",
      "input_schema": {
        "table": {
          "type": "string",
          "description": "Table name to search"
        },
        "filters": {
          "type": "object",
          "description": "Filter criteria"
        },
        "limit": {
          "type": "integer",
          "description": "Result limit (default 100)"
        }
      }
    }
  ]
}
```

### GET /api/admin/trash

**Response:**
```json
{
  "items": [
    {
      "id": "trash_001",
      "entity_type": "application",
      "entity_id": "app_567",
      "deleted_at": "2026-03-19T12:30:00Z",
      "deleted_by": "user@example.com"
    },
    {
      "id": "trash_002",
      "entity_type": "job",
      "entity_id": "job_8901",
      "deleted_at": "2026-03-19T11:15:00Z",
      "deleted_by": "admin@example.com"
    },
    {
      "id": "trash_003",
      "entity_type": "contact",
      "entity_id": "contact_234",
      "deleted_at": "2026-03-19T10:45:00Z",
      "deleted_by": "user@example.com"
    }
  ]
}
```

### POST /api/admin/trash/{id}/restore

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Item restored successfully",
  "restored_item": {
    "id": "trash_001",
    "entity_type": "application",
    "entity_id": "app_567",
    "restored_at": "2026-03-19T15:31:00Z"
  }
}
```

### POST /api/admin/trash/{id}/delete

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Item permanently deleted"
}
```

---

## Error Response Format

All endpoints use standard error responses:

```json
{
  "type": "validation_error",
  "title": "Validation Error",
  "status": 400,
  "detail": "Invalid request parameters",
  "instance": "/api/deploy/rollback",
  "errors": [
    {
      "field": "version",
      "message": "Version not found in history"
    }
  ]
}
```

---

## Implementation Notes

1. **Timestamps**: All timestamps should use ISO 8601 format (UTC)
2. **Pagination**: Include `limit` and `offset` for list endpoints
3. **Error Handling**: Use RFC 7807 Problem Detail format
4. **Caching**: Deploy status and health endpoints may be cached (5-10s)
5. **Permissions**: Admin endpoints should require admin role verification
6. **Audit Logging**: All admin operations should be logged with user and timestamp
7. **Rate Limiting**: Consider rate limiting for logs endpoint
8. **Real-time Updates**: Consider WebSocket support for logs and deploy status

---

**Version History:**
- 1.0 - Initial implementation guide
