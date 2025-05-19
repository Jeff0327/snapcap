'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { CartItem } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import PhoneVerifyForm from "@/components/order/verifyCheck/PhoneVerifyForm";
import AddressSearch from "@/lib/address/AddressSearch";
import useAlert from '@/lib/notiflix/useAlert';
import FormContainer, { FormState } from "@/components/ui/form";
import { ERROR_CODES } from "@/utils/ErrorMessage";
import { createOrder } from "@/app/(main)/order/actions";
import { Card } from "@/components/ui/card";
import useAddressStore from "@/lib/store/useAddressStore";
import { Button } from "@/components/ui/button";
import usePhoneVerify from "@/lib/store/usePhoneVerifyStore";
import Image from "next/image";
import { formatPrice, getOrderName, getTotalPrice, getTotalQuantity } from "@/utils/utils";

interface OrderFormMultipleProps {
    cartItems: CartItem[];
    user: User | null;
}

export default function OrderFormMultiple({ cartItems, user }: OrderFormMultipleProps) {
    const router = useRouter();
    const { notify } = useAlert();
    const {
        address,
        contact,
        setContact,
    } = useAddressStore();

    const {
        phone, verified,
        setVerified
    } = usePhoneVerify();

    const [name, setName] = useState("");
    // 배송지 정보
    const [recipientName, setRecipientName] = useState('');
    // 기타 상태
    const [sameAsOrderer, setSameAsOrderer] = useState(true);

    // 무한 루프 방지를 위한 참조 값
    const isUpdatingField = useRef(false);

    // 필드 변경 시 체크박스 상태에 따라 처리
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setName(newValue);

        // 동기화 상태일 때만 수령인 이름도 업데이트
        if (sameAsOrderer && !isUpdatingField.current) {
            isUpdatingField.current = true;
            setRecipientName(newValue);
            setTimeout(() => {
                isUpdatingField.current = false;
            }, 0);
        }
    };

    // 전화번호 인증 상태 변경 처리
    const handlePhoneVerified = (verifiedStatus: boolean) => {
        setVerified(verifiedStatus);

        // 인증 완료되고 동기화 상태일 때만 수령인 연락처 업데이트
        if (verifiedStatus && sameAsOrderer && !isUpdatingField.current) {
            isUpdatingField.current = true;
            setContact(phone);
            setTimeout(() => {
                isUpdatingField.current = false;
            }, 0);
        }
    };

    // 체크박스 상태 변경 처리
    const handleSameAsOrdererChange = (checked: boolean) => {
        if (isUpdatingField.current) return;

        isUpdatingField.current = true;
        setSameAsOrderer(checked);

        if (checked) {
            // 체크 시 주문자 정보로 배송지 정보 설정
            setRecipientName(name);
            setContact(phone);
        }

        setTimeout(() => {
            isUpdatingField.current = false;
        }, 0);
    };

    // 결과 처리
    const handleResult = (formState: FormState) => {
        if (formState.code === ERROR_CODES.SUCCESS) {
            router.push(`/order/payment/${formState.data}`);
        } else {
            notify.failure(`${formState.message}`);
        }
    };

    // 폼 제출 전 유효성 검증
    const handleBeforeSubmit = () => {
        if (!name.trim()) {
            notify.failure('주문자 이름을 입력해주세요.');
            return false;
        }

        if (!phone || !verified) {
            notify.failure('휴대폰 인증이 필요합니다.');
            return false;
        }

        if (!recipientName.trim()) {
            notify.failure('수령인 이름을 입력해주세요.');
            return false;
        }

        if (!contact.trim()) {
            notify.failure('수령인 연락처를 입력해주세요.');
            return false;
        }

        if (!address) {
            notify.failure('배송지 주소를 입력해주세요.');
            return false;
        }

        return true;
    };

    // 버튼 비활성화 상태 계산
    const isSubmitDisabled = !contact || !recipientName || !phone || !verified || !address || !name;

    return (
        <div className="container mx-auto flex lg:flex-row flex-col items-start w-full gap-4 lg:max-w-3xl">
            <div className="space-y-8 w-full">
                {/* 주문자 정보 */}
                <Card className="bg-white p-6">
                    <h2 className="text-lg font-jalnan mb-4 pb-2 border-b">주문자 정보</h2>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">이름</Label>
                            <Input
                                id="name"
                                name="name"
                                value={name}
                                onChange={handleNameChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">연락처</Label>
                            <PhoneVerifyForm
                                onVerified={handlePhoneVerified}
                            />
                        </div>
                    </div>
                </Card>

                {/* 배송지 정보 */}
                <FormContainer
                    action={createOrder}
                    onResult={handleResult}
                    onBeforeSubmit={handleBeforeSubmit}
                >
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b">
                            <h2 className="text-lg font-jalnan">배송지 정보</h2>
                            <div className="flex items-center gap-2 text-center">
                                <Label htmlFor="sameAsOrderer" className="cursor-pointer mb-0">주문자 정보와 동일</Label>
                                {/* 체크박스 사용 시 checked 속성과 onCheckedChange만 사용 */}
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
                                <Label htmlFor="phoneNumber">연락처</Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    placeholder="'-' 없이 입력"
                                    required
                                />
                            </div>

                            <AddressSearch />
                        </div>
                    </div>

                    {/* 숨겨진 필드로 필요한 정보 전달 */}
                    <input type="hidden" name="totalAmount" value={getTotalPrice(cartItems).toString()} />
                    <input type="hidden" name="email" value={user?.email || ''} />
                    <input type="hidden" name="ordererPhone" value={phone} />
                    <input type="hidden" name="ordererName" value={name} />
                    {/* 사용자 ID도 함께 전달 */}
                    <input type="hidden" name="userId" value={user?.id || ''} />

                    <Button
                        type="submit"
                        className={`font-jalnan w-full py-6 mt-4 text-lg rounded-lg text-white ${
                            isSubmitDisabled
                                ? 'bg-blue-300 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                        disabled={isSubmitDisabled}
                    >
                        배송지 입력
                    </Button>
                </FormContainer>

                {/* 주문 요약 */}
                <Card className="w-full bg-white p-6 rounded-lg top-6">
                    <h2 className="text-lg font-bold mb-4 pb-2 border-b">주문 요약</h2>
                    <div className="mb-4">
                        <div className="flex space-x-4 mb-4">
                            {cartItems.length > 0 && cartItems[0].product && cartItems[0].product.images && cartItems[0].product.images[0] && (
                                <div className="w-20 h-20 flex-shrink-0">
                                    <Image
                                        src={cartItems[0].product.images[0]}
                                        alt={cartItems[0].product.name || '상품 이미지'}
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover rounded"
                                    />
                                </div>
                            )}
                            <div>
                                <h3 className="font-medium">{getOrderName(cartItems)}</h3>
                                <p className="text-sm text-gray-600">수량: {getTotalQuantity(cartItems)}개</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            {cartItems.map((item, index) => (
                                <div key={item.id || index} className="flex justify-between text-sm">
                                    <span className="text-gray-600 truncate max-w-[60%]">
                                        {item.product?.name} {item.color && `(${item.color})`} x {item.quantity}
                                    </span>
                                    <span>
                                        {item.product?.sale_price ? (
                                            <span className="text-red-500">
                                                {formatPrice(item.product.sale_price * item.quantity)}
                                            </span>
                                        ) : (
                                            formatPrice((item.product?.price || 0) * item.quantity)
                                        )}
                                    </span>
                                </div>
                            ))}

                            <div className="flex justify-between pt-2 border-t">
                                <span className="text-gray-600">배송비</span>
                                <span>무료</span>
                            </div>
                        </div>

                        <div className="pt-3 border-t">
                            <div className="flex justify-between text-lg font-bold">
                                <span>총 결제금액</span>
                                <span>{formatPrice(getTotalPrice(cartItems))}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}