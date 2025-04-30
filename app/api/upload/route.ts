import { NextRequest, NextResponse } from 'next/server';
import crypto from "crypto";
import { AdminClient } from "@/utils/adminClient";
import { createClient } from "@/utils/server";
import { States } from "@/types";

export async function POST(request: NextRequest) {
    console.log("이미지 업로드 요청 받음");

    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        console.log("요청 액션:", action);

        if (action !== 'fileUpload') {
            console.error("잘못된 액션:", action);
            return NextResponse.json(
                { success: false, error: 'Invalid action' },
                { status: 400 }
            );
        }

        // 요청 형식 확인
        const contentType = request.headers.get('content-type') || '';
        if (!contentType.includes('multipart/form-data')) {
            console.error("잘못된 content-type:", contentType);
            return NextResponse.json(
                { success: false, error: 'Content type must be multipart/form-data' },
                { status: 400 }
            );
        }

        // 폼 데이터 파싱
        let formData;
        try {
            formData = await request.formData();
            console.log("폼 데이터 추출 성공");
        } catch (error) {
            console.error("폼 데이터 파싱 오류:", error);
            return NextResponse.json(
                { success: false, error: 'Failed to parse form data' },
                { status: 400 }
            );
        }

        const file = formData.get('files[0]') as File | null;

        if (!file) {
            console.error("파일 없음");
            return NextResponse.json(
                { success: false, error: 'No file uploaded' },
                { status: 400 }
            );
        }

        console.log("파일 정보:", file.name, file.type, file.size);

        if (!file.type.startsWith('image/')) {
            console.error("잘못된 파일 타입:", file.type);
            return NextResponse.json(
                { success: false, error: 'Only image files are allowed' },
                { status: 400 }
            );
        }

        try {
            console.log("이미지 업로드 시작");
            const result = await uploadImage(file);
            console.log("업로드 결과:", result);

            if (result.success) {
                return NextResponse.json({ success: true, data: result.data });
            } else {
                return NextResponse.json(
                    { success: false, error: result.error },
                    { status: 500 }
                );
            }
        } catch (error: any) {
            console.error("업로드 처리 오류:", error);
            return NextResponse.json(
                { success: false, error: error.message || 'Unknown error' },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error("전체 요청 처리 오류:", error);
        return NextResponse.json(
            { success: false, error: error.message || 'Server error' },
            { status: 500 }
        );
    }
}

async function uploadImage(file: File): Promise<States> {
    try {
        console.log("Supabase 클라이언트 생성");
        const supabase = AdminClient();
        const supabaseClient = await createClient();

        console.log("사용자 정보 확인");
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) {
            console.error("사용자 인증 실패");
            return { success: false, data: '', error: '사용자 인증 실패: 사용자 정보를 찾을 수 없습니다.' };
        }

        console.log("인증된 사용자:", user.id);

        // 파일명 생성 (고유성 보장)
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${crypto.randomUUID()}.${fileExt}`;
        console.log("생성된 파일명:", fileName);

        console.log("스토리지에 파일 업로드 시작");
        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, file);

        if (uploadError) {
            console.error("파일 업로드 오류:", uploadError);
            return { success: false, data: '', error: '이미지 업로드 실패: ' + uploadError.message };
        }

        console.log("업로드 성공, 공개 URL 가져오기");
        // 업로드된 이미지의 공개 URL 가져오기
        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(fileName);

        console.log("공개 URL:", publicUrl);
        return { success: true, data: publicUrl, error: '' };
    } catch (error: any) {
        console.error("이미지 업로드 함수 오류:", error);
        return { success: false, data: '', error: error.message || 'Unknown error' };
    }
}

// GET 요청 핸들러 추가 (상태 확인용)
export async function GET() {
    return NextResponse.json({ status: 'Image upload API is running' });
}