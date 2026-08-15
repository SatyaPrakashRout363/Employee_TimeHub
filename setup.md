# Setup

## Jira connectivity

Set the following environment variables to connect to the EPAM Jira instance:

| Variable | Description |
|---|---|
| `JIRA_URL` | Base URL of the Jira instance, e.g. `https://jiraeu.epam.com` |
| `JIRA_USERNAME` | Your Jira account email |
| `JIRA_API_TOKEN` | Personal API token for Basic auth |

### Verify the connection

```powershell
$pair = "$($env:JIRA_USERNAME):$($env:JIRA_API_TOKEN)"
$b64 = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($pair))
Invoke-RestMethod -Uri "$($env:JIRA_URL)/rest/api/2/myself" -Headers @{ Authorization = "Basic $b64" }
```

A successful response returns your Jira user profile (`displayName`, `emailAddress`, etc.).
