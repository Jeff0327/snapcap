import React from 'react';

const ShippingInfo = ({ address }: { address: any }) => {
    if (!address) return <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">배송지 정보</h2>
        <p className="text-gray-500">배송지 정보를 불러올 수 없습니다.</p>
    </div>;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">배송지 정보</h2>

            <div className="space-y-3">
                <div>
                    <p className="text-gray-600">받는 사람</p>
                    <p className="font-medium">{address.recipient_name}</p>
                </div>

                <div>
                    <p className="text-gray-600">연락처</p>
                    <p className="font-medium">{address.phone_number}</p>
                </div>

                <div>
                    <p className="text-gray-600">주소</p>
                    <p className="font-medium">{address.address_line1} {address.address_line2}</p>
                </div>
            </div>
        </div>
    );
};

export default ShippingInfo;