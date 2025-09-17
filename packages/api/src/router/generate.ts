import { z } from "zod"

import { createTRPCRouter, publicProcedure } from "../trpc"
import { createCozeClient } from "../server/coze"

// 定义输入数据的schema
const generateInputSchema = z.object({
  image_url: z.string().url("请提供有效的图片URL"),
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
    .query(async ({ input }) => {
      const { model_type, image_url } = input

      // 创建Coze客户端
      const cozeClient = createCozeClient()

      try {
        // 尝试使用真实的Coze API
        const cozeResult = await cozeClient.generatePrompt({
          image_url,
          model_type,
        })

        if (cozeResult.success) {
          return {
            success: true,
            data: {
              model: model_type,
              prompt: cozeResult.data.prompt,
              analysis: cozeResult.data.analysis || {
                dominant_colors: ["blue", "white", "gray"],
                style: model_type === "midjourney" ? "artistic" : "realistic",
                complexity: Math.random() > 0.5 ? "high" : "medium",
                subjects: ["landscape", "architecture", "abstract"].filter(() => Math.random() > 0.5),
              },
              metadata: {
                processed_at: new Date().toISOString(),
                image_url: image_url,
                processing_time: cozeResult.data.processing_time || "2.0s",
                confidence: cozeResult.data.confidence || 0.9,
                api_source: "coze",
              },
            },
          }
        }
      } catch (error) {
        console.log("Coze API调用失败，使用备用数据:", error)
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
            image_url: image_url,
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
            image_url: request.image_url,
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