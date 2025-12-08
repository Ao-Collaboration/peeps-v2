# Peeps Webhooks

This directory contains Netlify functions that handle various webhook operations for the Peeps application.

## Functions

### Update Metadata (`/updateMetadata`)

Handles updating NFT metadata by pushing changes to the `peeps-nft-data` repository.

**Endpoint:** `POST /updateMetadata`

**Request Body:**

```json
{
  "tokenId": "123",
  "metadata": {
    "name": "Peep Name",
    "description": "Peep description",
    "image": "https://example.com/image.png",
    "external_url": "https://peeps.club",
    "attributes": [
      {
        "trait_type": "Hair",
        "value": "Blonde"
      }
    ]
  },
  "pngData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "svgData": "<svg>...</svg>",
  "signature": "0x...",
  "chainId": 1
}
```

**Response:**

```json
{
  "success": true,
  "signerAddress": "0x...",
  "message": "NFT metadata updated successfully in peeps-nft-data repository"
}
```

**Process:**

1. Validates the EIP-712 signature
1. Verifies NFT ownership
1. Uses GitHub REST API (Octokit) to update files in the `peeps-nft-data` repository
1. Creates or updates the metadata JSON file for the token
1. Creates or updates SVG and PNG files in the `peep/` directory (named by peepURI)
1. All changes are committed via GitHub API (no git CLI required)

## Environment Variables

The following environment variables need to be configured:

### Required

- `NOTION_TOKEN` - Notion API token
- `NOTION_CREATEDPEEPS_DATABASE_ID` - Notion database ID for created peeps
- `NOTION_TRAITREQUESTS_DATABASE_ID` - Notion database ID for trait requests
- `PEEPS_NFT_DATA_REPO_URL` - Git repository URL for peeps-nft-data
- `PEEPS_NFT_DATA_BRANCH` - Target branch (e.g., `main`)
- `PEEPS_NFT_DATA_GIT_USER_NAME` - Git commit author name
- `PEEPS_NFT_DATA_GIT_USER_EMAIL` - Git commit author email

### Optional

- `PEEPS_NFT_DATA_GITHUB_TOKEN` - GitHub personal access token for authenticating GitHub API operations (required for all operations)

## Development

### Environment Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual values:

   ```bash
   # Required for peeps-nft-data repository operations
   PEEPS_NFT_DATA_REPO_URL=https://github.com/Ao-Collaboration/peeps-nft-data.git
   PEEPS_NFT_DATA_BRANCH=main
   PEEPS_NFT_DATA_GIT_USER_NAME=Peeps Bot
   PEEPS_NFT_DATA_GIT_USER_EMAIL=bot@peeps.club
   PEEPS_NFT_DATA_GITHUB_TOKEN=your_github_token_here

   # Notion API (if using Notion features)
   NOTION_TOKEN=your_notion_token_here
   NOTION_CREATEDPEEPS_DATABASE_ID=your_database_id
   NOTION_TRAITREQUESTS_DATABASE_ID=your_database_id
   ```

### Running Locally

```bash
pnpm start
```

### Testing

```bash
pnpm test:run
```

### Deployment

```bash
pnpm deploy
```

## GitHub API Operations

The webhook uses GitHub REST API (via Octokit) to update the `peeps-nft-data` repository:

1. **Authenticate**: Initializes Octokit client with GitHub token (token is never logged or exposed)
2. **Verify Access**: Verifies repository access using `repos.get()` API
3. **Get Existing Files**: Retrieves existing file SHAs if files already exist (for updates)
4. **Create/Update Files**: Uses `repos.createOrUpdateFileContents()` API to:
   - Create or update metadata JSON file
   - Create or update SVG file
   - Create or update PNG file
5. **Commit**: All file changes are committed atomically via GitHub API

### Metadata File Structure

Metadata files are stored as `{tokenId}.json` in the `metadata/` directory:

```json
{
  "tokenId": "123",
  "metadata": {
    "name": "Peep Name",
    "description": "Peep description",
    "image": "https://example.com/image.png",
    "external_url": "https://peeps.club",
    "attributes": [...]
  },
  "imageHash": "0x...",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Security

- All requests require valid EIP-712 signatures
- Only NFT owners can update their metadata
- Only mainnet (chainId 1) is supported
- CORS is properly configured for allowed origins
- Github token is only used for Octokit API authentication and never logged or exposed

## Error Handling

The webhook includes comprehensive error handling for:

- Invalid signatures
- Non-owners attempting to update metadata
- Network errors during GitHub API operations
- Missing or invalid GitHub token
- Repository access errors
- Invalid request data

All errors are logged and returned with appropriate HTTP status codes. The GitHub token is never exposed in error messages.
