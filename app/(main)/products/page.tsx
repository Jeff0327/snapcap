import React from 'react';
import { getProductsByType } from './actions';
import ProductList from "@/components/main/ProductList";

async function Page({ searchParams }: { searchParams:Promise< { searchType: string }> }) {
    // 검색 타입이 없을 경우 기본값 설정
    const {searchType} = await searchParams

    // 타입에 따른 타이틀 맵핑
    const titleMap: Record<string, string> = {
        'best': '인기 상품',
        'new': '신상품',
        'sale': '할인 상품',
        'default': '전체 상품'
    };
    let type= null;
    if(!searchType) type='default'
    else type=searchType;
    // 상품 데이터 가져오기
    const products = await getProductsByType({ type });

    // 타이틀 설정 (맵에 없으면 검색 타입 그대로 표시)
    const title = titleMap[type] || type.toUpperCase();

    return (
        <div className="container mx-auto px-4 py-8">
            <ProductList
                products={products}
                title={title}
                viewAllLink={`/products`} // 기본 상품 페이지 링크
            />
        </div>
    );
}

export default Page;