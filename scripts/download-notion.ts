import { Client, isFullDatabase } from "@notionhq/client";
import * as fs from "fs";
import * as path from "path";
import { config as dotenvConfig } from "dotenv";

// Load environment variables from .env file
dotenvConfig();

// Initialize the Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function downloadNotionTable(databaseId: string) {
  try {
    let allResults: any[] = [];
    let hasMore = true;
    let startCursor: string | undefined;

    // Keep fetching pages until we have all results
    while (hasMore) {
      const response = await notion.databases.query({
        database_id: databaseId,
        start_cursor: startCursor,
        page_size: 100, // Maximum allowed by Notion API
      });

      allResults = [...allResults, ...response.results];
      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;

      console.log(`Fetched ${allResults.length} items so far...`);
    }

    console.log(`Total items fetched: ${allResults.length}`);

    // Transform the results into a more usable format
    const transformedData = allResults
      .map((page) => {
        const properties = page.properties;
        const row: Record<string, any> = {};

        // Extract each property from the page
        Object.keys(properties).forEach((key) => {
          const property = properties[key] as any;

          // Handle different property types
          switch (property.type) {
            case "title":
              row[key] = property.title?.[0]?.plain_text || "";
              break;
            case "rich_text":
              row[key] = property.rich_text?.[0]?.plain_text || "";
              break;
            case "number":
              row[key] = property.number;
              break;
            case "select":
              row[key] = property.select?.name || "";
              break;
            case "multi_select":
              row[key] = property.multi_select?.map((item: any) => item.name) || [];
              break;
            case "date":
              row[key] = property.date?.start || "";
              break;
            case "checkbox":
              row[key] = property.checkbox;
              break;
            default:
              row[key] = "";
          }
        });

        return row;
      })
      .filter(Boolean); // Remove any null entries

    console.log(`Total rows: ${transformedData.length}`);

    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Save the data to a JSON file
    const outputPath = path.join(outputDir, "notion-data.json");
    fs.writeFileSync(outputPath, JSON.stringify(transformedData, null, 2));

    console.log(
      `Successfully downloaded ${transformedData.length} rows from Notion`
    );
    console.log(`Data saved to: ${outputPath}`);
  } catch (error) {
    console.error("Error downloading Notion data:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  // Check for environment variables
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    console.error(
      "Please set the NOTION_TOKEN and NOTION_DATABASE_ID environment variables"
    );
    process.exit(1);
  }

  // Run the download function
  downloadNotionTable(process.env.NOTION_DATABASE_ID);
}
