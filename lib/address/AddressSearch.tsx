'use client';
import React, { useEffect, useState } from 'react';
import { CustomInput } from "@/components/ui/CustomInput";
import useAlert from "@/lib/notiflix/useAlert";
import { DaumPostcodeData } from "@/types";
import useAddressStore from "@/lib/store/useAddressStore";

const AddressSearch = () => {
    const { notify } = useAlert();
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const { address, detail, setAddress, setDetail } = useAddressStore();

    useEffect(() => {
        if (window.daum) {
            setIsScriptLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.async = true;
        script.onload = () => setIsScriptLoaded(true);
        script.onerror = () => {
            console.error('주소 API 스크립트 로드 실패');
            notify.failure('주소 검색 기능을 불러오는데 실패했습니다.');
        };
        document.head.appendChild(script);
    }, [notify]);

    const handleAddressSearch = () => {
        if (!isScriptLoaded) {
            notify.info('주소 검색 기능을 불러오는 중입니다.');
            return;
        }

        try {
            new window.daum.Postcode({
                oncomplete: (data: DaumPostcodeData) => {
                    let fullAddress = data.address;
                    if (data.buildingName) {
                        fullAddress += ` (${data.buildingName})`;
                    }
                    setAddress(fullAddress);
                    setTimeout(() => {
                        const detailInput = document.querySelector('input[name="addressDetail"]') as HTMLInputElement;
                        if (detailInput) detailInput.focus();
                    }, 100);
                    notify.success('주소가 입력되었습니다.');
                }
            }).open();
        } catch (error) {
            console.error('주소 검색 중 오류:', error);
            notify.failure('주소 검색 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    주소 <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2">
                    <CustomInput
                        name="address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="주소를 검색해주세요"
                        required
                        className="flex-grow"
                        readOnly
                    />
                    <button
                        type="button"
                        onClick={handleAddressSearch}
                        className="w-24 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-semibold"
                    >
                        주소 찾기
                    </button>
                </div>
            </div>
            <div>
                <label htmlFor="addressDetail" className="block text-sm font-medium text-gray-700">
                    상세 주소
                </label>
                <CustomInput
                    name="addressDetail"
                    type="text"
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    placeholder="상세 주소를 입력해주세요 (선택 사항)"
                    className="w-full"
                />
            </div>
        </div>
    );
};

export default AddressSearch;
