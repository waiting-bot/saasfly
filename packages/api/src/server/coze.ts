import { env } from "../env";



// 文件上传响应接口
interface CozeUploadResponse {
  code: number
  message?: string
  data: {
    id: string
    file_name: string
    bytes?: number
    created_at?: number
  }
  msg?: string
  detail?: {
    logid: string
  }
}

// 工作流运行响应接口
interface CozeWorkflowResponse {
  code: number
  message: string
  msg?: string
  data: string | {  // data可以是字符串或对象
    output: string
    status?: string
    execution_time?: string
  }
  usage?: {
    token_count: number
    output_count: number
    input_count: number
  }
  detail?: {
    logid: string
  }
  debug_url?: string
}

class CozeAPIClient {
  private baseUrl: string
  private apiKey: string
  private timeout: number

  constructor() {
    this.baseUrl = env.COZE_API_URL || 'https://api.coze.cn'
    this.apiKey = env.COZE_API_KEY || ''
    this.timeout = 30000
    
    // 添加环境变量检查日志
    console.log('🔧 CozeAPIClient 初始化 - 环境变量检查:', {
      baseUrl: this.baseUrl,
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey.length,
      apiKeyPrefix: this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'N/A',
      workflowId: env.WORKFLOW_ID ? '已设置' : '未设置',
      workflowIdValue: env.WORKFLOW_ID,
      timeout: this.timeout
    })
  }

  // 私有请求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const defaultHeaders = {
      'Authorization': `Bearer ${this.apiKey}`,
      'User-Agent': 'SaaSfly-AI-Prompt-Generator/1.0.0',
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

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

