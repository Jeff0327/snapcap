'use client';

import React, { useEffect, useRef } from 'react';
import { ERROR_CODES } from '@/utils/ErrorMessage';
import useAlert from '@/lib/notiflix/useAlert';
import usePhoneVerify from "@/lib/store/usePhoneVerifyStore";
import { sendVerificationCodeServer, verifyPhoneCodeServer } from "@/app/(main)/order/actions";

interface PhoneVerificationFormProps {
    onVerified?: (verified: boolean) => void;
}

function PhoneVerifyForm({ onVerified }: PhoneVerificationFormProps) {
    const { notify } = useAlert();
    const {
        phone, verified, codeSent, verificationMessage,
        timeLeft, resendDisabled, otp,
        setPhone, setVerified, setCodeSent, setVerificationMessage,
        setTimeLeft, decrementTimeLeft, setResendDisabled, setOtp, resetState
    } = usePhoneVerify();

    // 무한 루프 방지를 위한 참조
    const isNotifying = useRef(false);
    const initialMount = useRef(true);

    // 타이머 관리
    useEffect(() => {
        if (!codeSent || verified || timeLeft <= 0) return;

        const interval = setInterval(() => {
            decrementTimeLeft();
        }, 1000);

        return () => clearInterval(interval);
    }, [codeSent, verified, timeLeft, decrementTimeLeft]);

    // 인증 상태가 변경될 때만 실행
    useEffect(() => {
        // 초기 마운트 시에는 실행하지 않음
        if (initialMount.current) {
            initialMount.current = false;

            // 이미 인증된 상태라면 부모에게 알림
            if (verified && onVerified && !isNotifying.current) {
                isNotifying.current = true;
                onVerified(true);
                setTimeout(() => {
                    isNotifying.current = false;
                }, 0);
            }
            return;
        }

        // verified 상태가 변경되었을 때만 알림
        if (onVerified && !isNotifying.current) {
            isNotifying.current = true;
            onVerified(verified);
            setTimeout(() => {
                isNotifying.current = false;
            }, 0);
        }
    }, [verified, onVerified]);

    const formatTime = (seconds: number) =>
        `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value);
        if (codeSent || verified) {
            resetState();
            // 상태 리셋 시 직접 onVerified를 호출하지 않음
            // 상태가 변경되면 useEffect에서 자동으로 처리됨
        }
    };

    const handleSendCode = async (e: React.MouseEvent) => {
        // 폼 제출 방지
        e.preventDefault();

        // 로딩 상태 표시
        setVerificationMessage('인증번호 발송 중...');

        try {
            // 서버 측 함수 호출
            const result = await sendVerificationCodeServer(phone);

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
        } catch (error) {
            console.error('인증번호 발송 오류:', error);
            notify.failure('인증번호 발송 중 오류가 발생했습니다.');
            setVerificationMessage('인증번호 발송 중 오류가 발생했습니다.');
        }
    };

    const handleVerifyCode = async (e: React.MouseEvent) => {
        // 폼 제출 방지
        e.preventDefault();

        // 로딩 상태 표시
        setVerificationMessage('인증번호 확인 중...');

        try {
            // 서버 측 인증 함수 호출
            const result = await verifyPhoneCodeServer(phone, otp);

            if (result.code === ERROR_CODES.SUCCESS) {
                setVerified(true);
                setTimeLeft(0);
                setVerificationMessage('전화번호 인증이 완료되었습니다.');
                notify.success(result.message);

                // onVerified는 useEffect에서 자동으로 호출됨
            } else {
                notify.failure(result.message);
                setVerificationMessage(result.message);
            }
        } catch (error) {
            console.error('인증번호 확인 오류:', error);
            notify.failure('인증번호 확인 중 오류가 발생했습니다.');
            setVerificationMessage('인증번호 확인 중 오류가 발생했습니다.');
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
                    type="button"
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
                        type="button"
                        onClick={(e) => handleVerifyCode(e)}
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