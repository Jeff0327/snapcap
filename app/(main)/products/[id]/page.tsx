import React from 'react';
import {getOneProduct} from "@/app/(main)/products/[id]/actions";
import {ProductDetail} from "@/components/main/ProductDetail";
import {CheckoutPanel} from "@/components/main/CheckoutPanel";
import {createClient} from "@/utils/server";


async function Page({params}: { params: Promise<{ id: string; search?: string }> }) {
    const {id, search} = await params;
    const supabase= await createClient()
    if (!id) return null;

    // search 파라미터를 getOneProduct에 전달
    const {data} = await getOneProduct(id, search);
    const {data:{user}}=await supabase.auth.getUser()
    if(!data) {
        return (
            <div className="max-w-5xl mx-auto py-8 text-center">
                <h2 className="text-2xl font-bold mb-4">상품을 찾을 수 없습니다</h2>
                <p>검색한 상품이 존재하지 않거나 삭제되었습니다.</p>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto py-8 max-w-7xl lg:px-2">
            <div className="flex flex-col lg:flex-row gap-12 w-full lg:max-w-5xl mx-auto">
                {/* 메인 상품 정보 - 모바일에서는 전체 너비, 데스크톱에서는 왼쪽 2/3 영역 */}
                <div className="w-full lg:w-2/3 flex flex-col">
                    {/* 모바일에서 주문 패널을 ProductDetail보다 먼저 표시하기 위한 순서 조정 */}
                    <div className="lg:hidden order-2 mt-8">
                        <CheckoutPanel
                            product={data}
                            user={user}
                            className="sticky top-4 z-10"
                        />
                    </div>

                    <div className="order-1 lg:order-none">
                        <ProductDetail product={data}/>
                    </div>
                </div>

                {/* 데스크톱에서만 보이는 결제 및 장바구니 패널 - 오른쪽 1/3 영역 */}
                <div className="hidden lg:block w-full lg:w-1/3">
                    {/* sticky 컨테이너 - 스크롤 시 위치 고정 */}
                    <div className="lg:sticky top-12 space-y-6">
                        <CheckoutPanel
                            product={data}
                            user={user}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;