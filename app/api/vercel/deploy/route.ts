import { NextRequest, NextResponse } from 'next/server'
import { triggerDeployment, getDeploymentStatus } from '@/lib/vercel'

// POST /api/vercel/deploy - Trigger deployment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, gitRef = 'main' } = body

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }

    const deployment = await triggerDeployment(projectId, gitRef)

    return NextResponse.json({
      success: true,
      deployment,
    })
  } catch (error: any) {
    console.error('Error triggering deployment:', error)
    return NextResponse.json(
      {
        error: 'Failed to trigger deployment',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

// GET /api/vercel/deploy?deploymentId=xxx - Get deployment status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const deploymentId = searchParams.get('deploymentId')

    if (!deploymentId) {
      return NextResponse.json(
        { error: 'deploymentId is required' },
        { status: 400 }
      )
    }

    const deployment = await getDeploymentStatus(deploymentId)

    return NextResponse.json({
      success: true,
      deployment,
    })
  } catch (error: any) {
    console.error('Error getting deployment status:', error)
    return NextResponse.json(
      {
        error: 'Failed to get deployment status',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
