import {create} from "zustand/index";

interface PhoneVerifyState {
    phone: string;
    verified: boolean;
    codeSent: boolean;
    verificationMessage: string;
    timeLeft: number;
    resendDisabled: boolean;
    otp: string;

    setPhone: (phone: string) => void;
    setVerified: (verified: boolean) => void;
    setCodeSent: (codeSent: boolean) => void;
    setVerificationMessage: (message: string) => void;
    setTimeLeft: (timeLeft: number) => void;
    decrementTimeLeft: () => void;
    setResendDisabled: (disabled: boolean) => void;
    setOtp: (otp: string) => void;
    resetState: () => void;
}

const usePhoneVerify = create<PhoneVerifyState>((set) => ({
    phone: '',
    verified: false,
    codeSent: false,
    verificationMessage: '',
    timeLeft: 0,
    resendDisabled: false,
    otp: '',

    setPhone: (phone) => set({ phone }),
    setVerified: (verified) => set({ verified }),
    setCodeSent: (codeSent) => set({ codeSent }),
    setVerificationMessage: (verificationMessage) => set({ verificationMessage }),
    setTimeLeft: (timeLeft) => set({ timeLeft }),
    decrementTimeLeft: () => set((state) => ({ timeLeft: Math.max(0, state.timeLeft - 1) })),
    setResendDisabled: (resendDisabled) => set({ resendDisabled }),
    setOtp: (otp) => set({ otp }),
    resetState: () => set({
        verified: false,
        codeSent: false,
        verificationMessage: '',
        timeLeft: 0,
        resendDisabled: false,
        otp: ''
    })
}));

export default usePhoneVerify;