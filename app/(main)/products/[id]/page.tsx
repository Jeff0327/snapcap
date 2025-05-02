import React from 'react';
import {getOneProduct} from "@/app/(main)/products/[id]/actions";
import {ProductDetail} from "@/components/main/ProductDetail";
import {CheckoutPanel} from "@/components/main/CheckoutPanel";

async function Page({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params
    if (!id) return;

    const {data} = await getOneProduct(id)

    if(!data) return;
    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* 메인 상품 정보 - 왼쪽 2/3 영역 */}
                <div className="w-full lg:w-2/3">
                    <ProductDetail product={data}/>
                </div>

                {/* 결제 및 장바구니 패널 - 오른쪽 1/3 영역 */}
                <div className="w-full lg:w-1/3">
                    {/* sticky 컨테이너 - 스크롤 시 위치 고정 */}
                    <div className="lg:sticky top-12 lg:top-12 space-y-6">
                        <CheckoutPanel
                            product={data}
                            // onAddToCart={() => {
                            //     // 서버 컴포넌트에서는 직접 이벤트 처리 불가능
                            //     // 클라이언트 컴포넌트에서 처리
                            // }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;