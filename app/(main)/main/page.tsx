import React from 'react';
import Banner from "@/components/main/Banner";
import ProductList from "@/components/main/ProductList";
import {getProductsByType} from "@/app/(main)/products/actions";


async function Page() {
    // 각 타입별로 상품 데이터 가져오기
    const newProducts = await getProductsByType({type:"new"});
    const bestProducts = await getProductsByType({type:"best"});
    const saleProducts = await getProductsByType({type:"sale"});
    const defaultProducts = await getProductsByType({type:"default"});

    return (
        <>
            {/* Banner가 먼저 렌더링되지만, Header가 absolute로 위에 올라옴 */}
            <div className="relative">
                <Banner/>
            </div>

            {/* NEW 상품 섹션 */}
            <div className={'p-5 lg:p-12'}>
                <ProductList
                    products={newProducts}
                    title="NEW"
                    viewAllLink="/products?searchType=new"
                />
            </div>

            {/* BEST 상품 섹션 */}
            <div className={'p-5 lg:p-12'}>
                <ProductList
                    products={bestProducts}
                    title="BEST"
                    viewAllLink="/products?searchType=best"
                />
            </div>

            {/* SALE 상품 섹션 */}
            <div className={'p-5 lg:p-12'}>
                <ProductList
                    products={saleProducts}
                    title="SALE"
                    viewAllLink="/products?searchType=sale"
                />
            </div>

            {/* 전체 상품 섹션 */}
            <div className={'p-5 lg:p-12'}>
                <ProductList
                    products={defaultProducts}
                    title="PRODUCTS"
                    viewAllLink="/products?searchType=default"
                />
            </div>
        </>
    );
}

export default Page;