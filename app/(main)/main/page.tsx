import React from 'react';
import Banner from "@/components/main/Banner";
import ProductList from "@/components/main/ProductList";
import { ProductList as fetchProducts } from "@/app/(main)/main/actions";

async function Page() {
    const result = await fetchProducts();
    const products = result.data || [];

    return (
        <>
            {/* Banner가 먼저 렌더링되지만, Header가 absolute로 위에 올라옴 */}
            <div className="relative">
                <Banner/>
            </div>
            <div className={'p-5 lg:p-12'}>
                <ProductList
                    products={products}
                    title="BEST"
                />
            </div>
        </>
    );
}

export default Page;