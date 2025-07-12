// app/api/twilio/route.ts - 주소 정보 포함된 SMS 메시지

import { NextRequest, NextResponse } from 'next/server';

interface PaymentNotificationData {
    primary_product_name: string;
    items_count: number;
    payment_method: string;
    total_amount: number;
    payment_status: string;
    order_number?: string;
    // 🎯 새로 추가된 배송 정보
    recipient_name: string;
    phone_number: string;
    address_line1: string;
    address_line2?: string;
    total_quantity: number;
}

// Twilio SMS 발송 함수
async function sendTwilioSMS(to: string, message: string) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER!;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const body = new URLSearchParams({
        'To': to,
        'From': fromPhone,
        'Body': message
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Twilio API Error: ${response.status} - ${errorText}`);
    }

    return await response.json();
}

// 🎯 향상된 결제 알림 메시지 (주소 및 수량 포함)
function createPaymentMessage(data: PaymentNotificationData): string {
    // 주소 정리 (상세주소가 있으면 합치기)
    const fullAddress = data.address_line2
        ? `${data.address_line1} ${data.address_line2}`
        : data.address_line1;

    return `주문 결제 완료!

상품: ${data.primary_product_name}${data.items_count > 1 ? ` 외 ${data.items_count - 1}건` : ''}
수량: ${data.total_quantity}개
결제수단: ${data.payment_method}
금액: ${data.total_amount.toLocaleString()}원
주문번호: ${data.order_number || '-'}

배송정보:
받는분:${data.recipient_name}
연락처:${data.phone_number}
주소:${fullAddress}

SNAPCAP`;
}

// API 보안 검증
function validateApiKey(request: NextRequest): boolean {
    const apiKey = request.headers.get('x-api-key');
    const expectedApiKey = process.env.API_SECRET!;
    return apiKey === expectedApiKey;
}

export async function POST(request: NextRequest) {
    try {
        // API 키 검증
        if (!validateApiKey(request)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 요청 본문 파싱
        const data: PaymentNotificationData = await request.json();

        // 필수 필드 검증
        if (!data.primary_product_name || !data.payment_method || !data.total_amount) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields: primary_product_name, payment_method, total_amount'
                },
                { status: 400 }
            );
        }

        console.log('📱 결제 알림 SMS 요청 수신 (주소포함):', data);

        // 내 휴대폰번호
        const myPhone = process.env.MY_PHONE!;

        // SMS 메시지 생성
        const message = createPaymentMessage(data);

        console.log('📝 발송할 SMS 내용:');
        console.log(message);

        // Twilio SMS 발송
        const result = await sendTwilioSMS(myPhone, message);

        console.log('✅ SMS 발송 성공:', result.sid);

        return NextResponse.json({
            success: true,
            messageSid: result.sid,
            message: '결제 알림이 발송되었습니다.'
        });

    } catch (error: any) {
        console.error('❌ SMS 알림 발송 실패:', error);

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Internal server error'
            },
            { status: 500 }
        );
    }
}

// GET 요청으로 테스트 SMS 발송
export async function GET(request: NextRequest) {
    try {
        // API 키 검증
        if (!validateApiKey(request)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const testData: PaymentNotificationData = {
            primary_product_name: '테스트 상품',
            items_count: 2,
            payment_method: '테스트 결제',
            total_amount: 50000,
            payment_status: 'paid',
            order_number: 'TEST-' + Date.now().toString().slice(-8),
            // 🎯 테스트용 배송 정보
            recipient_name: '홍길동',
            phone_number: '010-1234-5678',
            address_line1: '서울시 강남구 테헤란로 123',
            address_line2: '456호',
            total_quantity: 3
        };

        console.log('🧪 테스트 SMS 발송 시작 (주소포함)');

        const myPhone = process.env.MY_PHONE!;
        const message = createPaymentMessage(testData);

        console.log('📝 테스트 SMS 내용:');
        console.log(message);

        const result = await sendTwilioSMS(myPhone, message);

        console.log('✅ 테스트 SMS 발송 성공:', result.sid);

        return NextResponse.json({
            success: true,
            messageSid: result.sid,
            message: '테스트 SMS가 발송되었습니다.',
            testData,
            smsContent: message // 📝 SMS 내용도 응답에 포함
        });

    } catch (error: any) {
        console.error('❌ 테스트 SMS 발송 실패:', error);

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Internal server error'
            },
            { status: 500 }
        );
    }
}