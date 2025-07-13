import React from 'react';
import Banner from "@/components/main/Banner";
import ProductList from "@/components/main/ProductList";
import {getProductsByType} from "@/app/(main)/products/actions";
import { Metadata } from 'next';

// 메인 페이지 메타데이터
export const metadata: Metadata = {
    title: "모자 쇼핑몰 | 남자모자, 여자모자, 스냅캡, 캡모자 전문점 - 신상품, 베스트, 할인상품",
    description: "2024년 최신 트렌드 모자부터 베스트셀러까지! 남자모자, 여자모자, 남녀공용모자, 스냅캡, 캡모자, 야구모자, 버킷햇, 비니 등 프리미엄 브랜드 모자를 특가로 만나보세요. 신상품, 인기상품, 할인상품 한번에!",
    keywords: [
        "모자 신상품", "모자 베스트", "모자 할인", "남자모자 신상", "여자모자 베스트",
        "스냅캡 할인", "캡모자 인기", "야구모자 신상품", "버킷햇 베스트", "비니 할인",
        "브랜드모자 세일", "패션모자 트렌드", "모자 쇼핑몰 추천", "온라인 모자 쇼핑"
    ],
    openGraph: {
        title: "모자 쇼핑몰 | 신상품, 베스트, 할인상품 모음",
        description: "2024년 최신 트렌드 모자부터 베스트셀러까지! 남자모자, 여자모자, 스냅캡, 캡모자 등 프리미엄 브랜드 모자를 특가로 만나보세요.",
        url: "https://xn--k30bx25adxi.kr",
        images: [
            {
                url: "/og-main-image.jpg",
                width: 1200,
                height: 630,
                alt: "모자 쇼핑몰 메인 - 신상품, 베스트, 할인상품"
            }
        ]
    },
    alternates: {
        canonical: "https://xn--k30bx25adxi.kr"
    }
};

async function Page() {
    // 각 타입별로 상품 데이터 가져오기
    const newProducts = await getProductsByType({type:"new"});
    const bestProducts = await getProductsByType({type:"best"});
    const saleProducts = await getProductsByType({type:"sale"});
    const defaultProducts = await getProductsByType({type:"default"});

    // 구조화된 데이터 - 웹사이트
    const websiteJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "모자 쇼핑몰",
        "url": "https://xn--k30bx25adxi.kr",
        "description": "프리미엄 모자 전문 쇼핑몰",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://xn--k30bx25adxi.kr/products?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    // 구조화된 데이터 - 상품 컬렉션
    const collectionJsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "모자 컬렉션",
        "description": "신상품, 베스트상품, 할인상품 모자 컬렉션",
        "url": "https://xn--k30bx25adxi.kr",
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": (newProducts?.length || 0) + (bestProducts?.length || 0) + (saleProducts?.length || 0),
            "itemListElement": [
                ...(newProducts?.slice(0, 5).map((product, index) => ({
                    "@type": "Product",
                    "position": index + 1,
                    "name": product.name,
                    "description": product.description || `${product.name} - 신상품`,
                    "category": "모자",
                })) || [])
            ]
        }
    };

    return (
        <>
            {/* 구조화된 데이터 */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(websiteJsonLd)
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(collectionJsonLd)
                }}
            />

            {/* 메인 헤딩 - SEO를 위한 숨겨진 H1 */}
            <h1 className="sr-only">
                모자 쇼핑몰 - 남자모자, 여자모자, 스냅캡, 캡모자 전문점
            </h1>

            {/* Banner가 먼저 렌더링되지만, Header가 absolute로 위에 올라옴 */}
            <section className="relative" aria-label="메인 배너">
                <Banner/>
            </section>

            {/* NEW 상품 섹션 */}
            <section className={'p-5 lg:p-12'} aria-labelledby="new-products-heading">
                <h2 id="new-products-heading" className="sr-only">신상품 모자</h2>
                <ProductList
                    products={newProducts}
                    title="NEW"
                    viewAllLink="/products?searchType=new"
                />
                {/* 섹션별 구조화된 데이터 */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "ItemList",
                            "name": "신상품 모자",
                            "description": "최신 출시된 트렌디한 모자 컬렉션",
                            "url": "https://xn--k30bx25adxi.kr/products?searchType=new",
                            "numberOfItems": newProducts?.length || 0
                        })
                    }}
                />
            </section>

            {/* BEST 상품 섹션 */}
            <section className={'p-5 lg:p-12'} aria-labelledby="best-products-heading">
                <h2 id="best-products-heading" className="sr-only">베스트 인기 모자</h2>
                <ProductList
                    products={bestProducts}
                    title="BEST"
                    viewAllLink="/products?searchType=best"
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "ItemList",
                            "name": "베스트 인기 모자",
                            "description": "가장 인기 있는 베스트셀러 모자 컬렉션",
                            "url": "https://xn--k30bx25adxi.kr/products?searchType=best",
                            "numberOfItems": bestProducts?.length || 0
                        })
                    }}
                />
            </section>

            {/* SALE 상품 섹션 */}
            <section className={'p-5 lg:p-12'} aria-labelledby="sale-products-heading">
                <h2 id="sale-products-heading" className="sr-only">할인 특가 모자</h2>
                <ProductList
                    products={saleProducts}
                    title="SALE"
                    viewAllLink="/products?searchType=sale"
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "ItemList",
                            "name": "할인 특가 모자",
                            "description": "특별 할인가로 만나는 프리미엄 모자 컬렉션",
                            "url": "https://xn--k30bx25adxi.kr/products?searchType=sale",
                            "numberOfItems": saleProducts?.length || 0
                        })
                    }}
                />
            </section>

            {/* 전체 상품 섹션 */}
            <section className={'p-5 lg:p-12'} aria-labelledby="all-products-heading">
                <h2 id="all-products-heading" className="sr-only">전체 모자 상품</h2>
                <ProductList
                    products={defaultProducts}
                    title="PRODUCTS"
                    viewAllLink="/products?searchType=default"
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "ItemList",
                            "name": "전체 모자 상품",
                            "description": "다양한 스타일과 브랜드의 모든 모자 컬렉션",
                            "url": "https://xn--k30bx25adxi.kr/products?searchType=default",
                            "numberOfItems": defaultProducts?.length || 0
                        })
                    }}
                />
            </section>

            {/* SEO를 위한 추가 텍스트 컨텐츠 */}
            <section className="sr-only" aria-hidden="true">
                <h2>모자 쇼핑몰 카테고리</h2>
                <p>
                    남자모자: 남성을 위한 다양한 스타일의 모자를 만나보세요. 캐주얼한 스냅캡부터 포멀한 페도라까지.
                </p>
                <p>
                    여자모자: 여성을 위한 우아하고 세련된 모자 컬렉션. 베레모, 버킷햇, 선캡 등 다양한 선택.
                </p>
                <p>
                    스냅캡: 조절 가능한 스냅백 모자로 편안한 착용감과 스타일리시한 룩을 연출하세요.
                </p>
                <p>
                    캡모자: 야구모자 스타일의 클래식한 캡으로 스포츠룩부터 캐주얼룩까지 완성하세요.
                </p>
            </section>
        </>
    );
}

export default Page;