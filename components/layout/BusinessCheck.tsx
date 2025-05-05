'use client'
import React from 'react';

function BusinessCheck() {
    const openBusinessVerification = () => {
        window.open('https://www.bizno.net/?query=5312002039', '_blank');
    };

    // Function to open online sales business verification window
    const openSalesVerification = () => {
        window.open('https://www.ftc.go.kr/bizCommPop.do?wrkr_no=5312002039', '_blank');
    };
    return (
        <div className={'flex flex-col'}>
            <div className={'flex flex-row items-center gap-1'}>
                <label className={'text-sm font-semibold text-white/80'}>사업자 등록번호 :</label>
                <span className={'text-sm'}>531-20-02039</span>
                <button
                    onClick={openBusinessVerification}
                    className="text-xs text-center underline"
                >
                    조회
                </button>
            </div>
            <div className={'flex flex-row items-center gap-1 text-center'}>
                <label className={'text-sm font-semibold text-white/80'}>통신판매업 신고번호 :</label>
                <span className={'text-sm'}>2023-전북군산-0484</span>
                <button
                    onClick={openSalesVerification}
                    className="text-xs text-center underline"
                >
                    조회
                </button>
            </div>
        </div>
    )
        ;
}

export default BusinessCheck;