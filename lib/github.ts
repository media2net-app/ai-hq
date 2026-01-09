import { Octokit } from '@octokit/rest'

// Initialize Octokit client
export function getGitHubClient() {
  const token = process.env.GITHUB_TOKEN

  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is not set')
  }

  return new Octokit({
    auth: token,
    request: {
      timeout: 10000,
    },
  })
}

// Fetch all repositories from an organization or user
export async function fetchOrganizationRepos(org: string) {
  const octokit = getGitHubClient()

  try {
    // Try organization first
    let repos
    try {
      repos = await octokit.paginate(octokit.repos.listForOrg, {
        org,
        type: 'all',
        sort: 'updated',
        per_page: 100,
      })
    } catch (orgError: any) {
      // If organization fails, try as user
      if (orgError.status === 404) {
        repos = await octokit.paginate(octokit.repos.listForUser, {
          username: org,
          type: 'all',
          sort: 'updated',
          per_page: 100,
        })
      } else {
        throw orgError
      }
    }

    return repos.map((repo) => ({
      id: repo.id.toString(),
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || '',
      url: repo.html_url,
      defaultBranch: repo.default_branch,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      isPrivate: repo.private,
      updatedAt: repo.updated_at,
      createdAt: repo.created_at,
    }))
  } catch (error: any) {
    console.error('Error fetching GitHub repos:', error)
    throw new Error(`Failed to fetch repositories: ${error.message}`)
  }
}

// Fetch a single repository
export async function fetchRepository(owner: string, repo: string) {
  const octokit = getGitHubClient()

  try {
    const { data } = await octokit.repos.get({
      owner,
      repo,
    })

    return {
      id: data.id.toString(),
      name: data.name,
      fullName: data.full_name,
      description: data.description || '',
      url: data.html_url,
      defaultBranch: data.default_branch,
      language: data.language,
      stars: data.stargazers_count,
      forks: data.forks_count,
      isPrivate: data.private,
      updatedAt: data.updated_at,
      createdAt: data.created_at,
    }
  } catch (error: any) {
    console.error('Error fetching GitHub repo:', error)
    throw new Error(`Failed to fetch repository: ${error.message}`)
  }
}
