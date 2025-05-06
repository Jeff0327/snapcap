'use client'
import React, { useState, useEffect } from 'react';
import { CustomInput } from "@/components/ui/CustomInput";
import useAlert from "@/lib/notiflix/useAlert";
import {DaumPostcodeData} from "@/types";

interface AddressSearchProps {
    defaultAddress?: string;
    onAddressChange: (address: string) => void;
}

const AddressSearch: React.FC<AddressSearchProps> = ({ defaultAddress = '', onAddressChange }) => {
    const [address, setAddress] = useState(defaultAddress);
    const [addressDetail, setAddressDetail] = useState('');
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const { notify } = useAlert();

    // 스크립트 로드 함수
    useEffect(() => {
        // 이미 window.daum이 존재하는지 확인
        if (window.daum) {
            setIsScriptLoaded(true);
            return;
        }

        // 스크립트 동적 로드
        const script = document.createElement('script');
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.async = true;

        script.onload = () => {
            setIsScriptLoaded(true);
        };

        script.onerror = () => {
            console.error('다음 주소 API 스크립트 로드 실패');
            notify.failure('주소 검색 기능을 불러오는데 실패했습니다.');
        };

        document.head.appendChild(script);

        return () => {
            // 컴포넌트 언마운트 시 스크립트 제거 (선택사항)
            // document.head.removeChild(script);
        };
    }, [notify]);

    // defaultAddress가 변경되면 state 업데이트
    useEffect(() => {
        if (defaultAddress) {
            setAddress(defaultAddress);
        }
    }, [defaultAddress]);

    // address 또는 addressDetail이 변경될 때 상위 컴포넌트에 알림
    useEffect(() => {
        if (addressDetail) {
            onAddressChange(`${address}, ${addressDetail}`);
        } else {
            onAddressChange(address);
        }
    }, [address, addressDetail, onAddressChange]);

    // 다음 주소 검색 API 호출
    const handleAddressSearch = () => {
        if (!isScriptLoaded) {
            notify.info('주소 검색 기능을 불러오는 중입니다. 잠시만 기다려주세요.');
            return;
        }

        // 명시적으로 window 객체 체크
        if (!window.daum || !window.daum.Postcode) {
            console.error('Daum Postcode 객체를 찾을 수 없습니다.');
            notify.failure('주소 검색 기능을 사용할 수 없습니다. 페이지를 새로고침 해보세요.');
            return;
        }

        try {
            new window.daum.Postcode({
                oncomplete: function(data: DaumPostcodeData) {
                    // 사용자가 선택한 주소 정보
                    let fullAddress = data.address;
                    let extraAddress = '';

                    // 법정동/건물명이 있을 경우 추가
                    if (data.buildingName !== '') {
                        extraAddress += (extraAddress !== '' ? ', ' + data.buildingName : data.buildingName);
                    }

                    // 최종 주소 구성
                    fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');

                    // 주소 상태 업데이트
                    setAddress(fullAddress);

                    // 상세 주소 입력란에 포커스
                    setTimeout(() => {
                        const detailInput = document.querySelector('input[name="addressDetail"]') as HTMLInputElement;
                        if (detailInput) detailInput.focus();
                    }, 100);

                    // 사용자에게 알림
                    notify.success('주소가 입력되었습니다.');
                }
            }).open();
        } catch (error) {
            console.error('Daum Postcode 실행 오류:', error);
            notify.failure('주소 검색 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="space-y-4">
            {/* 주소 (다음 주소 API 사용) */}
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

            {/* 상세 주소 (선택 사항) */}
            <div>
                <label htmlFor="addressDetail" className="block text-sm font-medium text-gray-700">
                    상세 주소
                </label>
                <CustomInput
                    name="addressDetail"
                    type="text"
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    placeholder="상세 주소를 입력해주세요 (선택 사항)"
                    className="w-full"
                />
            </div>
        </div>
    );
};

export default AddressSearch;