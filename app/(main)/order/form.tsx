'use client';

import React, { useState } from 'react';
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
import {Button} from "@/components/ui/button";

interface OrderFormMultipleProps {
    cartItems: CartItem[];
    user: User | null;
}

export default function OrderFormMultiple({ cartItems, user }: OrderFormMultipleProps) {
    const router = useRouter();
    const { notify } = useAlert();
    const {
        address,
        detail,
        contact,
        setContact,
    } = useAddressStore();

    // 주문자 정보
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    // 배송지 정보
    const [recipientName, setRecipientName] = useState('');

    // 기타 상태
    const [sameAsOrderer, setSameAsOrderer] = useState(true);
    const [phoneVerified, setPhoneVerified] = useState(false);

    const fullAddress = detail ? `${address}, ${detail}` : address;

    // 주문자와 배송지 정보 동기화 처리
    const handleSameAsOrdererChange = (checked: boolean) => {
        setSameAsOrderer(checked);

        if (checked) {
            setRecipientName(name);
            setContact(phone);
        } else {
            setRecipientName('');
            setContact('');
        }
    };

    // 전화번호 인증 상태 업데이트
    const handlePhoneVerified = (verified: boolean) => {
        setPhoneVerified(verified);
    };

    const handleResult = (formState: FormState) => {
        if (formState.code === ERROR_CODES.SUCCESS) {
            router.push(`/order/payment?id=${formState.data}`);
        } else {
            notify.failure('처리 중 에러가 발생하였습니다.');
        }
    };

    return (
        <div className="container mx-auto flex lg:flex-row flex-col items-start w-full gap-4">
                <div className="space-y-8 w-full">
                    {/* 주문자 정보 */}
                    <Card className="bg-white p-6">
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
                                <PhoneVerifyForm
                                    onVerified={handlePhoneVerified}
                                    setPhone={(value) => {
                                        const val = typeof value === 'function' ? value('') : value;
                                        setPhone(val);
                                        if (sameAsOrderer) setContact(val);
                                    }}
                                    phone={phone}
                                />
                            </div>
                            <input type="hidden" name="email" value={user?.email || ''} />
                        </div>
                    </Card>

                    {/* 배송지 정보 */}
                    <FormContainer action={createOrder} onResult={handleResult}>
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
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    placeholder="'-' 없이 입력"
                                    required
                                />
                            </div>

                            <AddressSearch />
                        </div>
                    </div>
                        <Button type={'submit'} className={'w-full py-8 my-2 text-lg bg-blue-300 rounded-lg text-white'}>
                            배송지 입력
                        </Button>
                    </FormContainer>
                </div>
        </div>
    );
}
