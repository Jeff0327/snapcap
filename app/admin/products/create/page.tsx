import React from 'react';
import ProductCreateForm from "@/app/admin/products/create/form";

async function Page() {
    return (
        <section className="bg-white rounded-none md:rounded-lg p-2 px-4 mb-0 md:mb-2">
            <h1 className="font-taebaek text-lg py-4">상품 등록</h1>
            <ProductCreateForm/>
        </section>
    );
}

export default Page;