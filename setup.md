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

### Project

Work items for this repo are tracked in Jira project **EPMCDMETST** (`EPM-CDME-TEST`) on `jiraeu.epam.com`.

> **Note:** the Atlassian MCP tools (`mcp__atlassian__*`) available in this environment are connected to a different Atlassian site (`sprout363.atlassian.net`, Confluence-only scopes) — they cannot reach `jiraeu.epam.com`. Use the direct REST API with the env vars above instead, e.g.:
>
> ```powershell
> $pair = "$($env:JIRA_USERNAME):$($env:JIRA_API_TOKEN)"
> $b64 = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($pair))
> $headers = @{ Authorization = "Basic $b64"; "Content-Type" = "application/json" }
>
> # Create an issue
> $body = @{
>   fields = @{
>     project     = @{ key = "EPMCDMETST" }
>     summary     = "Issue summary"
>     description = "Issue description"
>     issuetype   = @{ id = "7" }  # 7 = Story
>   }
> } | ConvertTo-Json -Depth 5
>
> Invoke-RestMethod -Uri "$($env:JIRA_URL)/rest/api/2/issue" -Headers $headers -Method Post -Body $body
> ```