  // 文件上传方法
  async uploadImage(file: File): Promise<string> {
    try {
      console.log('📤 开始文件上传:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      })

      const formData = new FormData()
      formData.append('file', file)
      formData.append('purpose', 'prompt_generation')

      console.log('🔧 准备调用Coze文件上传API...')
      console.log('📋 请求详情:', {
        url: `${this.baseUrl}/v1/files/upload`,
        method: 'POST',
        hasApiKey: !!this.apiKey,
        apiKeyPrefix: this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'N/A',
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => [key, value instanceof File ? `File(${value.name}, ${value.size})` : value]),
        timeout: this.timeout
      })
      
      const response = await this.request<CozeUploadResponse>('/v1/files/upload', {
        method: 'POST',
        body: formData,
        headers: {}, // 让浏览器自动设置Content-Type
      })

      console.log('📥 文件上传响应:', {
        code: response.code,
        message: response.message,
        hasData: !!response.data,
      })

      if (response.code !== 0) {
        console.error('❌ 文件上传API返回错误:', response)
        throw new Error(response.message || response.msg || '文件上传失败')
      }

      if (!response.data || !response.data.id) {
        console.error('❌ 文件上传响应缺少id:', response)
        throw new Error('文件上传响应缺少id')
      }

      console.log('✅ 文件上传成功:', {
        fileId: response.data.id,
        fileName: response.data.file_name,
        fileSize: response.data.bytes,
      })

      return response.data.id
    } catch (error) {
      console.error('❌ 文件上传失败:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        fileName: file?.name,
        fileSize: file?.size,
      })
      throw new Error('文件上传失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  // 工作流运行方法 - 使用正确的application/json格式
  async generatePrompt(imageFile: File, modelType: string): Promise<string> {
    try {
      console.log('🚀 开始上传文件并调用工作流:', {
        fileName: imageFile.name,
        fileSize: imageFile.size,
        fileType: imageFile.type,
        modelType: modelType
      })

      // 步骤1: 上传文件获取file_id
      console.log('📤 步骤1: 上传文件到Coze...')
      const fileId = await this.uploadImage(imageFile)
      console.log('✅ 文件上传成功, fileId:', fileId)

      // 步骤2: 构建工作流请求参数
      const workflowParams = {
        workflow_id: env.WORKFLOW_ID,
        space_id: "7482364475409645579",  // 添加space_id参数
        parameters: {
          "img": `{"file_id": "${fileId}"}`,  // 按照Coze API文档格式包装file_id，使用正确的变量名img
          "promptType": modelType
        }
      }

      console.log('📋 工作流请求详情:', {
        url: `${this.baseUrl}/v1/workflow/run`,
        method: 'POST',
        hasApiKey: !!this.apiKey,
        apiKeyPrefix: this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'N/A',
        workflowParams: workflowParams,
        headers: {
          'Authorization': `Bearer ${this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'N/A'}`,
          'Content-Type': 'application/json',
          'User-Agent': 'SaaSfly-AI-Prompt-Generator/1.0.0'
        }
      })

      // 步骤3: 调用工作流API
      const response = await fetch(`${this.baseUrl}/v1/workflow/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'SaaSfly-AI-Prompt-Generator/1.0.0'
        },
        body: JSON.stringify(workflowParams),
        signal: AbortSignal.timeout(this.timeout)
      })

      const responseText = await response.text()
      
      console.log('📥 工作流响应详情:', {
        status: response.status,
        statusText: response.statusText,
        responseText: responseText.substring(0, 1000) + (responseText.length > 1000 ? '...' : '')
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`)
      }

      const result = JSON.parse(responseText) as CozeWorkflowResponse

      if (result.code !== 0) {
        console.error('❌ Coze API返回错误:', result)
        throw new Error(result.message || result.msg || '工作流调用失败')
      }

      // 处理data字段 - 可能是JSON字符串或直接对象
      let parsedData
      if (typeof result.data === 'string') {
        try {
          parsedData = JSON.parse(result.data)
        } catch (parseError) {
          console.error('❌ 解析data字段JSON失败:', parseError)
          console.error('❌ data字段内容:', result.data)
          throw new Error('工作流响应data字段解析失败')
        }
      } else {
        parsedData = result.data
      }

      if (!parsedData || !parsedData.output) {
        console.error('❌ 工作流响应缺少output:', result)
        console.error('❌ parsedData:', parsedData)
        throw new Error('工作流响应缺少output字段')
      }

      console.log('✅ Coze API调用成功:', {
        code: result.code,
        message: result.message || result.msg,
        output_length: parsedData.output.length,
        usage: result.usage
      })

      return parsedData.output
    } catch (error) {
      console.error('❌ 工作流调用失败:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        fileName: imageFile?.name,
        fileSize: imageFile?.size,
        modelType
      })
      throw new Error('AI生成失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // 简单的健康检查，检查API Key是否配置
      return !!this.apiKey && this.apiKey !== ''
    } catch (error) {
      console.error('Coze健康检查失败:', error)
      return false
    }
  }

}

// 创建Coze客户端实例
function createCozeClient(): CozeAPIClient {
  // 添加详细的环境变量检查日志
  console.log('🔧 createCozeClient - 环境变量检查:', {
    hasApiKey: !!env.COZE_API_KEY,
    apiKeyLength: env.COZE_API_KEY?.length || 0,
    apiKeyPrefix: env.COZE_API_KEY ? env.COZE_API_KEY.substring(0, 10) + '...' : 'N/A',
    hasWorkflowId: !!env.WORKFLOW_ID,
    workflowId: env.WORKFLOW_ID,
    workflowIdLength: env.WORKFLOW_ID?.length || 0,
    decision: (!env.COZE_API_KEY || !env.WORKFLOW_ID) ? '使用Mock客户端' : '使用真实Coze客户端'
  })
  
  if (!env.COZE_API_KEY || !env.WORKFLOW_ID) {
    console.warn('⚠️ COZE_API_KEY或WORKFLOW_ID未配置，将使用Mock数据')
    console.warn('🔧 详细信息:', {
      missingApiKey: !env.COZE_API_KEY,
      missingWorkflowId: !env.WORKFLOW_ID,
      apiKeyValue: env.COZE_API_KEY || 'undefined',
      workflowIdValue: env.WORKFLOW_ID || 'undefined'
    })
    return new MockCozeClient()
  }

  console.log('✅ 环境变量检查通过，创建真实Coze客户端')
  return new CozeAPIClient()
}

// Mock客户端（用于开发环境或API不可用时）
class MockCozeClient extends CozeAPIClient {
  constructor() {
    super()
  }

  async uploadImage(file: File): Promise<string> {
    // 模拟文件上传
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))
    console.log('Mock upload:', file.name)
    return 'mock_file_id_' + Date.now()
  }

  async generatePrompt(fileId: string, modelType: string): Promise<string> {
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

    const prompts = mockPrompts[modelType] || mockPrompts.normal
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]

    return randomPrompt
  }

  async healthCheck(): Promise<boolean> {
    return true
  }
}

export { CozeAPIClient, createCozeClient }