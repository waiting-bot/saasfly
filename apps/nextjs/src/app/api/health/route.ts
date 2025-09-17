import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 简单的健康检查响应
    return NextResponse.json({
      status: 'ok',
      message: 'Application is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}