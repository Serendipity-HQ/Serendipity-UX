import type { SourceConfig } from "./types";

export const sfSourceConfigs: SourceConfig[] = [
  {
    source_name: "sf-luma-placeholder",
    source_type: "luma",
    base_url: "https://api.lu.ma/public/v1/calendar/list-events?calendar_api_id=YOUR_CALENDAR_API_ID",
    enabled: false,
    rate_limit_ms: 1000,
    robots_notes: "Use official Luma/public calendar API credentials or permitted public event pages.",
    compliance_notes: "Placeholder disabled by default. Add official API details before enabling.",
  },
  {
    source_name: "sf-eventbrite-placeholder",
    source_type: "eventbrite",
    base_url: "https://www.eventbriteapi.com/v3/events/search/?location.address=San%20Francisco&expand=venue,category",
    enabled: false,
    rate_limit_ms: 1000,
    robots_notes: "Official Eventbrite API only.",
    compliance_notes: "Requires EVENTBRITE_API_TOKEN. Placeholder disabled by default.",
  },
  {
    source_name: "sf-public-calendar-example",
    source_type: "public_calendar",
    base_url: "https://example.com/san-francisco-events",
    enabled: false,
    rate_limit_ms: 2000,
    robots_notes: "Replace with a venue calendar that permits crawling and preferably exposes JSON-LD Event markup.",
    compliance_notes: "Do not enable without checking robots.txt and terms.",
  },
  {
    source_name: "sf-rss-example",
    source_type: "rss",
    base_url: "https://example.com/events.xml",
    enabled: false,
    rate_limit_ms: 2000,
    robots_notes: "Use RSS/newsletter archives intentionally provided for syndication.",
    compliance_notes: "Public RSS only.",
  },
];

export const sfPartnerTargets = [
  "pottery studios",
  "maker spaces",
  "coffee shops",
  "bookstores",
  "running clubs",
  "chess clubs",
  "architecture walks",
  "startup founder events",
  "AI and robotics meetups",
  "galleries and museums",
  "jazz rooms",
  "volunteer organizations",
];
