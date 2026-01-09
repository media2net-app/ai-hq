// Vercel SDK - using fetch API directly for compatibility
let vercelToken: string | null = null

export function getVercelToken(): string {
  if (!vercelToken) {
    vercelToken = process.env.VERCEL_TOKEN || ''
    if (!vercelToken) {
      throw new Error('VERCEL_TOKEN environment variable is not set')
    }
  }
  return vercelToken
}

// Trigger deployment using Vercel REST API
export async function triggerDeployment(
  projectId: string,
  gitRef: string = 'main'
) {
  const token = getVercelToken()
  
  try {
    const response = await fetch(`https://api.vercel.com/v13/deployments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        gitSource: {
          type: 'github',
          ref: gitRef,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to trigger deployment')
    }

    const deployment = await response.json()
    
    return {
      id: deployment.id,
      url: deployment.url,
      state: deployment.readyState || 'BUILDING',
    }
  } catch (error: any) {
    throw new Error(`Failed to trigger deployment: ${error.message}`)
  }
}

// Get deployment status using Vercel REST API
export async function getDeploymentStatus(deploymentId: string) {
  const token = getVercelToken()
  
  try {
    const response = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get deployment status')
    }

    const deployment = await response.json()
    return {
      id: deployment.id,
      url: deployment.url,
      state: deployment.readyState || 'UNKNOWN',
      createdAt: deployment.createdAt,
    }
  } catch (error: any) {
    throw new Error(`Failed to get deployment status: ${error.message}`)
  }
}

// List deployments for a project using Vercel REST API
export async function listDeployments(projectId: string) {
  const token = getVercelToken()
  
  try {
    const response = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to list deployments')
    }

    const data = await response.json()
    return (data.deployments || []).map((d: any) => ({
      id: d.id,
      url: d.url,
      state: d.readyState || 'UNKNOWN',
      createdAt: d.createdAt,
    }))
  } catch (error: any) {
    throw new Error(`Failed to list deployments: ${error.message}`)
  }
}
