/** @type {import('next').NextConfig} */
const fs = require('fs')
const path = require('path')

// .env.local 파일을 직접 읽어서 환경 변수를 강제로 설정
const envLocalPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8')
  const lines = envContent.split('\n')

  lines.forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const [, key, value] = match
      // 따옴표 제거
      const cleanValue = value.replace(/^["']|["']$/g, '')
      // 시스템 환경 변수보다 .env.local을 우선하여 강제 덮어쓰기
      process.env[key] = cleanValue
      console.log(`Forced override ${key} from .env.local (starts with: ${cleanValue.substring(0, 10)})`)
    }
  })
}

const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig