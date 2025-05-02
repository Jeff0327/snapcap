import React from 'react';
import Banner from "@/components/main/Banner";
import ProductList from "@/components/main/ProductList";
import { ProductList as fetchProducts } from "@/app/(main)/main/actions";

async function Page() {
    const result = await fetchProducts();
    const products = result.data || [];

    return (
        <div>
            <Banner/>
            <div className={'p-5 lg:p-12'}>
                <ProductList
                    products={products}
                    title="BEST"
                />
            </div>
        </div>
    );
}

export default Page;