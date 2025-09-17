interface CozeAPIConfig {
  apiKey: string
  baseUrl: string
  timeout?: number
}

interface CozeGenerateRequest {
  image_url: string
  model_type: 'midjourney' | 'stableDiffusion' | 'flux' | 'normal'
  additional_params?: Record<string, any>
}

interface CozeGenerateResponse {
  success: boolean
  data?: {
    prompt: string
    analysis?: {
      dominant_colors: string[]
      style: string
      complexity: string
      subjects: string[]
    }
    metadata: {
      processed_at: string
      processing_time: string
      confidence: number
    }
  }
  error?: string
  message?: string
}

class CozeAPIClient {
  private config: CozeAPIConfig

  constructor(config: CozeAPIConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`
    
    const defaultHeaders = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'SaaSfly-AI-Prompt-Generator/1.0.0',
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('请求超时')
      }
      throw error
    }
  }

  async generatePrompt(request: CozeGenerateRequest): Promise<CozeGenerateResponse> {
    try {
      // 根据您的Coze工作流调整请求格式
      const payload = {
        image_url: request.image_url,
        model_type: request.model_type,
        workflow_params: {
          // 根据您的Coze工作流需要的参数进行调整
          quality: 'high',
          style: 'detailed',
          language: 'zh-CN',
          ...request.additional_params,
        },
      }

      const response = await this.request<CozeGenerateResponse>('/api/v1/generate-prompt', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      return response
    } catch (error) {
      console.error('Coze API调用失败:', error)
      
      // 返回错误响应
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        message: 'AI服务暂时不可用，请稍后重试',
      }
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request<{ status: string }>('/api/v1/health', {
        method: 'GET',
      })
      return response.status === 'ok'
    } catch (error) {
      console.error('Coze健康检查失败:', error)
      return false
    }
  }

  // 图片上传到Coze（如果需要）
  async uploadImage(file: Buffer | File): Promise<{ url: string; upload_id: string }> {
    try {
      const formData = new FormData()
      formData.append('file', file instanceof File ? file : new File([file], 'upload.jpg', { type: 'image/jpeg' }))

      const response = await this.request<{ url: string; upload_id: string }>('/api/v1/upload', {
        method: 'POST',
        body: formData,
        headers: {}, // 让浏览器自动设置Content-Type
      })

      return response
    } catch (error) {
      console.error('图片上传失败:', error)
      throw new Error('图片上传失败')
    }
  }
}

// 创建Coze客户端实例
function createCozeClient(): CozeAPIClient {
  const apiKey = process.env.COZE_API_KEY
  const baseUrl = process.env.COZE_API_URL || 'https://api.coze.com'

  if (!apiKey) {
    console.warn('COZE_API_KEY未配置，将使用Mock数据')
    // 返回一个mock客户端
    return new MockCozeClient()
  }

  return new CozeAPIClient({
    apiKey,
    baseUrl,
  })
}

// Mock客户端（用于开发环境或API不可用时）
class MockCozeClient extends CozeAPIClient {
  constructor() {
    super({ apiKey: 'mock', baseUrl: 'mock' })
  }

  async generatePrompt(request: CozeGenerateRequest): Promise<CozeGenerateResponse> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500))

    const mockPrompts = {
      midjourney: [
        "A mystical landscape with floating islands, waterfalls cascading into the clouds, golden hour lighting, epic fantasy art, highly detailed, digital painting, artstation, concept art, matte painting, cinematic, by Greg Rutkowski and Artgerm",
        "Portrait of a cyberpunk ninja in neon-lit Tokyo rain, reflective surfaces, cinematic lighting, detailed character design, science fiction, high quality, sharp focus, 8k",
        "Ancient dragon sleeping on treasure hoard, underground cave with glowing crystals, dramatic lighting, fantasy art, highly detailed, digital painting, by Craig Mullins and Todd Lockwood",
      ],
      stableDiffusion: [
        "A beautiful landscape photograph of mountains during sunset, golden light, serene atmosphere, professional photography, high resolution, detailed",
        "Modern minimalist living room with large windows, clean design, natural lighting, architectural photography, 4k, detailed",
        "Cute robot reading a book in a cozy library, warm lighting, detailed mechanical design, digital art, charming atmosphere",
      ],
      flux: [
        "Surreal dreamscape with melting clocks and floating doors, inspired by Salvador Dali, contemporary digital art, vibrant colors, thought-provoking",
        "Futuristic city with organic architecture, bioluminescent plants, flying vehicles, sci-fi concept art, highly detailed, innovative design",
        "Abstract representation of human emotions, flowing colors and shapes, modern digital art, expressive and meaningful",
      ],
      normal: [
        "A professional headshot of a business person, clean background, good lighting, corporate photography",
        "A red apple on a wooden table, natural lighting, still life photography, detailed",
        "Modern office workspace with computer and supplies, clean and organized, product photography",
      ],
    }

    const prompts = mockPrompts[request.model_type]
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]

    return {
      success: true,
      data: {
        prompt: randomPrompt,
        analysis: {
          dominant_colors: ["blue", "white", "gray"].filter(() => Math.random() > 0.5),
          style: request.model_type === "midjourney" ? "artistic" : "realistic",
          complexity: Math.random() > 0.5 ? "high" : "medium",
          subjects: ["landscape", "architecture", "abstract"].filter(() => Math.random() > 0.5),
        },
        metadata: {
          processed_at: new Date().toISOString(),
          processing_time: "1.5s",
          confidence: 0.85 + Math.random() * 0.1,
        },
      },
    }
  }

  async healthCheck(): Promise<boolean> {
    return true
  }
}

export { CozeAPIClient, createCozeClient, type CozeGenerateRequest, type CozeGenerateResponse }