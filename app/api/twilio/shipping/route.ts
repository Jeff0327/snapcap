// app/api/twilio/shipping/route.ts - 고객에게 발송 완료 SMS

import { NextRequest, NextResponse } from 'next/server';

interface ShippingNotificationData {
    primary_product_name: string;
    items_count: number;
    total_amount: number;
    order_number?: string;
    // 고객 정보
    customer_name: string;
    customer_phone: string;
    // 배송 정보
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

// 🚚 발송 완료 알림 메시지 생성
function createShippingMessage(data: ShippingNotificationData): string {
    // 주소 정리 (상세주소가 있으면 합치기)
    const fullAddress = data.address_line2
        ? `${data.address_line1} ${data.address_line2}`
        : data.address_line1;

    return `상품이 발송되었습니다!

안녕하세요 ${data.customer_name}님,
주문하신 상품이 발송 처리되었습니다.

[주문정보]
상품: ${data.primary_product_name}${data.items_count > 1 ? ` 외 ${data.items_count - 1}건` : ''}
수량: ${data.total_quantity}개
주문번호: ${data.order_number || '-'}

[배송정보]
받는분: ${data.recipient_name}
연락처: ${data.phone_number}
주소: ${fullAddress}

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
        const data: ShippingNotificationData = await request.json();

        // 필수 필드 검증
        if (!data.primary_product_name || !data.customer_phone || !data.customer_name) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields: primary_product_name, customer_phone, customer_name'
                },
                { status: 400 }
            );
        }

        // 고객 휴대폰번호 (E.164 형식으로 변환)
        let customerPhone = data.customer_phone;
        if (customerPhone.startsWith('0')) {
            customerPhone = '+82' + customerPhone.substring(1);
        } else if (!customerPhone.startsWith('+82')) {
            customerPhone = '+82' + customerPhone;
        }

        // SMS 메시지 생성
        const message = createShippingMessage(data);

        // Twilio SMS 발송 (고객에게)
        const result = await sendTwilioSMS(customerPhone, message);

        return NextResponse.json({
            success: true,
            messageSid: result.sid,
            message: '발송 완료 알림이 고객에게 전송되었습니다.',
            sentTo: customerPhone
        });

    } catch (error: any) {
        console.error('❌ 발송 완료 SMS 알림 발송 실패:', error);

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

        const testData: ShippingNotificationData = {
            primary_product_name: '우주 비행사 프린트 모자',
            items_count: 1,
            total_amount: 25000,
            order_number: 'SHIP-TEST-' + Date.now().toString().slice(-6),
            // 고객 정보
            customer_name: '김고객',
            customer_phone: '010-1234-5678',
            // 배송 정보
            recipient_name: '김받는이',
            phone_number: '010-1234-5678',
            address_line1: '서울시 강남구 테헤란로 123',
            address_line2: '456호',
            total_quantity: 1
        };

        // 테스트는 내 번호로 발송
        const testPhone = process.env.MY_PHONE!;
        const message = createShippingMessage(testData);

        const result = await sendTwilioSMS(testPhone, message);

        return NextResponse.json({
            success: true,
            messageSid: result.sid,
            message: '테스트 발송 완료 SMS가 발송되었습니다.',
            testData,
            smsContent: message // 📝 SMS 내용도 응답에 포함
        });

    } catch (error: any) {
        console.error('❌ 테스트 발송 완료 SMS 발송 실패:', error);

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Internal server error'
            },
            { status: 500 }
        );
    }
}