import { Client } from '@vercel/sdk'

let vercelClient: Client | null = null

export function getVercelClient(): Client {
  if (!vercelClient) {
    const token = process.env.VERCEL_TOKEN
    if (!token) {
      throw new Error('VERCEL_TOKEN environment variable is not set')
    }
    vercelClient = new Client({ token })
  }
  return vercelClient
}

// Trigger deployment
export async function triggerDeployment(
  projectId: string,
  gitRef: string = 'main'
) {
  const client = getVercelClient()
  
  try {
    const deployment = await client.deployments.create({
      projectId,
      gitSource: {
        type: 'github',
        ref: gitRef,
      },
    })
    
    return {
      id: deployment.id,
      url: deployment.url,
      state: deployment.readyState,
    }
  } catch (error: any) {
    throw new Error(`Failed to trigger deployment: ${error.message}`)
  }
}

// Get deployment status
export async function getDeploymentStatus(deploymentId: string) {
  const client = getVercelClient()
  
  try {
    const deployment = await client.deployments.get(deploymentId)
    return {
      id: deployment.id,
      url: deployment.url,
      state: deployment.readyState,
      createdAt: deployment.createdAt,
    }
  } catch (error: any) {
    throw new Error(`Failed to get deployment status: ${error.message}`)
  }
}

// List deployments for a project
export async function listDeployments(projectId: string) {
  const client = getVercelClient()
  
  try {
    const deployments = await client.deployments.list({ projectId })
    return deployments.map((d) => ({
      id: d.id,
      url: d.url,
      state: d.readyState,
      createdAt: d.createdAt,
    }))
  } catch (error: any) {
    throw new Error(`Failed to list deployments: ${error.message}`)
  }
}
