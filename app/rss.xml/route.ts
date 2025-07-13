import { NextResponse } from 'next/server'

export async function GET() {
    const baseUrl = 'https://xn--k30bx25adxi.kr'
    const currentDate = new Date().toISOString()

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>모자 쇼핑몰 - 최신 상품 및 소식</title>
    <description>모자 전문 쇼핑몰의 최신 상품과 소식을 전해드립니다. 남자모자, 여자모자,남녀공동 스냅캡, 캡모자 등 다양한 브랜드 모자 정보.</description>
    <link>${baseUrl}</link>
    <language>ko-KR</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    
    <item>
      <title>2025년 신상품 모자 컬렉션 출시</title>
      <description>최신 트렌드를 반영한 2025년 신상품 모자 컬렉션이 출시되었습니다. 남자모자, 여자모자,남녀공동 스냅캡 등 다양한 스타일을 만나보세요.</description>
      <link>${baseUrl}/products?searchType=new</link>
      <guid>${baseUrl}/products?searchType=new</guid>
      <pubDate>${currentDate}</pubDate>
      <category>신상품</category>
    </item>
    
    <item>
      <title>베스트셀러 모자 특별 할인 이벤트</title>
      <description>고객들이 가장 사랑하는 베스트셀러 모자들을 특별 할인가로 만나보세요. 할인특가!</description>
      <link>${baseUrl}/products?searchType=sale</link>
      <guid>${baseUrl}/products?searchType=sale</guid>
      <pubDate>${currentDate}</pubDate>
      <category>할인이벤트</category>
    </item>
    
    <item>
      <title>인기 트랜드 모자 추천</title>
      <description>프리미엄 브랜드 모자 컬렉션을 소개합니다. 인기 트랜드 최신 모자들을 만나보세요.</description>
      <link>${baseUrl}/products?searchType=best</link>
      <guid>${baseUrl}/products?searchType=best</guid>
      <pubDate>${currentDate}</pubDate>
    </item>
    
  </channel>
</rss>`

    return new NextResponse(rssXml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
        }
    })
}