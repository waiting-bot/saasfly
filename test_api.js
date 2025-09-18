#!/usr/bin/env node

// 测试脚本 - 测试不同的参数格式
const fs = require('fs');
const path = require('path');

// 创建一个简单的测试图片base64数据
const createTestImageBase64 = () => {
  // 这是一个1x1像素的红色JPEG图片的base64
  return '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA=';
};

const testRequest = {
  image_base64: createTestImageBase64(),
  image_name: 'test_image.jpg',
  model_type: 'midjourney'
};

console.log('测试请求数据:', {
  ...testRequest,
  image_base64_length: testRequest.image_base64.length,
  hasBase64Prefix: testRequest.image_base64.includes(',')
});

// 将测试数据保存到文件，以便curl使用
fs.writeFileSync(
  path.join(__dirname, 'test_data.json'),
  JSON.stringify(testRequest, null, 2)
);

console.log('测试数据已保存到 test_data.json');
console.log('');
console.log('现在可以使用以下命令测试API:');
console.log('curl -X POST http://localhost:12883/api/trpc/edge/generate.generatePrompt \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d @test_data.json');