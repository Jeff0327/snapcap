import React from 'react';
import Editor from "@/lib/editor/Editor";
import Link from "next/link";

function Page() {
    return (
        <div className={'mt-2'}>
            <div className={'flex justify-between items-center gap-2'}>
                <div className={'flex flex-col items-center p-2 border w-[20vw] h-[80vh] rounded-lg'}>
                    <span>회원관리</span>
                    <Link href={'/admin/products'}>상품관리</Link>
                </div>
                <div className={'flex flex-col w-full h-[80vh] gap-2'}>
                    <div className={'flex justify-center items-center border rounded-lg w-full h-[40vh]'}>
                        이달 통계
                    </div>
                    <div className={'flex justify-center items-center border rounded-lg w-full h-[40vh]'}>
                        판매수량
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;