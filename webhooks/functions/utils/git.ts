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
  imageHash: Hex.Hex // WRONG?
}

/**
 * Clones the peeps-nft-data repository to a temporary directory
 */
export async function cloneRepository(config: GitConfig): Promise<string> {
  const tempDir = join(tmpdir(), `peeps-nft-data-${Date.now()}`)

  try {
    await mkdir(tempDir, {recursive: true})

    console.log(`Cloning repository to ${tempDir}`)
    await execAsync(`git clone ${config.repoUrl} .`, {cwd: tempDir})

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
 * Creates or updates an NFT metadata file in the repository
 */
export async function updateNFTMetadataFile(
  repoPath: string,
  nftData: NFTMetadataFile,
): Promise<void> {
  const metadataDir = join(repoPath, 'metadata')
  const tokenId = nftData.tokenId
  const fileName = `${tokenId}.json`
  const filePath = join(metadataDir, fileName)

  try {
    // Ensure metadata directory exists
    await mkdir(metadataDir, {recursive: true})

    // Write the metadata file
    const metadataContent = JSON.stringify(nftData, null, 2)
    await writeFile(filePath, metadataContent, 'utf8')

    console.log(`Updated metadata file: ${fileName}`)
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
    const commitMessage = `Update NFT metadata for token ${tokenId}`
    await execAsync(`git commit -m "${commitMessage}"`, {cwd: repoPath})

    // Push changes
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
