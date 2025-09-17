"use client"

import { useState } from "react"
import { Button } from "@saasfly/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@saasfly/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@saasfly/ui/select"
import { Upload, Image as ImageIcon, Loader2, Copy, RefreshCw } from "lucide-react"

const MODELS = [
  { value: "midjourney", label: "Midjourney", description: "适合艺术创作和想象场景" },
  { value: "stableDiffusion", label: "Stable Diffusion", description: "通用图像生成，效果稳定" },
  { value: "flux", label: "Flux", description: "新兴模型，创意效果出色" },
  { value: "normal", label: "Normal", description: "标准提示词生成" },
]

interface GenerateResponse {
  success: boolean
  data: {
    model: string
    prompt: string
    analysis: {
      dominant_colors: string[]
      style: string
      complexity: string
      subjects: string[]
    }
    metadata: {
      processed_at: string
      image_url: string
      processing_time: string
      confidence: number
    }
  }
}

export default function AIPromptPage() {
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("")
  const [generatedData, setGeneratedData] = useState<GenerateResponse["data"] | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGeneratePrompt = async () => {
    if (!selectedModel || !uploadedImage) {
      alert("请选择模型并上传图片")
      return
    }

    setIsLoading(true)
    try {
      // 将base64图片转换为临时URL（实际项目中应该上传到云存储）
      const imageUrl = uploadedImage // 在实际项目中，这里应该是上传后的URL

      const response = await fetch(`/api/trpc/edge/generate.generatePrompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          json: {
            image_url: imageUrl,
            model_type: selectedModel,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('API请求失败')
      }

      const result: GenerateResponse = await response.json()
      
      if (result.success) {
        setGeneratedPrompt(result.data.prompt)
        setGeneratedData(result.data)
      } else {
        throw new Error('生成失败')
      }
    } catch (error) {
      console.error("生成失败:", error)
      alert("生成失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyPrompt = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt)
      alert("提示词已复制到剪贴板")
    }
  }

  const handleRegenerate = () => {
    handleGeneratePrompt()
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">AI Prompt 生成器</h1>
          <p className="text-lg text-muted-foreground">
            上传图片，选择AI模型，生成专业的提示词
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：输入区域 */}
          <div className="space-y-6">
            {/* 模型选择 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  选择AI模型
                </CardTitle>
                <CardDescription>
                  根据您的需求选择合适的AI模型
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择一个AI模型" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{model.label}</span>
                          <span className="text-sm text-muted-foreground">{model.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* 图片上传 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  上传图片
                </CardTitle>
                <CardDescription>
                  支持 JPG、PNG 格式，文件大小不超过 10MB
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {uploadedImage ? (
                    <div className="space-y-4">
                      <img 
                        src={uploadedImage} 
                        alt="上传的图片" 
                        className="max-w-full h-auto mx-auto rounded-lg"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => setUploadedImage(null)}
                      >
                        重新上传
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium">拖拽图片到此处</p>
                        <p className="text-sm text-muted-foreground">或点击选择文件</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <Button className="cursor-pointer" asChild>
                          <span>选择图片</span>
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 生成按钮 */}
            <Button 
              onClick={handleGeneratePrompt}
              disabled={!selectedModel || !uploadedImage || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                "生成提示词"
              )}
            </Button>
          </div>

          {/* 右侧：结果区域 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>生成的提示词</CardTitle>
                <CardDescription>
                  AI模型为您的图片生成的专业提示词
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedPrompt && generatedData ? (
                  <div className="space-y-6">
                    {/* 生成的提示词 */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground">生成的提示词</h4>
                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{generatedPrompt}</p>
                      </div>
                    </div>

                    {/* 图片分析信息 */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground">图片分析</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-gray-50 p-3 rounded">
                          <span className="text-muted-foreground">主色调：</span>
                          <div className="flex gap-1 mt-1">
                            {generatedData.analysis.dominant_colors.map((color, index) => (
                              <div 
                                key={index}
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <span className="text-muted-foreground">风格：</span>
                          <span className="ml-1 font-medium">{generatedData.analysis.style}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <span className="text-muted-foreground">复杂度：</span>
                          <span className="ml-1 font-medium">{generatedData.analysis.complexity}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <span className="text-muted-foreground">置信度：</span>
                          <span className="ml-1 font-medium">
                            {(generatedData.metadata.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      <Button onClick={handleCopyPrompt} variant="outline" size="sm">
                        <Copy className="mr-2 h-4 w-4" />
                        复制提示词
                      </Button>
                      <Button onClick={handleRegenerate} variant="outline" size="sm" disabled={isLoading}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        重新生成
                      </Button>
                    </div>

                    {/* 元数据 */}
                    <div className="text-xs text-muted-foreground border-t pt-3">
                      <p>处理时间：{generatedData.metadata.processing_time}</p>
                      <p>生成时间：{new Date(generatedData.metadata.processed_at).toLocaleString()}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>选择模型并上传图片后，点击生成按钮</p>
                    <p className="text-sm">AI将为您生成专业的提示词</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}