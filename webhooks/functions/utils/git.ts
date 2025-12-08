import {CreateOrUpdateFiles} from 'octokit-commit-multiple-files'
import {Hex} from 'ox'

import {Octokit} from '@octokit/rest'

const OctokitWithPlugin = Octokit.plugin(CreateOrUpdateFiles)

export interface GitConfig {
  repoUrl: string
  branch: string
  userName: string
  userEmail: string
  githubToken: string
}

export interface NFTMetadataFile {
  tokenId: string
  metadata: {
    name: string
    description: string
    image: string
    external_url: string
    attributes: Array<{
      trait_type: string
      value: string
    }>
  }
  imageHash: Hex.Hex
  svgData: string
  pngData: string
  peepURI: string // The peep URI path for saving the JSON file (from tokenURI)
}

/**
 * Parses a repository URL to extract owner and repo name
 * Handles both https://github.com/owner/repo.git and git@github.com:owner/repo.git formats
 */
function parseRepoUrl(repoUrl: string): {owner: string; repo: string} {
  try {
    let path = ''
    if (repoUrl.startsWith('https://')) {
      // Extract path from https://github.com/owner/repo.git
      const url = new URL(repoUrl)
      path = url.pathname
    } else if (repoUrl.startsWith('git@')) {
      // Extract path from git@github.com:owner/repo.git
      const match = repoUrl.match(/git@github\.com:(.+)/)
      if (!match) {
        throw new Error('Invalid SSH repository URL format')
      }
      path = '/' + match[1]
    } else {
      throw new Error('Unsupported repository URL format')
    }

    // Remove leading slash and .git suffix
    path = path.replace(/^\/+/, '').replace(/\.git$/, '')
    const parts = path.split('/').filter(part => part.length > 0)

    if (parts.length < 2) {
      throw new Error('Invalid repository URL: missing owner or repo')
    }

    return {
      owner: parts[0],
      repo: parts[1],
    }
  } catch (error) {
    throw new Error(
      `Failed to parse repository URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * Extracts the relative path from a URI for saving in the repository
 * For example: "https://api.peeps.club/metadata/123.json" -> "123.json"
 */
function extractPathFromURI(uri: string): string {
  try {
    const url = new URL(uri)
    const pathParts = url.pathname.split('/').filter(part => part.length > 0)
    return pathParts[pathParts.length - 1] || 'metadata.json'
  } catch {
    // If URI is not a full URL, treat it as a relative path
    const pathParts = uri.split('/').filter(part => part.length > 0)
    return pathParts[pathParts.length - 1] || 'metadata.json'
  }
}

/**
 * Converts a PNG data URL to base64-encoded binary data for GitHub API
 */
function pngDataUrlToBase64(dataUrl: string): string {
  // Extract the base64 data from the data URL
  const base64Data = dataUrl.split(',')[1]
  if (!base64Data) {
    throw new Error('Invalid PNG data URL format')
  }
  // Return as-is since it's already base64
  return base64Data
}

/**
 * Creates a single commit with multiple file updates using octokit-commit-multiple-files plugin
 */
async function createCommitWithFiles(
  octokit: InstanceType<typeof OctokitWithPlugin>,
  owner: string,
  repo: string,
  branch: string,
  fileOperations: Array<{path: string; content: string; isBinary: boolean}>,
  commitMessage: string,
  userName: string,
  userEmail: string,
): Promise<void> {
  try {
    // Convert file operations to the format expected by the plugin
    // Binary files need to be passed as objects with contents and encoding
    // Text files can be passed as strings
    const files: Record<string, string | {contents: string; encoding: 'base64'}> = {}
    for (const fileOp of fileOperations) {
      if (fileOp.isBinary) {
        // For binary files (PNG), content is already base64 from the data URL
        // The plugin expects an object with contents and encoding
        files[fileOp.path] = {
          contents: fileOp.content,
          encoding: 'base64',
        }
      } else {
        // For text files, pass the content as a string
        files[fileOp.path] = fileOp.content
      }
    }

    // Use the plugin to create/update files in a single commit
    await octokit.createOrUpdateFiles({
      owner,
      repo,
      branch,
      changes: [
        {
          message: commitMessage,
          files,
        },
      ],
    })

    console.log(`Successfully created commit with ${fileOperations.length} file(s)`)
  } catch (error) {
    console.error('Failed to create commit with files:', error)
    throw new Error(
      `Failed to create commit: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * Prepares file data for API upload and returns file operations to perform
 */
function prepareFileOperations(nftData: NFTMetadataFile): Array<{
  path: string
  content: string
  isBinary: boolean
}> {
  // Extract filename from peep URI (e.g., "123.json" from "https://api.peeps.club/metadata/123.json")
  const peepFileName = extractPathFromURI(nftData.peepURI)
  const peepURIValue = peepFileName.replace(/\.json$/, '')

  // Prepare metadata file (without svgData, pngData, and peepURI)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {svgData, pngData, peepURI, ...metadataToSave} = nftData
  const metadataContent = JSON.stringify(metadataToSave, null, 2)

  // Prepare file operations
  const operations: Array<{path: string; content: string; isBinary: boolean}> = []

  // Metadata JSON file
  operations.push({
    path: `peep/${peepFileName}`,
    content: metadataContent,
    isBinary: false,
  })

  // SVG file
  operations.push({
    path: `peep/${peepURIValue}.svg`,
    content: svgData,
    isBinary: false,
  })

  // PNG file (binary, already base64 from data URL)
  operations.push({
    path: `peep/${peepURIValue}.png`,
    content: pngDataUrlToBase64(pngData),
    isBinary: true,
  })

  return operations
}

/**
 * Main function to update NFT metadata in the peeps-nft-data repository using GitHub API
 */
export async function updateNFTMetadataInRepo(
  nftData: NFTMetadataFile,
  config: GitConfig,
): Promise<void> {
  try {
    // Initialize Octokit client with the commit-multiple-files plugin
    const octokit = new OctokitWithPlugin({
      auth: config.githubToken,
    })

    // Parse repository URL to get owner and repo
    const {owner, repo} = parseRepoUrl(config.repoUrl)
    console.log(`Updating repository: ${owner}/${repo} on branch ${config.branch}`)

    // Verify repository access
    try {
      await octokit.repos.get({
        owner,
        repo,
      })
      console.log(`Verified access to repository: ${owner}/${repo}`)
    } catch (error) {
      console.error('Failed to access repository:', error)
      throw new Error(
        `Failed to access repository ${owner}/${repo}: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your GitHub token permissions.`,
      )
    }

    // Prepare file operations
    const fileOperations = prepareFileOperations(nftData)
    const commitMessage = `Update NFT metadata for token #${nftData.tokenId}`

    // Create a single commit with all file updates
    await createCommitWithFiles(
      octokit,
      owner,
      repo,
      config.branch,
      fileOperations,
      commitMessage,
      config.userName,
      config.userEmail,
    )

    console.log(`Successfully updated NFT metadata for token ${nftData.tokenId}`)
  } catch (error) {
    console.error('Failed to update NFT metadata in repository:', error)
    // Ensure token is never exposed in error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    let sanitizedMessage = errorMessage
    if (config.githubToken) {
      // Replace token with *** in error messages (escape special regex characters)
      const escapedToken = config.githubToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      sanitizedMessage = errorMessage.replace(new RegExp(escapedToken, 'g'), '***')
    }
    throw new Error(`Failed to update NFT metadata: ${sanitizedMessage}`)
  }
}
