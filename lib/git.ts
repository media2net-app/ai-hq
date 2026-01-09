import simpleGit, { SimpleGit } from 'simple-git'
import { promises as fs } from 'fs'
import path from 'path'
import { getGitHubClient } from './github'

const REPOS_DIR = path.join(process.cwd(), '.repos')

// Ensure repos directory exists
async function ensureReposDir() {
  try {
    await fs.mkdir(REPOS_DIR, { recursive: true })
  } catch (error) {
    // Directory already exists
  }
}

// Clone or update repository
export async function cloneOrUpdateRepo(
  owner: string,
  repo: string,
  branch: string = 'main'
): Promise<string> {
  await ensureReposDir()
  
  const repoPath = path.join(REPOS_DIR, `${owner}-${repo}`)
  const git: SimpleGit = simpleGit(repoPath)

  try {
    // Check if repo already exists
    const exists = await fs.access(repoPath).then(() => true).catch(() => false)

    if (exists) {
      // Update existing repo
      await git.fetch()
      await git.checkout(branch)
      await git.pull()
    } else {
      // Clone new repo
      const octokit = getGitHubClient()
      const { data } = await octokit.repos.get({ owner, repo })
      const cloneUrl = data.clone_url

      // Add token to clone URL if needed
      const token = process.env.GITHUB_TOKEN
      const authUrl = token
        ? cloneUrl.replace('https://', `https://${token}@`)
        : cloneUrl

      await git.clone(authUrl, repoPath)
      await git.checkout(branch)
    }

    return repoPath
  } catch (error: any) {
    throw new Error(`Failed to clone/update repository: ${error.message}`)
  }
}

// Read file from repository
export async function readRepoFile(
  repoPath: string,
  filePath: string
): Promise<string> {
  const fullPath = path.join(repoPath, filePath)
  return await fs.readFile(fullPath, 'utf-8')
}

// Write file to repository
export async function writeRepoFile(
  repoPath: string,
  filePath: string,
  content: string
): Promise<void> {
  const fullPath = path.join(repoPath, filePath)
  const dir = path.dirname(fullPath)
  
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(fullPath, content, 'utf-8')
}

// Check if file exists
export async function fileExists(
  repoPath: string,
  filePath: string
): Promise<boolean> {
  const fullPath = path.join(repoPath, filePath)
  try {
    await fs.access(fullPath)
    return true
  } catch {
    return false
  }
}

// List files in directory
export async function listRepoFiles(
  repoPath: string,
  dirPath: string = '.'
): Promise<string[]> {
  const fullPath = path.join(repoPath, dirPath)
  const entries = await fs.readdir(fullPath, { withFileTypes: true })
  
  const files: string[] = []
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      // Skip node_modules and .git
      if (entry.name === 'node_modules' || entry.name === '.git') continue
      const subFiles = await listRepoFiles(repoPath, entryPath)
      files.push(...subFiles)
    } else {
      files.push(entryPath)
    }
  }
  return files
}

// Commit changes
export async function commitChanges(
  repoPath: string,
  message: string,
  authorName: string = 'AI-HQ',
  authorEmail: string = 'ai-hq@example.com'
): Promise<void> {
  const git: SimpleGit = simpleGit(repoPath)
  
  await git.add('.')
  await git.commit(message, {
    '--author': `${authorName} <${authorEmail}>`,
  })
}

// Push changes
export async function pushChanges(
  repoPath: string,
  branch: string = 'main'
): Promise<void> {
  const git: SimpleGit = simpleGit(repoPath)
  
  await git.push('origin', branch)
}

// Get current branch
export async function getCurrentBranch(repoPath: string): Promise<string> {
  const git: SimpleGit = simpleGit(repoPath)
  return await git.revparse(['--abbrev-ref', 'HEAD'])
}

// Get git status
export async function getGitStatus(repoPath: string) {
  const git: SimpleGit = simpleGit(repoPath)
  return await git.status()
}
