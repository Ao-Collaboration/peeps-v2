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
2. Verifies NFT ownership
3. Clones the `peeps-nft-data` repository
4. Updates the metadata file for the token
5. Commits and pushes changes
6. Cleans up temporary files

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

## Git Operations

The webhook uses Git operations to update the `peeps-nft-data` repository:

1. **Clone**: Creates a temporary clone of the repository
2. **Update**: Writes/updates the metadata file for the specific token
3. **Commit**: Commits changes with a descriptive message
4. **Push**: Pushes changes to the remote repository
5. **Cleanup**: Removes the temporary directory

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

## Error Handling

The webhook includes comprehensive error handling for:

- Invalid signatures
- Non-owners attempting to update metadata
- Network errors during Git operations
- File system errors
- Invalid request data

All errors are logged and returned with appropriate HTTP status codes.
