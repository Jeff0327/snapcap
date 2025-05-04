'use client';
import React from 'react';
import { Button } from "@/components/ui/button";
import { useFormStatus } from 'react-dom';
import { ArrowRightIcon } from "lucide-react";

interface SubmitButtonProps {
    text: string;
    variant?: 'default' | 'outline' | 'destructive';
    size?: 'default' | 'sm' | 'lg';
    showIcon?: boolean;
    className?:string;
}

export function SubmitButton({
                                 text,
                                 variant = 'default',
                                 size = 'lg',
                                 showIcon = true,
    className,
                             }: SubmitButtonProps) {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            variant={variant}
            size={size}
            disabled={pending}
            className={`min-w-[120px] flex items-center justify-center ${className}`}
        >
            {pending ? '처리 중...' : text}
            {showIcon && !pending && <ArrowRightIcon className="ml-2 h-4 w-4" />}
        </Button>
    );
}

export function CancelButton({
                                 text = '취소',
                                 onClick
                             }: {
    text?: string,
    onClick: () => void
}) {
    return (
        <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onClick}
        >
            {text}
        </Button>
    );
}