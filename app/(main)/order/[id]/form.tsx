'use client';

import React, {useState} from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ProductsJson } from "@/types";
import AddressSearch from "@/lib/address/AddressSearch";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import PhoneVerifyForm from "@/components/order/verifyCheck/PhoneVerifyForm";
import useAlert from "@/lib/notiflix/useAlert";
import {User} from "@supabase/supabase-js";
import {useLoading} from "@/components/layout/LoadingProvider";
import BootpayPayment from "@/lib/payment/Bootpayment";

export default function OrderForm({ product ,user}: { product: ProductsJson; user:User |null }) {
    const searchParams = useSearchParams();
    const {notify} = useAlert()
    const quantity = searchParams.get('quantity') || '1';
    const color = searchParams.get('color') || null;
    const [address, setAddress] = useState('');

    const router = useRouter()
    // 주문자 정보
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    // 배송지 정보
    const [recipientName, setRecipientName] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');

    // 주문 관련 상태
    const [sameAsOrderer, setSameAsOrderer] = useState(true);
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    // 가격 포맷팅 함수
    const formatPrice = (price: number) => {
        if (!price) return '-';
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
            maximumFractionDigits: 0
        }).format(Number(price));
    };

    // 총 가격 계산
    const getTotalPrice = () => {
        const unitPrice = product.sale_price || product.price;
        return unitPrice * parseInt(quantity);
    };

    // 주문자와 배송지 정보 동기화 처리
    const handleSameAsOrdererChange = (checked: boolean) => {
        setSameAsOrderer(checked);

        if (checked) {
            setRecipientName(name);
            setRecipientPhone(phone);
        } else {
            setRecipientName('');
            setRecipientPhone('');
        }
    };

    const handleAddressChange = (newAddress: string) => {
        setAddress(newAddress);
    };

    // 전화번호 인증 상태 업데이트
    const handlePhoneVerified = (verified: boolean) => {
        setPhoneVerified(verified);
    };

    const handlePaymentSuccess = (data:any) => {
        console.log('결제 성공:', data);
        // 여기서 주문 완료 처리 로직 실행
        notify.success('결제가 완료되었습니다.');
        router.push(`/order/complete/${data.receipt_id}`);
    };

    const handlePaymentFailure = (data:any) => {
        if(data.event==="cancel") return;
        else notify.failure('결제에 실패했습니다. 다시 시도해주세요.');
    };
    return (
        <div className={'container mx-auto flex lg:flex-row flex-col justify-between items-start w-full gap-4'}>
            {/* 주문 폼 */}
            <div className={'lg:w-2/3 w-full'}>
                <div className="space-y-8">
                    {/* 주문자 정보 */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-bold mb-4 pb-2 border-b">주문자 정보</h2>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">이름</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (sameAsOrderer) setRecipientName(e.target.value);
                                    }}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone">연락처</Label>
                                <PhoneVerifyForm onVerified={handlePhoneVerified} setPhone={setPhone} phone={phone}/>
                            </div>
                            <input type={'hidden'} name={'email'} value={user?.email ||''}/>
                        </div>
                    </div>

                    {/* 배송지 정보 */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b">
                            <h2 className="text-lg font-bold">배송지 정보</h2>
                            <div className="flex items-center gap-2 text-center">
                                <Label htmlFor="sameAsOrderer" className="cursor-pointer mb-0">주문자 정보와 동일</Label>
                                <Checkbox
                                    id="sameAsOrderer"
                                    checked={sameAsOrderer}
                                    onCheckedChange={handleSameAsOrdererChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="recipientName">수령인</Label>
                                <Input
                                    id="recipientName"
                                    name="recipientName"
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="recipientPhone">연락처</Label>
                                <Input
                                    id="recipientPhone"
                                    name="recipientPhone"
                                    value={recipientPhone}
                                    onChange={(e) => setRecipientPhone(e.target.value)}
                                    placeholder="'-' 없이 입력"
                                    required
                                />
                            </div>

                            <AddressSearch/>
                        </div>
                    </div>
                </div>
            </div>

            {/* 주문 요약 부분 */}
            <div className="lg:w-1/3 w-full">
                <div className="bg-white p-6 rounded-lg shadow sticky top-6">
                    <h2 className="text-lg font-bold mb-4 pb-2 border-b">주문 요약</h2>

                    <div className="mb-4">
                        <div className="flex space-x-4 mb-4">
                            {product.images && product.images[0] && (
                                <div className="w-20 h-20 flex-shrink-0">
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover rounded"
                                    />
                                </div>
                            )}
                            <div>
                                <h3 className="font-medium">{product.name}</h3>
                                {color && <p className="text-sm text-gray-600">색상: {color}</p>}
                                <p className="text-sm text-gray-600">수량: {quantity}개</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">상품 가격</span>
                                <span>
                            {product.sale_price ? (
                                <span>
                                    <span
                                        className="text-red-500 font-medium">{formatPrice(product.sale_price)}</span>
                                    <span
                                        className="text-gray-400 text-sm line-through ml-1">{formatPrice(product.price)}</span>
                                </span>
                            ) : (
                                formatPrice(product.price)
                            )}
                        </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">수량</span>
                                <span>{quantity}개</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">배송비</span>
                                <span>무료</span>
                            </div>
                        </div>

                        <div className="pt-3 border-t">
                            <div className="flex justify-between text-lg font-bold">
                                <span>총 결제금액</span>
                                <span>{formatPrice(getTotalPrice())}</span>
                            </div>
                        </div>
                    </div>

                    {/* 주문 버튼 (데스크톱) */}
                    <div className="hidden lg:block">
                        <BootpayPayment
                            applicationId="59a4d323396fa607cbe75de4" // 실제 애플리케이션 ID로 교체
                            price={getTotalPrice()}
                            formData={new FormData()}
                            orderName={`${product.name} 외 ${parseInt(quantity) - 1}건`}
                            orderId={`ORDER_${new Date().getTime()}`}
                            pg="다날"
                            method="카드"
                            user={{
                                id: user?.id || 'guest',
                                username: name,
                                phone: phone,
                                email: user?.email || ''
                            }}
                            items={[
                                {
                                    id: product.id,
                                    name: product.name,
                                    qty: parseInt(quantity),
                                    price: product.sale_price || product.price
                                }
                            ]}
                            onSuccess={handlePaymentSuccess}
                            onFailure={handlePaymentFailure}
                            onCancel={(data) => console.log('결제 취소:', data)}
                            disabled={!phoneVerified || paymentProcessing}
                            buttonText={paymentProcessing ? "처리 중..." : "결제하기"}
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md"
                        />
                    </div>

                    <p className="text-xs text-gray-500 mt-4 text-center">
                        주문하기 버튼을 클릭하면 구매조건에 동의하는 것으로 간주합니다.
                    </p>
                </div>
            </div>

            {/* 주문 버튼 (모바일) */}
            <div className="lg:hidden w-full">
                <Button
                    type="submit"
                    form="order-form"
                    className="w-full bg-blue-300 hover:bg-blue-700 hover:transition-colors duration-300 text-white"
                    disabled={!phoneVerified || paymentProcessing}
                >
                    {paymentProcessing ? "처리 중..." : "결제하기"}
                </Button>
            </div>
        </div>
    );
}