/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.kakaocdn.net',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: '**.googleusercontent.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'iexyvfasxevlktovbpkr.supabase.co',
                port: '',
                pathname: '**',
            }
        ]
    },
    // 기타 Next.js 설정...
};

module.exports = nextConfig;