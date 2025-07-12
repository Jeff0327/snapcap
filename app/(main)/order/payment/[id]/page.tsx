// 수정된 결제 페이지
import React from 'react';
import {createClient} from "@/utils/server";
import {redirect} from "next/navigation";
import {getOrdersProduct} from "@/app/(main)/order/payment/[id]/actions";
import OrderInfo from "@/components/order/payment/OrderInfo";
import ShippingInfo from "@/components/order/payment/ShippingInfo";
import OrderProducts from "@/components/order/payment/OrderProducts";
import PaymentButton from "@/components/ui/PaymentButton";

async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect('/login');
    if (!id) return <div>결제정보를 찾을 수 없습니다.</div>;

    const result = await getOrdersProduct(id);

    if (!result.success || !result.data) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-3xl mx-auto p-4">
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <h1 className="text-2xl font-bold mb-4">결제 정보를 찾을 수 없습니다.</h1>
                        <p className="text-gray-600">{result.message || '주문 정보를 불러오는 중 오류가 발생했습니다.'}</p>
                    </div>
                </div>
            </div>
        );
    }

    const order = result.data;
    const inventoryCheck = order.inventory_check;

    // 🎯 품절 여부 확인 - boolean 값으로 계산
    const hasOutOfStock = inventoryCheck && inventoryCheck.has_out_of_stock;
    const canProceed = inventoryCheck && inventoryCheck.can_proceed;

    // 🎯 품절 상품이 있는 경우 UI
    if (order.payment_status === 'pending' && hasOutOfStock) {
        const outOfStockProducts = inventoryCheck.checks.filter(check => !check.is_in_stock);

        return (
            <div className="min-h-screen py-8 mt-8 lg:mt-12">
                <div className="max-w-3xl mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-6">결제 정보</h1>

                    {/* 🚨 품절 경고 */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                        <div className="flex items-center mb-4">
                            <div className="bg-red-100 rounded-full p-2 mr-3">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-red-800">품절된 상품이 있습니다</h2>
                        </div>

                        <p className="text-red-700 mb-4">
                            다음 상품들이 품절되어 현재 결제를 진행할 수 없습니다:
                        </p>

                        <div className="space-y-2">
                            {outOfStockProducts.map((check, index) => (
                                <div key={index} className="bg-white rounded p-3 border border-red-200">
                                    <div className="flex md:flex-row flex-col justify-between items-center">
                                        <span className="font-medium text-red-800">{check.product_name}</span>
                                        <span className="text-sm text-red-600">
                                            주문: {check.order_quantity}개, 재고: {check.current_inventory}개
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm text-yellow-800">
                                💡 <strong>해결 방법:</strong> 장바구니에서 수량을 조정하거나 품절된 상품을 제거한 후 다시 주문해주세요.
                            </p>
                        </div>
                    </div>

                    <OrderInfo order={order} />
                    <ShippingInfo address={order.address} />
                    <OrderProducts products={order.products} inventoryCheck={inventoryCheck} />

                    {/* 🚫 결제 버튼 - 품절로 인해 비활성화 */}
                    <PaymentButton
                        order={order}
                        user={user}
                        disabled={true} // 🎯 품절 시 true
                    />
                </div>
            </div>
        );
    }

    // 🎯 정상적인 결제 페이지
    return (
        <div className="min-h-screen py-8 mt-8 lg:mt-12">
            <div className="max-w-3xl mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6">결제 정보</h1>

                {/* ✅ 재고 확인 완료 알림 (결제 대기 상태일 때만) */}
                {order.payment_status === 'pending' && canProceed && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <div className="bg-green-100 rounded-full p-1 mr-3">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-green-800 font-medium">모든 상품의 재고가 충분합니다</span>
                        </div>
                    </div>
                )}

                <OrderInfo order={order} />
                <ShippingInfo address={order.address} />
                <OrderProducts products={order.products} inventoryCheck={inventoryCheck} />

                {/* 결제 버튼 */}
                {order.payment_status === 'pending' && (
                    <PaymentButton
                        order={order}
                        user={user}
                        disabled={!canProceed} // 🎯 재고 부족 시 true, 충분하면 false
                    />
                )}
            </div>
        </div>
    );
}

export default Page;