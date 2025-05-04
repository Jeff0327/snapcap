'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import FormContainer, { FormState } from '@/components/ui/form';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { ERROR_CODES } from '@/utils/ErrorMessage';
import { ProductsJson } from "@/types";
import { submitOrder } from "@/app/(main)/order/[id]/actions";

// 부트페이 API 타입 정의
declare global {
    interface Window {
        BootPay: any;
    }
}

// 주문 폼 컴포넌트 (클라이언트)
export default function OrderForm({ product }: { product: ProductsJson }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const quantity = searchParams.get('quantity') || '1';
    const color = searchParams.get('color') || null;

    // 네이버 주소 검색 API 로드 상태
    const [naverMapLoaded, setNaverMapLoaded] = React.useState(false);
    // 폼 요소 상태
    const [addressData, setAddressData] = React.useState({
        postalCode: '',
        address1: '',
    });
    const [sameAsOrderer, setSameAsOrderer] = React.useState(true);
    const [phoneVerified, setPhoneVerified] = React.useState(false);
    const [paymentProcessing, setPaymentProcessing] = React.useState(false);

    // 네이버 주소 검색 API 스크립트 로드 완료 처리
    const handleScriptLoad = () => {
        setNaverMapLoaded(true);
    };

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

    // 네이버 주소 검색 API 호출
    const openNaverAddressSearch = () => {
        if (!naverMapLoaded || !window.naver || !window.naver.maps || !window.naver.maps.Service) {
            alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        new window.naver.maps.Service.Geocode({
            query: '주소 검색',
            autoClose: true,
            animation: true,
            width: 500,
            height: 600,
            autoMapping: true,
            hCode: true,
            onComplete: function(data) {
                // 선택한 주소 정보
                if (data.v2.address) {
                    const address = data.v2.address;
                    setAddressData({
                        postalCode: address.zipcode || '',
                        address1: address.roadAddress || address.jibunAddress || '',
                    });
                }
            }
        }).open();
    };

    // 전화번호 인증 처리
    const sendVerificationCode = () => {
        const phoneInput = document.querySelector('input[name="phone"]');
        const phone = phoneInput ? (phoneInput as HTMLInputElement).value : '';

        if (!phone || phone.length < 10) {
            alert('유효한 휴대폰 번호를 입력해주세요.');
            return;
        }

        // 실제 구현 시 SMS 발송 API 연동
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // 테스트를 위해 인증 코드 보여주기
        alert(`인증코드가 발송되었습니다. (테스트를 위한 코드: ${code})`);

        // 확인 버튼 클릭 시 인증 완료 처리
        const verifyCodeInput = prompt("인증코드를 입력해주세요:");
        if (verifyCodeInput === code) {
            setPhoneVerified(true);
            alert('전화번호 인증이 완료되었습니다.');
        } else {
            alert('인증코드가 일치하지 않습니다.');
        }
    };

    // 주문자와 배송지 정보 동기화 처리
    const handleSameAsOrdererChange = (checked: boolean) => {
        setSameAsOrderer(checked);

        if (checked) {
            // 주문자 정보 가져오기
            const nameInput = document.querySelector('input[name="name"]');
            const phoneInput = document.querySelector('input[name="phone"]');

            // 배송지 정보 필드 설정
            const recipientNameInput = document.querySelector('input[name="recipientName"]');
            const recipientPhoneInput = document.querySelector('input[name="recipientPhone"]');

            if (nameInput && recipientNameInput) {
                (recipientNameInput as HTMLInputElement).value = (nameInput as HTMLInputElement).value;
            }

            if (phoneInput && recipientPhoneInput) {
                (recipientPhoneInput as HTMLInputElement).value = (phoneInput as HTMLInputElement).value;
            }
        }
    };

    // 부트페이 결제 처리
    const handleBootpayPayment = async (formData: FormData) => {
        if (!phoneVerified) {
            alert('휴대폰 인증이 필요합니다.');
            return false;
        }

        if (!addressData.postalCode || !addressData.address1) {
            alert('배송지 주소를 입력해주세요.');
            return false;
        }

        setPaymentProcessing(true);

        try {
            // 주문 정보 수집
            const name = formData.get('name') as string;
            const phone = formData.get('phone') as string;
            const email = formData.get('email') as string || '';
            const recipientName = formData.get('recipientName') as string;
            const recipientPhone = formData.get('recipientPhone') as string;
            const address2 = formData.get('address2') as string || '';
            const paymentMethod = formData.get('paymentMethod') as string || 'card';

            // 결제 고유 번호 생성 (실제로는 서버에서 안전하게 생성)
            const orderId = 'ORDER_' + new Date().getTime();

            // 주소 정보
            const address = `[${addressData.postalCode}] ${addressData.address1} ${address2}`;

            // 부트페이 결제 정보
            const bootpayPayload = {
                application_id: 'YOUR_BOOTPAY_APPLICATION_ID', // 실제 애플리케이션 ID로 교체
                price: getTotalPrice(),
                order_name: product.name + (color ? ` (${color})` : ''),
                order_id: orderId,
                pg: 'inicis', // 사용할 PG사 (inicis, kcp, toss 등)
                method: paymentMethod, // 결제 수단 (card, phone, bank, vbank 등)
                show_agree_window: 0,
                items: [
                    {
                        item_name: product.name,
                        qty: parseInt(quantity),
                        unique: product.id,
                        price: product.sale_price || product.price,
                        cat1: '상품'
                    }
                ],
                user_info: {
                    username: name,
                    email: email,
                    addr: address,
                    phone: phone
                },
                extra: {
                    vbank_result: 1, // 가상계좌 결과창 사용
                    quota: '0,2,3' // 할부 개월 수 옵션
                }
            };

            // 부트페이 결제창 열기
            window.BootPay.request(bootpayPayload)
                .done(function(data) {
                    // 결제 완료 시
                    console.log('결제 완료', data);

                    // 폼 데이터에 결제 정보 추가
                    formData.append('receiptId', data.receipt_id);
                    formData.append('orderId', orderId);
                    formData.append('paymentMethod', paymentMethod);
                    formData.append('address', address);

                    // 서버로 주문 정보 전송
                    submitOrder(formData).then((response) => {
                        if (response.code === ERROR_CODES.SUCCESS) {
                            router.push(`/order/complete?order_number=${response.data?.order_number}`);
                        } else {
                            alert(response.message || '주문 처리 중 오류가 발생했습니다.');
                            setPaymentProcessing(false);
                        }
                    });
                })
                .error(function(data) {
                    // 결제 오류 시
                    console.log('결제 오류', data);
                    alert('결제 처리 중 오류가 발생했습니다.');
                    setPaymentProcessing(false);
                })
                .cancel(function(data) {
                    // 결제 취소 시
                    console.log('결제 취소', data);
                    alert('결제가 취소되었습니다.');
                    setPaymentProcessing(false);
                });

            return false; // 폼 기본 제출을 방지
        } catch (error) {
            console.error('결제 처리 오류:', error);
            alert('결제 처리 중 오류가 발생했습니다.');
            setPaymentProcessing(false);
            return false;
        }
    };

    return (
        <>
            {/* 네이버 지도 API 스크립트 로드 */}
            <Script
                src="https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=YOUR_NCP_CLIENT_ID&submodules=geocoder"
                strategy="afterInteractive"
                onLoad={handleScriptLoad}
            />

            {/* 부트페이 스크립트 로드 */}
            <Script
                src="https://cdn.bootpay.co.kr/js/bootpay-3.3.6.min.js"
                strategy="afterInteractive"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 주문 정보 입력 */}
                <div className="lg:col-span-2">
                    <FormContainer action={handleBootpayPayment} onResult={() => {}}>
                        {/* 제품 ID 및 주문 정보 */}
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="quantity" value={quantity} />
                        {color && <input type="hidden" name="color" value={color} />}
                        <input type="hidden" name="totalPrice" value={getTotalPrice()} />

                        {/* 주문자 정보 */}
                        <div className="bg-white p-6 rounded-lg shadow mb-6">
                            <h2 className="text-lg font-bold mb-4 pb-2 border-b">주문자 정보</h2>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">이름 *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        className="mt-1"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="phone">휴대폰 번호 *</Label>
                                    <div className="flex space-x-2">
                                        <Input
                                            id="phone"
                                            name="phone"
                                            className="mt-1"
                                            placeholder="'-' 없이 입력 (예: 01012345678)"
                                            required
                                            disabled={phoneVerified}
                                        />
                                        {!phoneVerified && (
                                            <Button
                                                type="button"
                                                onClick={sendVerificationCode}
                                                className="mt-1"
                                            >
                                                인증코드 발송
                                            </Button>
                                        )}
                                    </div>
                                    <input type="hidden" name="phoneVerified" value={phoneVerified ? 'true' : 'false'} />

                                    {phoneVerified && (
                                        <div className="bg-green-50 p-2 rounded text-green-600 mt-2">
                                            휴대폰 번호가 인증되었습니다.
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="email">이메일</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        className="mt-1"
                                        placeholder="example@email.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 배송지 정보 */}
                        <div className="bg-white p-6 rounded-lg shadow mb-6">
                            <h2 className="text-lg font-bold mb-4 pb-2 border-b">배송지 정보</h2>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center space-x-2 mb-4">
                                        <Switch
                                            id="sameAsOrderer"
                                            checked={sameAsOrderer}
                                            onCheckedChange={handleSameAsOrdererChange}
                                        />
                                        <Label htmlFor="sameAsOrderer">주문자 정보와 동일</Label>
                                    </div>
                                    <input type="hidden" name="sameAsOrderer" value={sameAsOrderer ? 'true' : 'false'} />
                                </div>

                                <div>
                                    <Label htmlFor="recipientName">수령인 *</Label>
                                    <Input
                                        id="recipientName"
                                        name="recipientName"
                                        className="mt-1"
                                        required
                                        disabled={sameAsOrderer}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="recipientPhone">연락처 *</Label>
                                    <Input
                                        id="recipientPhone"
                                        name="recipientPhone"
                                        className="mt-1"
                                        placeholder="'-' 없이 입력 (예: 01012345678)"
                                        required
                                        disabled={sameAsOrderer}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="postalCode">우편번호 *</Label>
                                    <div className="flex space-x-2">
                                        <Input
                                            id="postalCode"
                                            name="postalCode"
                                            value={addressData.postalCode}
                                            className="mt-1"
                                            readOnly
                                            required
                                        />
                                        <Button
                                            type="button"
                                            onClick={openNaverAddressSearch}
                                            className="mt-1"
                                        >
                                            주소 검색
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="address1">주소 *</Label>
                                    <Input
                                        id="address1"
                                        name="address1"
                                        value={addressData.address1}
                                        className="mt-1"
                                        readOnly
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="address2">상세주소</Label>
                                    <Input
                                        id="address2"
                                        name="address2"
                                        className="mt-1"
                                        placeholder="아파트, 동, 호수 등 상세주소 입력"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 결제 방법 */}
                        <div className="bg-white p-6 rounded-lg shadow mb-6">
                            <h2 className="text-lg font-bold mb-4 pb-2 border-b">결제 정보</h2>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="paymentMethod">결제 방법 *</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                                        <div className="border rounded-md p-3 flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="card"
                                                name="paymentMethod"
                                                value="card"
                                                defaultChecked
                                            />
                                            <label htmlFor="card">신용카드</label>
                                        </div>

                                        <div className="border rounded-md p-3 flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="vbank"
                                                name="paymentMethod"
                                                value="vbank"
                                            />
                                            <label htmlFor="vbank">가상계좌</label>
                                        </div>

                                        <div className="border rounded-md p-3 flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="bank"
                                                name="paymentMethod"
                                                value="bank"
                                            />
                                            <label htmlFor="bank">계좌이체</label>
                                        </div>

                                        <div className="border rounded-md p-3 flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="phone"
                                                name="paymentMethod"
                                                value="phone"
                                            />
                                            <label htmlFor="phone">휴대폰결제</label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="orderNotes">배송 요청사항</Label>
                                    <Textarea
                                        id="orderNotes"
                                        name="orderNotes"
                                        className="mt-1"
                                        placeholder="배송 시 요청사항을 입력해주세요"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 주문 버튼 (모바일) */}
                        <div className="mb-6 lg:hidden">
                            <SubmitButton
                                text={paymentProcessing ? "처리 중..." : "결제하기"}
                                className="w-full"
                            />
                        </div>
                    </FormContainer>
                </div>

                {/* 주문 요약 */}
                <div className="lg:col-span-1">
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
                                                <span className="text-red-500 font-medium">{formatPrice(product.sale_price)}</span>
                                                <span className="text-gray-400 text-sm line-through ml-1">{formatPrice(product.price)}</span>
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
                            <Button
                                type="submit"
                                form="order-form"
                                className="w-full"
                                disabled={!phoneVerified || paymentProcessing}
                                onClick={() => {
                                    document.querySelector('form')?.requestSubmit();
                                }}
                            >
                                {paymentProcessing ? "처리 중..." : "결제하기"}
                            </Button>
                        </div>

                        <p className="text-xs text-gray-500 mt-4 text-center">
                            주문하기 버튼을 클릭하면 구매조건에 동의하는 것으로 간주합니다.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}