import {exec} from 'child_process'
import {mkdir, rm, writeFile} from 'fs/promises'
import {tmpdir} from 'os'
import {Hex} from 'ox'
import {join} from 'path'
import {promisify} from 'util'

const execAsync = promisify(exec)

export interface GitConfig {
  repoUrl: string
  branch: string
  userName: string
  userEmail: string
  githubToken?: string // Optional GitHub token for authentication
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
 * Clones the peeps-nft-data repository to a temporary directory
 */
export async function cloneRepository(config: GitConfig): Promise<string> {
  const tempDir = join(tmpdir(), `peeps-nft-data-${Date.now()}`)

  try {
    await mkdir(tempDir, {recursive: true})

    console.log(`Cloning repository to ${tempDir}`)

    // Build clone URL with authentication if token is provided
    let cloneUrl = config.repoUrl
    if (config.githubToken) {
      // Insert token into URL for authentication
      // Handle both https://github.com and git@github.com formats
      if (cloneUrl.startsWith('https://')) {
        // Extract the path after https://
        const urlPath = cloneUrl.replace('https://', '')
        cloneUrl = `https://${config.githubToken}@${urlPath}`
      } else if (cloneUrl.startsWith('git@')) {
        // For SSH URLs, we'll need to configure SSH with the token
        // For now, convert to HTTPS format
        const sshPath = cloneUrl.replace('git@github.com:', '')
        cloneUrl = `https://${config.githubToken}@github.com/${sshPath}`
      }
    }

    await execAsync(`git clone ${cloneUrl} .`, {cwd: tempDir})

    // Configure git user
    await execAsync(`git config user.name "${config.userName}"`, {cwd: tempDir})
    await execAsync(`git config user.email "${config.userEmail}"`, {cwd: tempDir})

    // Checkout the target branch
    await execAsync(`git checkout ${config.branch}`, {cwd: tempDir})

    console.log(`Repository cloned successfully to ${tempDir}`)
    return tempDir
  } catch (error) {
    console.error('Failed to clone repository:', error)
    throw new Error(
      `Failed to clone repository: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * Converts a PNG data URL to binary data and saves it as a PNG file
 */
async function savePngFromDataUrl(dataUrl: string, filePath: string): Promise<void> {
  // Extract the base64 data from the data URL
  const base64Data = dataUrl.split(',')[1]
  if (!base64Data) {
    throw new Error('Invalid PNG data URL format')
  }

  try {
    // Convert base64 to buffer
    const binaryData = Buffer.from(base64Data, 'base64')
    await writeFile(filePath, binaryData)
    console.log(`Saved PNG file: ${filePath}`)
  } catch (error) {
    throw new Error(
      `Failed to save PNG file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * Creates or updates an NFT metadata file in the repository
 */
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

export async function updateNFTMetadataFile(
  repoPath: string,
  nftData: NFTMetadataFile,
): Promise<void> {
  const peepDir = join(repoPath, 'peep')
  const pngDir = peepDir // join(peepDir, 'png')
  const svgDir = peepDir // join(peepDir, 'svg')
  const tokenId = nftData.tokenId

  // Extract filename from peep URI (e.g., "123.json" from "https://api.peeps.club/metadata/123.json")
  const peepFileName = extractPathFromURI(nftData.peepURI)
  const peepFilePath = join(peepDir, peepFileName)

  // Extract peepURI value (without .json) for use in image filenames
  const peepURIValue = peepFileName.replace(/\.json$/, '')

  try {
    // Ensure directories exist
    await mkdir(peepDir, {recursive: true})
    await mkdir(pngDir, {recursive: true})
    await mkdir(svgDir, {recursive: true})

    // Write the metadata file (without svgData, pngData, and peepURI)
    // peepURI is used above to extract the filename, so we exclude it from the saved data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {svgData, pngData, peepURI, ...metadataToSave} = nftData
    const metadataContent = JSON.stringify(metadataToSave, null, 2)

    // Save with peep URI filename (primary location)
    await writeFile(peepFilePath, metadataContent, 'utf8')
    console.log(`Updated metadata file with peep URI: ${peepFileName}`)

    // Save SVG file to svg directory using peepURI value
    const svgFileName = `${peepURIValue}.svg`
    const svgFilePath = join(svgDir, svgFileName)
    await writeFile(svgFilePath, svgData, 'utf8')
    console.log(`Saved SVG file: ${svgFileName}`)

    // Save PNG file to png directory using peepURI value
    const pngFileName = `${peepURIValue}.png`
    const pngFilePath = join(pngDir, pngFileName)
    await savePngFromDataUrl(pngData, pngFilePath)
    console.log(`Saved PNG file: ${pngFileName}`)
  } catch (error) {
    console.error(`Failed to update metadata file for token ${tokenId}:`, error)
    throw new Error(
      `Failed to update metadata file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * Commits and pushes changes to the repository
 */
export async function commitAndPush(
  repoPath: string,
  tokenId: string,
  config: GitConfig,
): Promise<void> {
  try {
    // Add all changes
    await execAsync('git add .', {cwd: repoPath})

    // Check if there are any changes to commit
    const {stdout: statusOutput} = await execAsync('git status --porcelain', {cwd: repoPath})
    if (!statusOutput.trim()) {
      console.log('No changes to commit')
      return
    }

    // Commit changes
    const commitMessage = `Update NFT metadata for token #${tokenId}`
    await execAsync(`git commit -m "${commitMessage}"`, {cwd: repoPath})

    // Push changes with authentication if token is provided
    if (config.githubToken) {
      // Configure git credential helper to use token
      const remoteUrl = await execAsync('git config --get remote.origin.url', {cwd: repoPath})
      const currentUrl = remoteUrl.stdout.trim()

      // Update remote URL with token if not already present
      if (!currentUrl.includes(config.githubToken)) {
        let authenticatedUrl = currentUrl
        if (currentUrl.startsWith('https://')) {
          const urlPath = currentUrl.replace('https://', '')
          authenticatedUrl = `https://${config.githubToken}@${urlPath}`
        } else if (currentUrl.startsWith('git@')) {
          const sshPath = currentUrl.replace('git@github.com:', '')
          authenticatedUrl = `https://${config.githubToken}@github.com/${sshPath}`
        }
        await execAsync(`git remote set-url origin "${authenticatedUrl}"`, {cwd: repoPath})
      }
    }

    await execAsync(`git push origin ${config.branch}`, {cwd: repoPath})

    console.log(`Successfully pushed changes for token ${tokenId}`)
  } catch (error) {
    console.error(`Failed to commit and push changes for token ${tokenId}:`, error)
    throw new Error(
      `Failed to commit and push changes: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * Cleans up the temporary repository directory
 */
export async function cleanupRepository(repoPath: string): Promise<void> {
  try {
    await rm(repoPath, {recursive: true, force: true})
    console.log(`Cleaned up temporary directory: ${repoPath}`)
  } catch (error) {
    console.warn(`Failed to cleanup temporary directory ${repoPath}:`, error)
  }
}

/**
 * Main function to update NFT metadata in the peeps-nft-data repository
 */
export async function updateNFTMetadataInRepo(
  nftData: NFTMetadataFile,
  config: GitConfig,
): Promise<void> {
  let repoPath: string | null = null

  try {
    // Clone the repository
    repoPath = await cloneRepository(config)

    // Update the metadata file
    await updateNFTMetadataFile(repoPath, nftData)

    // Commit and push changes
    await commitAndPush(repoPath, nftData.tokenId, config)

    console.log(`Successfully updated NFT metadata for token ${nftData.tokenId}`)
  } catch (error) {
    console.error('Failed to update NFT metadata in repository:', error)
    throw error
  } finally {
    // Cleanup
    if (repoPath) {
      await cleanupRepository(repoPath)
    }
  }
}
