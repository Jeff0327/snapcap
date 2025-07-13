import type { Metadata } from "next";
import "./styles/globals.css";
import {LoadingProvider} from "@/components/layout/LoadingProvider";

export const metadata: Metadata = {
    title: {
        default: "모자 쇼핑몰 | 남자모자, 여자모자, 스냅캡, 캡모자 전문점",
        template: "%s | 모자 쇼핑몰"
    },
    description: "프리미엄 모자 전문 쇼핑몰입니다. 남자모자, 여자모자, 남녀공용모자, 스냅캡, 캡모자, 야구모자, 버킷햇, 비니 등 다양한 브랜드 모자를 합리적인 가격에 제공합니다. 최신 트렌드 모자부터 클래식한 디자인까지 만나보세요.",
    keywords: [
        "모자", "남자모자", "여자모자", "남녀공용모자", "스냅캡", "캡모자", "야구모자",
        "버킷햇", "비니", "베레모", "썬캡", "트러커캡", "플렉스핏", "뉴에라", "아디다스모자",
        "나이키모자", "모자쇼핑몰", "온라인모자", "브랜드모자", "패션모자", "스포츠모자",
        "힙합모자", "스트릿모자", "모자추천", "모자코디", "모자브랜드", "모자전문점"
    ],
    authors: [{ name: "모자 쇼핑몰" }],
    creator: "모자 쇼핑몰",
    publisher: "모자 쇼핑몰",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://xn--k30bx25adxi.kr'),
    alternates: {
        canonical: '/',
        languages: {
            'ko-KR': '/ko',
        },
    },
    openGraph: {
        type: 'website',
        locale: 'ko_KR',
        url: 'https://xn--k30bx25adxi.kr',
        title: '모자 쇼핑몰 | 남자모자, 여자모자, 스냅캡, 캡모자 전문점',
        description: '프리미엄 모자 전문 쇼핑몰. 남자모자, 여자모자, 남녀공용모자, 스냅캡, 캡모자 등 다양한 브랜드 모자를 합리적인 가격에 만나보세요.',
        siteName: '모자 쇼핑몰',
        images: [{
            url: '/logo/snapcap.png', // 실제 이미지 경로로 변경
            width: 1200,
            height: 630,
            alt: '모자 쇼핑몰 - 다양한 브랜드 모자 컬렉션',
        }],
    },
    twitter: {
        card: 'summary_large_image',
        title: '모자 쇼핑몰 | 남자모자, 여자모자, 스냅캡, 캡모자 전문점',
        description: '프리미엄 모자 전문 쇼핑몰. 남자모자, 여자모자, 남녀공용모자, 스냅캡, 캡모자 등 다양한 브랜드 모자를 합리적인 가격에 만나보세요.',
        images: ['/logo/snapcap.png'], // 실제 이미지 경로로 변경
    },
    robots: {
        index: true,
        follow: true,
        nocache: true,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'M4gPHM4WLn0OLlqFMQ6Q0OsqscuaHWSXkGjtiuJMtuc', // Google Search Console 인증 코드
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
        <head>
            {/* Preconnect for performance */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

            {/* Favicon */}
            <link rel="icon" href="/favicon.ico" sizes="any" />
            <link rel="icon" href="/icon.svg" type="image/svg+xml" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

            {/* Manifest */}
            <link rel="manifest" href="/manifest.json" />

            {/* Theme color */}
            <meta name="theme-color" content="#ffffff" />

            {/* Viewport */}
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />

            {/* Additional SEO meta tags */}
            <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
            <meta name="googlebot" content="index, follow" />
            <meta name="bingbot" content="index, follow" />

            {/* Korean specific */}
            <meta httpEquiv="Content-Language" content="ko" />

            {/* Security */}
            <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
            <meta httpEquiv="X-Frame-Options" content="DENY" />
            <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />

            {/* Structured Data for Organization */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "모자 쇼핑몰",
                        "url": "https://xn--k30bx25adxi.kr",
                        "logo": "https://xn--k30bx25adxi.kr/logo/snapcap.png",
                        "description": "프리미엄 모자 전문 쇼핑몰",
                        "address": {
                            "@type": "PostalAddress",
                            "addressCountry": "KR"
                        },
                        "sameAs": [
                            "https://www.instagram.com/yourshop",
                            "https://www.facebook.com/yourshop",
                            "https://blog.naver.com/yourshop"
                        ]
                    })
                }}
            />
        </head>
        <body className="antialiased">
        <LoadingProvider>
            {children}
        </LoadingProvider>
        </body>
        </html>
    );
}