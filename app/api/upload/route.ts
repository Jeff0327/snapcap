import { NextRequest, NextResponse } from 'next/server';
import crypto from "crypto";
import { AdminClient } from "@/utils/adminClient";
import { createClient } from "@/utils/server";
import {FormState} from "@/components/ui/form";
import {ERROR_CODES} from "@/utils/ErrorMessage";

export async function POST(request: NextRequest) {

    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

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

        if (!file.type.startsWith('image/')) {
            console.error("잘못된 파일 타입:", file.type);
            return NextResponse.json(
                { success: false, error: 'Only image files are allowed' },
                { status: 400 }
            );
        }

        try {
            const result = await uploadImage(file);

            if (result.code===ERROR_CODES.SUCCESS) {
                return NextResponse.json({ success: true, data: result.data });
            } else {
                return NextResponse.json(
                    { code:ERROR_CODES.SERVER_ERROR, message:'업로드 서버 에러' },
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

async function uploadImage(file: File): Promise<FormState> {
    try {
        const supabase = AdminClient();
        const supabaseClient = await createClient();
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) {
            return {
                code:ERROR_CODES.DB_ERROR,
                message:'사용자 정보를 찾을 수 없습니다.'
            }
        }

        // 파일명 생성 (고유성 보장)
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, file);

        if (uploadError) {
            return {
                code:ERROR_CODES.DB_ERROR,
                message:'파일 업로드 오류'
            };
        }

        // 업로드된 이미지의 공개 URL 가져오기
        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(fileName);
        
        return { code:ERROR_CODES.SUCCESS, data: publicUrl ,message:''};
    } catch (error: any) {

        return { code:ERROR_CODES.SERVER_ERROR, message:'이미지 업로드 서버오류' };
    }
}

// GET 요청 핸들러 추가 (상태 확인용)
export async function GET() {
    return NextResponse.json({ status: 'Image upload API is running' });
}