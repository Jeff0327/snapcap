'use client';

import React, { useState, useEffect } from 'react';
import FormContainer, { FormState } from "@/components/ui/form";
import { ERROR_CODES } from "@/utils/ErrorMessage";
import useAlert from "@/lib/notiflix/useAlert";
import { sendVerificationCode, verifyPhoneCode } from "@/app/(main)/order/[id]/actions";

interface PhoneVerificationFormProps {
    onVerified?: (verified: boolean) => void;
    setPhone: React.Dispatch<React.SetStateAction<string>>;
    phone: string;
}

function PhoneVerifyForm({ onVerified, setPhone, phone }: PhoneVerificationFormProps) {
    const { notify } = useAlert();
    const [codeSent, setCodeSent] = useState(false);
    const [verified, setVerified] = useState(false);
    const [formattedPhone, setFormattedPhone] = useState('');
    const [verificationMessage, setVerificationMessage] = useState('');

    // 타이머 관련 상태
    const [timeLeft, setTimeLeft] = useState(180); // 3분 = 180초
    const [timerActive, setTimerActive] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);

    // 타이머 효과
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // 시간이 만료되면 OTP 재요청 필요
            setVerificationMessage('인증번호가 만료되었습니다. 새로운 인증번호를 요청해주세요.');
            setTimerActive(false);
            setCodeSent(false);
            setResendDisabled(false);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [timerActive, timeLeft]);

    // 타이머 포맷팅 함수
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // 인증번호 전송 결과 처리
    const handleSendResult = (formState: FormState) => {
        if(formState.code === ERROR_CODES.SUCCESS) {
            setCodeSent(true);
            // E.164 형식으로 변환된 전화번호 저장
            if (formState.data && typeof formState.data === 'object' && 'formattedPhone' in formState.data) {
                setFormattedPhone((formState.data as { formattedPhone: string }).formattedPhone);
            } else {
                // 서버에서 formattedPhone을 반환하지 않는 경우 기본 전화번호 사용
                setFormattedPhone(phone);
            }

            // 타이머 시작
            setTimeLeft(180); // 3분으로 초기화
            setTimerActive(true);
            setResendDisabled(true);

            // 30초 후에 재전송 버튼 활성화
            setTimeout(() => {
                setResendDisabled(false);
            }, 30000);

            setVerificationMessage('인증번호가 발송되었습니다. 3분 내로 인증해주세요.');
            notify.success(formState.message);
        } else {
            setVerificationMessage(formState.message);
            notify.failure(formState.message);
        }
    };

    // 인증번호 확인 결과 처리
    const handleVerifyResult = (formState: FormState) => {
        if(formState.code === ERROR_CODES.SUCCESS) {
            setVerified(true);
            setVerificationMessage('전화번호 인증이 완료되었습니다.');
            setTimerActive(false); // 타이머 중지
            notify.success(formState.message);
            if (onVerified) {
                onVerified(true);
            }
        } else {
            setVerificationMessage(formState.message);
            notify.failure(formState.message);
        }
    };

    // 전화번호 변경 시 인증 상태 초기화
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value);
        if (codeSent || verified) {
            setCodeSent(false);
            setVerified(false);
            setVerificationMessage('');
            setTimerActive(false); // 타이머 중지
        }
    };

    return (
        <div className="space-y-4">
            {/* 전화번호 입력 및 인증번호 전송 폼 */}
            <div>
                <FormContainer
                    action={sendVerificationCode}
                    onResult={handleSendResult}
                >
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            name="phone"
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder="연락처 (-없이 입력)"
                            disabled={verified}
                            required
                            className="appearance-none placeholder:text-sm rounded-md relative block w-full px-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        />
                        <button
                            type="submit"
                            disabled={verified || !phone || phone.length < 10 || (resendDisabled && codeSent)}
                            className="px-2 border border-transparent h-full py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed w-[36vw] md:w-[20vw] lg:w-[16vw]"
                        >
                            <span className={'font-jalnan text-xs md:text-md text-center w-full h-full flex justify-center items-center'}>
                                {verified ? "인증완료" : (codeSent && resendDisabled ? "재전송 대기중" : "인증번호 전송")}
                            </span>
                        </button>
                    </div>
                </FormContainer>
            </div>

            {/* 인증번호 입력 및 확인 폼 */}
            {codeSent && !verified && (
                <div>
                    <FormContainer
                        action={verifyPhoneCode}
                        onResult={handleVerifyResult}
                    >
                        {/* 서버에서 E.164 형식으로 변환된 전화번호 사용 */}
                        <input type="hidden" name="phone" value={formattedPhone || phone} />
                        <div className="flex space-x-2 relative">
                            <input
                                type="text"
                                name="otp"
                                placeholder="6자리 인증번호 입력"
                                maxLength={6}
                                required
                                className="appearance-none rounded-md relative block w-full px-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                            />
                            {/* 타이머 표시 */}
                            {timerActive && (
                                <div className="absolute right-36 top-1/2 transform -translate-y-1/2 pr-3 text-sm font-medium text-blue-500">
                                    {formatTime(timeLeft)}
                                </div>
                            )}
                            <button
                                type="submit"
                                className="px-2 py-2 text-center border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-[36vw] md:w-[20vw] lg:w-[16vw]"
                            >
                                <span className={'font-jalnan text-xs md:text-md text-center w-full h-full flex justify-center items-center'}>확인</span>
                            </button>
                        </div>
                    </FormContainer>
                </div>
            )}

            {/* 인증 상태 메시지 */}
            {verificationMessage && (
                <p className={`text-sm ${verified ? 'text-green-600' : 'text-red-500'}`}>
                    {verificationMessage}
                </p>
            )}
        </div>
    );
}

export default PhoneVerifyForm;