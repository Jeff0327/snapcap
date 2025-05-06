// lib/payment/bootpay.d.ts
import '@bootpay/client-js';

declare module '@bootpay/client-js' {
    interface BootpayInterface {
        setConfirmMethod(callback: (data: any) => Promise<boolean>): void;
    }
}