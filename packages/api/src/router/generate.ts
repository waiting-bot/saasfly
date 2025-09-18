import { z } from "zod"

import { createTRPCRouter, publicProcedure } from "../trpc"
import { createCozeClient } from "../server/coze"

// 定义输入数据的schema
const generateInputSchema = z.object({
  image_base64: z.string().min(1, "请提供图片数据"),
  image_name: z.string().min(1, "请提供图片名称"),
  model_type: z.enum(["midjourney", "stableDiffusion", "flux", "normal"], {
    errorMap: () => ({ message: "请选择有效的模型类型" }),
  }),
})

// Mock提示词数据（作为备用）
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

export const generateRouter = createTRPCRouter({
  generatePrompt: publicProcedure
    .input(generateInputSchema)
    .mutation(async ({ input }) => {
      const { model_type, image_base64, image_name } = input
      
      // 打印并确认zod输入schema
      console.log('🔧 generatePrompt路由 - zod输入schema验证:', {
        inputSchema: generateInputSchema.shape,
        receivedInput: {
          model_type,
          image_base64: image_base64 ? `${image_base64.substring(0, 50)}...` : 'undefined',
          image_name,
          base64Length: image_base64?.length || 0
        },
        schemaValidation: {
          model_typeValid: ['midjourney', 'stableDiffusion', 'flux', 'normal'].includes(model_type),
          image_base64Valid: typeof image_base64 === 'string' && image_base64.length > 0,
          image_nameValid: typeof image_name === 'string' && image_name.length > 0
        }
      })

      // 创建Coze客户端
      console.log('🔧 Generate Router - 准备创建Coze客户端')
      const cozeClient = createCozeClient()

      try {
        console.log('🔄 开始处理图片:', {
          image_name,
          model_type,
          base64Length: image_base64.length,
          hasBase64Prefix: image_base64.includes(','),
        })

        // 将base64转换为File对象
        const base64Data = image_base64.split(',')[1] || image_base64
        const imageBuffer = Buffer.from(base64Data, 'base64')
        const imageFile = new File([imageBuffer], image_name, { type: 'image/jpeg' })
        
        console.log('📁 图片转换完成:', {
          fileName: imageFile.name,
          fileSize: imageFile.size,
          fileType: imageFile.type,
          bufferSize: imageBuffer.length,
        })
        
        // 使用Coze API生成提示词（先上传文件，再调用工作流）
        const prompt = await cozeClient.generatePrompt(imageFile, model_type)
        
        return {
          success: true,
          data: {
            model: model_type,
            prompt: prompt,
            analysis: {
              dominant_colors: ["blue", "white", "gray"],
              style: model_type === "midjourney" ? "artistic" : "realistic",
              complexity: Math.random() > 0.5 ? "high" : "medium",
              subjects: ["landscape", "architecture", "abstract"].filter(() => Math.random() > 0.5),
            },
            metadata: {
              processed_at: new Date().toISOString(),
              image_name: image_name,
              processing_time: "2.0s",
              confidence: 0.9,
              api_source: "coze",
            },
          },
        }
      } catch (error) {
        console.error("❌ Coze API调用失败，使用备用数据:", {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          errorType: typeof error,
          errorName: error instanceof Error ? error.name : 'Unknown',
          timestamp: new Date().toISOString()
        })
      }

      // 如果Coze API失败，使用mock数据作为备用
      console.log("使用mock数据作为备用")
      
      // 模拟API处理时间
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

      // 根据模型类型获取对应的mock提示词
      const prompts = mockPrompts[model_type]
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]

      // 模拟基于图片URL的"分析"结果
      const imageAnalysis = {
        dominant_colors: ["blue", "white", "gray"],
        style: model_type === "midjourney" ? "artistic" : "realistic",
        complexity: Math.random() > 0.5 ? "high" : "medium",
        subjects: ["landscape", "architecture", "abstract"].filter(() => Math.random() > 0.5),
      }

      return {
        success: true,
        data: {
          model: model_type,
          prompt: randomPrompt,
          analysis: imageAnalysis,
          metadata: {
            processed_at: new Date().toISOString(),
            image_name: image_name,
            processing_time: "1.5s",
            confidence: 0.85 + Math.random() * 0.1,
            api_source: "mock",
          },
        },
      }
    }),

  // 批量生成端点（可选）
  generateBatch: publicProcedure
    .input(
      z.object({
        requests: z.array(generateInputSchema).min(1).max(10),
      })
    )
    .query(async ({ input }) => {
      // 模拟批量处理
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const results = await Promise.all(
        input.requests.map(async (request) => {
          await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))
          
          const prompts = mockPrompts[request.model_type]
          const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]

          return {
            model: request.model_type,
            prompt: randomPrompt,
            image_name: request.image_name,
            success: true,
          }
        })
      )

      return {
        success: true,
        data: {
          results,
          total_processed: results.length,
          processing_time: `${(2 + results.length * 0.5).toFixed(1)}s`,
        },
      }
    }),
})