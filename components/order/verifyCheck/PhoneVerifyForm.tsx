'use client';

import React, { useState, useEffect } from 'react';
import { ERROR_CODES } from '@/utils/ErrorMessage';
import useAlert from '@/lib/notiflix/useAlert';
import { sendVerificationCode, verifyPhoneCode } from '@/app/(main)/order/[id]/actions';

interface PhoneVerificationFormProps {
    onVerified?: (verified: boolean) => void;
    setPhone: React.Dispatch<React.SetStateAction<string>>;
    phone: string;
}

function PhoneVerifyForm({ onVerified, setPhone, phone }: PhoneVerificationFormProps) {
    const { notify } = useAlert();

    const [codeSent, setCodeSent] = useState(false);
    const [verified, setVerified] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [otp, setOtp] = useState('');

    useEffect(() => {
        if (!codeSent || verified || timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [codeSent, verified, timeLeft]);

    const formatTime = (seconds: number) =>
        `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value);
        if (codeSent || verified) {
            setCodeSent(false);
            setVerified(false);
            setVerificationMessage('');
            setTimeLeft(0);
        }
    };

    const handleSendCode = async () => {
        const result = await sendVerificationCode(phone);
        if (result.code === ERROR_CODES.SUCCESS) {
            setCodeSent(true);
            setTimeLeft(180);
            setResendDisabled(true);
            notify.success(result.message);
            setVerificationMessage('인증번호가 발송되었습니다. 3분 내로 인증해주세요.');
            setTimeout(() => setResendDisabled(false), 30000);
        } else {
            notify.failure(result.message);
            setVerificationMessage(result.message);
        }
    };

    const handleVerifyCode = async () => {
        const result = await verifyPhoneCode(phone, otp);
        if (result.code === ERROR_CODES.SUCCESS) {
            setVerified(true);
            setTimeLeft(0);
            setVerificationMessage('전화번호 인증이 완료되었습니다.');
            notify.success(result.message);
            onVerified?.(true);
        } else {
            notify.failure(result.message);
            setVerificationMessage(result.message);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="연락처 (-없이 입력)"
                    disabled={verified}
                    required
                    className="w-full px-3 py-2 border rounded-md text-sm"
                />
                <button
                    onClick={handleSendCode}
                    disabled={verified || !phone || phone.length < 10 || (resendDisabled && codeSent)}
                    className="w-[36vw] md:w-[20vw] lg:w-[16vw] px-2 py-2 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                >
                    <span className="font-jalnan text-xs md:text-md">
                        {verified ? '인증완료' : (codeSent && resendDisabled ? '재전송 대기중' : '인증번호 전송')}
                    </span>
                </button>
            </div>

            {codeSent && !verified && (
                <div className="flex space-x-2 relative">
                    <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="6자리 인증번호 입력"
                        className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                    {timeLeft > 0 && (
                        <div className="flex justify-center items-center w-20 text-sm text-blue-500">
                            {formatTime(timeLeft)}
                        </div>
                    )}
                    <button
                        type={'button'}
                        onClick={handleVerifyCode}
                        className="w-[36vw] md:w-[20vw] lg:w-[16vw] px-2 py-2 text-sm rounded-md text-white bg-black hover:bg-blue-700"
                    >
                        <span className="font-jalnan text-xs md:text-md">확인</span>
                    </button>
                </div>
            )}

            {verificationMessage && (
                <p className={`text-sm ${verified ? 'text-green-600' : 'text-red-500'}`}>
                    {verificationMessage}
                </p>
            )}
        </div>
    );
}

export default PhoneVerifyForm;
