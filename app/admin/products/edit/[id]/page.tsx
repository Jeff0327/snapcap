import React from 'react';
import {getOneProduct} from "@/app/(main)/products/[id]/actions";
import ProductEditForm from "@/app/admin/products/edit/[id]/form";

async function Page({params}:{params:Promise<{id:string}>}) {
    const {id}= await params

    if(!id) return null;
    const {data} = await getOneProduct(id)

    if(!data) return (
        <div>상품을 찾을 수 없습니다.</div>
    )
    return (
        <section className="bg-white rounded-none md:rounded-lg p-2 px-4 mb-0 md:mb-2">
            <h1 className="font-taebaek text-lg py-4">상품 등록</h1>
            <ProductEditForm product={data}/>
        </section>
    );
}

export default Page;