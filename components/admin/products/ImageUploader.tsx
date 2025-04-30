'use client';
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { UploadIcon, Loader2 } from "lucide-react";
import useAlert from "@/lib/notiflix/useAlert";
import { Progress } from "@/components/ui/progress";

interface ImageUploaderProps {
    onImageUploaded: (url: string) => void;
    label?: string;
}

const ImageUploader = ({ onImageUploaded, label = "이미지 업로드" }: ImageUploaderProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { notify } = useAlert();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 디버깅 로그 추가
        console.log("파일 선택됨:", file.name, file.type, file.size);

        // 파일 타입 검증
        if (!file.type.startsWith('image/')) {
            notify.failure('이미지 파일만 업로드 가능합니다.');
            return;
        }

        // 파일 크기 검증 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
            notify.failure('5MB 이하의 이미지만 업로드 가능합니다.');
            return;
        }

        setIsUploading(true);
        setUploadProgress(10); // 초기 진행 상태 표시

        try {
            const formData = new FormData();
            formData.append('files[0]', file);

            console.log("업로드 요청 시작");

            // 모의 진행 상태를 표시하기 위한 인터벌
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 300);

            const response = await fetch('/api/upload?action=fileUpload', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);
            setUploadProgress(95);

            // 응답이 JSON이 아닐 경우를 대비
            if (!response.ok) {
                const text = await response.text();
                console.error("서버 응답 에러:", response.status, text);
                throw new Error(`서버 오류: ${response.status} ${text}`);
            }

            const result = await response.json();
            console.log("업로드 응답:", result);

            setUploadProgress(100);

            if (result.success) {
                notify.success('이미지가 성공적으로 업로드되었습니다.');
                onImageUploaded(result.data);
            } else {
                console.error("업로드 실패:", result.error);
                notify.failure(`이미지 업로드 실패: ${result.error}`);
            }
        } catch (error) {
            console.error('이미지 업로드 오류:', error);
            notify.failure('이미지 업로드 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
        } finally {
            setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);

                // 파일 입력 초기화 (같은 파일 재선택 가능하게)
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }, 500);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center">
                <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={triggerFileInput}
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            업로드 중...
                        </>
                    ) : (
                        <>
                            <UploadIcon size={16} />
                            {label}
                        </>
                    )}
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
            </div>

            {isUploading && (
                <div className="w-full space-y-2">
                    <Progress value={uploadProgress} className="h-2 w-full" />
                    <p className="text-xs text-gray-500">
                        {uploadProgress < 100
                            ? `업로드 중... ${uploadProgress}%`
                            : '처리 완료 중...'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;