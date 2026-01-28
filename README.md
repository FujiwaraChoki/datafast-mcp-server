# Datafast MCP Server

An MCP (Model Context Protocol) server for the [Datafast](https://datafa.st) analytics API. This server allows AI assistants like Claude to query your website analytics data.

## Installation

```bash
npm install
npm run build
```

## Configuration

Add the server to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "datafast": {
      "command": "bunx",
      "args": ["datafast-mcp-server", "YOUR_DATAFAST_API_KEY"]
    }
  }
}
```

Replace `YOUR_DATAFAST_API_KEY` with your actual API key from **Website Settings > API** in your Datafast dashboard.

## Available Tools

### Analytics Tools

| Tool | Description |
|------|-------------|
| `get_overview` | Get aggregate analytics metrics (visitors, sessions, bounce rate, revenue, conversion rate) |
| `get_realtime` | Get real-time visitor count (last 5 minutes) |
| `get_pages` | Get analytics broken down by page path |
| `get_referrers` | Get analytics by referrer source |
| `get_countries` | Get analytics by country |
| `get_regions` | Get analytics by region/state |
| `get_cities` | Get analytics by city |
| `get_devices` | Get analytics by device type (desktop, mobile, tablet) |
| `get_browsers` | Get analytics by browser |
| `get_operating_systems` | Get analytics by operating system |
| `get_goals` | Get analytics by custom goals |
| `get_campaigns` | Get analytics by UTM campaigns |

### Common Parameters

#### Date Range Parameters
- `startAt`: Start date in ISO 8601 format (e.g., `2024-01-01`)
- `endAt`: End date in ISO 8601 format (e.g., `2024-01-31`)
- `timezone`: Timezone for aggregation (e.g., `America/New_York`)

#### Pagination Parameters
- `limit`: Maximum results (1-1000, default: 100)
- `offset`: Number of results to skip

#### Filter Parameters
- `country`: Filter by country name(s)
- `region`: Filter by region(s)
- `city`: Filter by city/cities
- `device`: Filter by device type
- `browser`: Filter by browser name
- `os`: Filter by operating system
- `referrer`: Filter by referrer URL
- `utm_source`, `utm_medium`, `utm_campaign`: Filter by UTM parameters
- `page`: Filter by page path
- `hostname`: Filter by hostname

## Example Usage

Once configured, you can ask Claude:

- "Show me my website's overview analytics for last month"
- "How many visitors do I have right now?"
- "What are my top pages by visitors?"
- "Which countries are my visitors from?"
- "Show me traffic by device type"
- "What referrers are driving the most revenue?"

## API Documentation

For more details, see the [Datafast API Documentation](https://datafa.st/docs/api-introduction).

## License

MIT
