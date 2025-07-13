import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/api/',
                '/cart/',
                '/checkout/',
                '/order/',
                '/user/',
                '/profile/',
                '/_next/',
                '/private/'
            ],
        },
        sitemap: 'https://xn--k30bx25adxi.kr/sitemap.xml',
    }
}