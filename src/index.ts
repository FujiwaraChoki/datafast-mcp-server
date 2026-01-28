#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { fetch } from "undici";
import { z } from "zod";

const DATAFAST_API_BASE = "https://datafa.st/api/v1";

// Get API key from command line arguments
const API_KEY = process.argv[2];

if (!API_KEY) {
  console.error("Usage: datafast-mcp-server <API_KEY>");
  console.error("Please provide your Datafast API key as an argument.");
  process.exit(1);
}

// Create server instance
const server = new McpServer({
  name: "datafast",
  version: "1.0.0",
});

// Helper function for making Datafast API requests
async function makeDatafastRequest<T>(
  endpoint: string,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const url = new URL(`${DATAFAST_API_BASE}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Datafast API error: ${response.status} - ${(error as { error?: { message?: string } }).error?.message || response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

// Common filter parameters schema
const filterParams = {
  country: z
    .string()
    .optional()
    .describe("Filter by country name(s), comma-separated"),
  region: z.string().optional().describe("Filter by region(s), comma-separated"),
  city: z.string().optional().describe("Filter by city/cities, comma-separated"),
  device: z
    .string()
    .optional()
    .describe("Filter by device type (desktop, mobile, tablet)"),
  browser: z.string().optional().describe("Filter by browser name"),
  os: z.string().optional().describe("Filter by operating system"),
  referrer: z.string().optional().describe("Filter by referrer URL"),
  utm_source: z.string().optional().describe("Filter by UTM source"),
  utm_medium: z.string().optional().describe("Filter by UTM medium"),
  utm_campaign: z.string().optional().describe("Filter by UTM campaign"),
  page: z.string().optional().describe("Filter by page path"),
  hostname: z.string().optional().describe("Filter by hostname"),
};

// Common date/pagination parameters
const dateParams = {
  startAt: z
    .string()
    .optional()
    .describe("Start date in ISO 8601 format (e.g., 2024-01-01)"),
  endAt: z
    .string()
    .optional()
    .describe("End date in ISO 8601 format (e.g., 2024-01-31)"),
  timezone: z
    .string()
    .optional()
    .describe("Timezone for aggregation (e.g., America/New_York)"),
};

const paginationParams = {
  limit: z
    .number()
    .min(1)
    .max(1000)
    .optional()
    .describe("Maximum results to return (1-1000, default: 100)"),
  offset: z
    .number()
    .min(0)
    .optional()
    .describe("Number of results to skip for pagination"),
};

// Register tools

// Get Overview
server.registerTool(
  "get_overview",
  {
    description:
      "Get aggregate analytics metrics for your website including visitors, sessions, bounce rate, revenue, and conversion rate",
    inputSchema: {
      fields: z
        .string()
        .optional()
        .describe(
          "Comma-separated fields to return: visitors, sessions, bounce_rate, avg_session_duration, currency, revenue, revenue_per_visitor, conversion_rate"
        ),
      ...dateParams,
    },
  },
  async ({ fields, startAt, endAt, timezone }) => {
    const data = await makeDatafastRequest("/analytics/overview", {
      fields,
      startAt,
      endAt,
      timezone,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Get Realtime
server.registerTool(
  "get_realtime",
  {
    description:
      "Get the count of active visitors on your website in real-time (visitors with activity in the last 5 minutes)",
    inputSchema: {},
  },
  async () => {
    const data = await makeDatafastRequest("/analytics/realtime");

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Get Pages
server.registerTool(
  "get_pages",
  {
    description:
      "Get analytics data broken down by page with hostname and path information",
    inputSchema: {
      fields: z
        .string()
        .optional()
        .describe(
          "Comma-separated fields to return: hostname, path, visitors, revenue"
        ),
      ...dateParams,
      ...paginationParams,
      ...filterParams,
    },
  },
  async ({ fields, startAt, endAt, timezone, limit, offset, ...filters }) => {
    const data = await makeDatafastRequest("/analytics/pages", {
      fields,
      startAt,
      endAt,
      timezone,
      limit,
      offset,
      ...filters,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Get Referrers
server.registerTool(
  "get_referrers",
  {
    description: "Get analytics data segmented by referrer source",
    inputSchema: {
      fields: z
        .string()
        .optional()
        .describe("Comma-separated fields to return: referrer, visitors, revenue"),
      ...dateParams,
      ...paginationParams,
      ...filterParams,
    },
  },
  async ({ fields, startAt, endAt, timezone, limit, offset, ...filters }) => {
    const data = await makeDatafastRequest("/analytics/referrers", {
      fields,
      startAt,
      endAt,
      timezone,
      limit,
      offset,
      ...filters,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Get Countries
server.registerTool(
  "get_countries",
  {
    description: "Get analytics data broken down by country",
    inputSchema: {
      fields: z
        .string()
        .optional()
        .describe(
          "Comma-separated fields to return: country, image, visitors, revenue"
        ),
      ...dateParams,
      ...paginationParams,
      ...filterParams,
    },
  },
  async ({ fields, startAt, endAt, timezone, limit, offset, ...filters }) => {
    const data = await makeDatafastRequest("/analytics/countries", {
      fields,
      startAt,
      endAt,
      timezone,
      limit,
      offset,
      ...filters,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Get Devices
server.registerTool(
  "get_devices",
  {
    description:
      "Get analytics data segmented by device type (desktop, mobile, tablet)",
    inputSchema: {
      fields: z
        .string()
        .optional()
        .describe("Comma-separated fields to return: device, visitors, revenue"),
      ...dateParams,
      ...paginationParams,
      ...filterParams,
    },
  },
  async ({ fields, startAt, endAt, timezone, limit, offset, ...filters }) => {
    const data = await makeDatafastRequest("/analytics/devices", {
      fields,
      startAt,
      endAt,
      timezone,
      limit,
      offset,
      ...filters,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Get Browsers
server.registerTool(
  "get_browsers",
  {
    description: "Get analytics data broken down by browser",
    inputSchema: {
      fields: z
        .string()
        .optional()
        .describe("Comma-separated fields to return: browser, visitors, revenue"),
      ...dateParams,
      ...paginationParams,
      ...filterParams,
    },
  },
  async ({ fields, startAt, endAt, timezone, limit, offset, ...filters }) => {
    const data = await makeDatafastRequest("/analytics/browsers", {
      fields,
      startAt,
      endAt,
      timezone,
      limit,
      offset,
      ...filters,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Get Operating Systems
server.registerTool(
  "get_operating_systems",
  {
    description: "Get analytics data broken down by operating system",
    inputSchema: {
      fields: z
        .string()
        .optional()
        .describe("Comma-separated fields to return: os, visitors, revenue"),
      ...dateParams,
      ...paginationParams,
      ...filterParams,
    },
  },
  async ({ fields, startAt, endAt, timezone, limit, offset, ...filters }) => {
    const data = await makeDatafastRequest("/analytics/os", {
      fields,
      startAt,
      endAt,
      timezone,
      limit,
      offset,
      ...filters,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Get Goals
server.registerTool(
  "get_goals",
  {
    description: "Get analytics data broken down by custom goals",
    inputSchema: {
      fields: z
        .string()
        .optional()
        .describe(
          "Comma-separated fields to return: name, completions, visitors"
        ),
      ...dateParams,
      ...paginationParams,
      ...filterParams,
    },
  },
  async ({ fields, startAt, endAt, timezone, limit, offset, ...filters }) => {
    const data = await makeDatafastRequest("/analytics/goals", {
      fields,
      startAt,
      endAt,
      timezone,
      limit,
      offset,
      ...filters,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Get Regions
server.registerTool(
  "get_regions",
  {
    description: "Get analytics data broken down by region/state",
    inputSchema: {
      fields: z
        .string()
        .optional()
        .describe("Comma-separated fields to return: region, visitors, revenue"),
      ...dateParams,
      ...paginationParams,
      ...filterParams,
    },
  },
  async ({ fields, startAt, endAt, timezone, limit, offset, ...filters }) => {
    const data = await makeDatafastRequest("/analytics/regions", {
      fields,
      startAt,
      endAt,
      timezone,
      limit,
      offset,
      ...filters,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Get Cities
server.registerTool(
  "get_cities",
  {
    description: "Get analytics data broken down by city",
    inputSchema: {
      fields: z
        .string()
        .optional()
        .describe("Comma-separated fields to return: city, visitors, revenue"),
      ...dateParams,
      ...paginationParams,
      ...filterParams,
    },
  },
  async ({ fields, startAt, endAt, timezone, limit, offset, ...filters }) => {
    const data = await makeDatafastRequest("/analytics/cities", {
      fields,
      startAt,
      endAt,
      timezone,
      limit,
      offset,
      ...filters,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Get Campaigns (UTM)
server.registerTool(
  "get_campaigns",
  {
    description: "Get analytics data broken down by UTM campaigns",
    inputSchema: {
      fields: z
        .string()
        .optional()
        .describe(
          "Comma-separated fields to return: campaign, source, medium, visitors, revenue"
        ),
      ...dateParams,
      ...paginationParams,
      ...filterParams,
    },
  },
  async ({ fields, startAt, endAt, timezone, limit, offset, ...filters }) => {
    const data = await makeDatafastRequest("/analytics/campaigns", {
      fields,
      startAt,
      endAt,
      timezone,
      limit,
      offset,
      ...filters,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Run the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Datafast MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
