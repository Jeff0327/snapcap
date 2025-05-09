'use client'
import React from 'react';
import {Label} from "@/components/ui/label";
import useAlert from "@/lib/notiflix/useAlert";
import {useRouter} from "next/navigation";
import {CartItem} from "@/types";

function CreatePaymentForm({cartItems}: {cartItems: CartItem[]}) {

    const {notify} = useAlert()
    const router = useRouter()

    // 총 가격 계산
    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => {
            if (!item.product) return total;
            const price = item.product.sale_price || item.product.price;
            return total + (price * item.quantity);
        }, 0);
    };
    const handlePaymentSuccess = (data: any) => {
        console.log('결제 성공:', data);
        // 여기서 주문 완료 처리 로직 실행
        notify.success('결제가 완료되었습니다.');
        router.push(`/order/complete/${data.receipt_id}`);
    };

    const handlePaymentFailure = (data: any) => {
        if (data.event === "cancel") return;
        else notify.failure('결제에 실패했습니다. 다시 시도해주세요.');
    };

    // 주문 상품명 생성 (첫 번째 상품명 + 나머지 수량)
    const getOrderName = () => {
        if (cartItems.length === 0) return '';
        if (cartItems.length === 1) return cartItems[0].product?.name || '';

        const firstItemName = cartItems[0].product?.name || '';
        const remainingCount = cartItems.length - 1;
        return `${firstItemName} 외 ${remainingCount}건`;
    };

    // 총 상품 수량 계산
    const getTotalQuantity = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };
    return (
        <div
            className={'contain-none xl:container mx-auto flex lg:flex-row flex-col justify-between items-start w-full gap-4'}>
            {/* 주문 폼 */}
            <div className={'w-full lg:w-2/3'}>
                <div className="space-y-8">
                    {/* 주문자 정보 */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-bold mb-4 pb-2 border-b">주문자 정보</h2>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">이름</Label>

                            </div>

                            <div>
                                <Label htmlFor="phone">연락처</Label>

                            </div>
                        </div>
                    </div>

                    {/* 배송지 정보 */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b">
                            <h2 className="text-lg font-bold">배송지 정보</h2>

                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="recipientName">수령인</Label>

                            </div>

                            <div>
                                <Label htmlFor="recipientPhone">연락처</Label>

                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* 주문 요약 부분 */}
            {/*<div className="lg:w-1/3 w-full">*/}
            {/*    <div className="bg-white p-6 rounded-lg shadow sticky top-6">*/}
            {/*        <h2 className="text-lg font-bold mb-4 pb-2 border-b">주문 요약</h2>*/}

            {/*        <div className="mb-4">*/}
            {/*            <div className="flex space-x-4 mb-4">*/}
            {/*                {cartItems.length > 0 && cartItems[0].product && cartItems[0].product.images && cartItems[0].product.images[0] && (*/}
            {/*                    <div className="w-20 h-20 flex-shrink-0">*/}
            {/*                        <Image*/}
            {/*                            src={cartItems[0].product.images[0]}*/}
            {/*                            alt={cartItems[0].product.name || '상품 이미지'}*/}
            {/*                            width={80}*/}
            {/*                            height={80}*/}
            {/*                            className="w-full h-full object-cover rounded"*/}
            {/*                        />*/}
            {/*                    </div>*/}
            {/*                )}*/}
            {/*                <div>*/}
            {/*                    <h3 className="font-medium">{getOrderName()}</h3>*/}
            {/*                    <p className="text-sm text-gray-600">수량: {getTotalQuantity()}개</p>*/}
            {/*                </div>*/}
            {/*            </div>*/}

            {/*            <div className="space-y-2 mb-4">*/}
            {/*                {cartItems.map((item, index) => (*/}
            {/*                    <div key={item.id || index} className="flex justify-between text-sm">*/}
            {/*                        <span className="text-gray-600 truncate max-w-[60%]">*/}
            {/*                            {item.product?.name} {item.color && `(${item.color})`} x {item.quantity}*/}
            {/*                        </span>*/}
            {/*                        <span>*/}
            {/*                            {item.product?.sale_price ? (*/}
            {/*                                <span className="text-red-500">*/}
            {/*                                    {formatPrice(item.product.sale_price * item.quantity)}*/}
            {/*                                </span>*/}
            {/*                            ) : (*/}
            {/*                                formatPrice((item.product?.price || 0) * item.quantity)*/}
            {/*                            )}*/}
            {/*                        </span>*/}
            {/*                    </div>*/}
            {/*                ))}*/}

            {/*                <div className="flex justify-between pt-2 border-t">*/}
            {/*                    <span className="text-gray-600">배송비</span>*/}
            {/*                    <span>무료</span>*/}
            {/*                </div>*/}
            {/*            </div>*/}

            {/*            <div className="pt-3 border-t">*/}
            {/*                <div className="flex justify-between text-lg font-bold">*/}
            {/*                    <span>총 결제금액</span>*/}
            {/*                    <span>{formatPrice(getTotalPrice())}</span>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        </div>*/}

            {/*        /!* 주문 버튼 (데스크톱) *!/*/}
            {/*        <div className="hidden lg:block">*/}
            {/*            <BootpayPayment*/}
            {/*                formData={new FormData()}*/}
            {/*                applicationId={process.env.NEXT_PUBLIC_BOOTPAY_KEY!} // 실제 애플리케이션 ID로 교체*/}
            {/*                price={getTotalPrice()}*/}
            {/*                orderName={getOrderName()}*/}
            {/*                orderId={`ORDER_${new Date().getTime()}`}*/}
            {/*                pg="다날"*/}
            {/*                method="카드"*/}
            {/*                user={{*/}
            {/*                    id: user?.id || 'guest',*/}
            {/*                    username: name,*/}
            {/*                    phone: phone,*/}
            {/*                    email: user?.email || ''*/}
            {/*                }}*/}
            {/*                items={cartItems.map(item => ({*/}
            {/*                    id: item.product?.id || '',*/}
            {/*                    name: item.product?.name || '',*/}
            {/*                    qty: item.quantity,*/}
            {/*                    price: item.product?.sale_price || item.product?.price || 0*/}
            {/*                }))}*/}
            {/*                onSuccess={handlePaymentSuccess}*/}
            {/*                onFailure={handlePaymentFailure}*/}
            {/*                onCancel={(data) => console.log('결제 취소:', data)}*/}
            {/*                // disabled={!phoneVerified || paymentProcessing}*/}
            {/*                buttonText={paymentProcessing ? "처리 중..." : "결제하기"}*/}
            {/*                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md"*/}
            {/*            />*/}
            {/*        </div>*/}

            {/*        <p className="text-xs text-gray-500 mt-4 text-center">*/}
            {/*            주문하기 버튼을 클릭하면 구매조건에 동의하는 것으로 간주합니다.*/}
            {/*        </p>*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/*/!* 주문 버튼 (모바일) *!/*/}
            {/*<div className="lg:hidden w-full">*/}
            {/*    <Button*/}
            {/*        type="submit"*/}
            {/*        form="order-form"*/}
            {/*        className="w-full bg-blue-300 hover:bg-blue-700 hover:transition-colors duration-300 text-white"*/}
            {/*        disabled={!phoneVerified || paymentProcessing}*/}
            {/*    >*/}
            {/*        {paymentProcessing ? "처리 중..." : "결제하기"}*/}
            {/*    </Button>*/}
            {/*</div>*/}
        </div>
    );
}

export default CreatePaymentForm;