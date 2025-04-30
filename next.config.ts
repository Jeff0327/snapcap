/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: [
            'img1.kakaocdn.net',      // 카카오 이미지 도메인
            't1.kakaocdn.net',        // 카카오 추가 이미지 도메인
            'k.kakaocdn.net',         // 카카오 추가 이미지 도메인
            'lh3.googleusercontent.com'  // 구글 이미지 도메인 (구글 로그인 사용 시)
        ],
        // 또는 패턴을 사용할 수도 있습니다:
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
            }
        ]
    },
    // 기타 Next.js 설정...
};

module.exports = nextConfig;