import React from 'react';

function Page() {
    return (
        <div className="max-w-4xl mx-auto p-8 bg-white mt-4 lg:mt-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">배송 및 반품정책</h1>
                <div className="text-sm text-gray-600 mb-4">
                    <p>시행일자: 2025년 6월 1일</p>
                    <p>최종 수정일: 2025년 6월 1일</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* 배송정책 */}
                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">배송정책</h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">배송지역 및 배송비</h3>
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                <ul className="space-y-2">
                                    <li><strong>배송지역:</strong> 대한민국 전국</li>
                                    <li><strong>기본 배송비:</strong> 무료</li>
                                    <li><strong>제주도 및 도서산간 지역:</strong> 추가 배송비가 발생할 수 있으며, 주문 확인 후 고객님께 개별 연락드립니다</li>
                                </ul>
                                <div className="mt-3 p-3 bg-orange-100 border border-orange-300 rounded">
                                    <p className="text-orange-800 text-sm">
                                        <strong>📞 제주도/도서산간 지역 안내:</strong> 추가 배송비 발생 시 주문 확인 후 고객님의 연락처로 안내해드리며,
                                        동의 후 배송을 진행합니다. 추가 배송비에 동의하지 않으실 경우 주문이 취소됩니다.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">배송기간</h3>
                            <div className="text-gray-700 space-y-2">
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>주문 확인 후 1-2일 이내 출고</li>
                                    <li>출고 후 1-3일 이내 배송 완료 (영업일 기준)</li>
                                    <li>제주도 및 도서산간 지역: 출고 후 2-4일 소요 (추가 배송비 확인 후)</li>
                                    <li>주말 및 공휴일에는 배송이 되지 않습니다</li>
                                </ul>
                                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mt-3">
                                    <p className="text-yellow-800">
                                        <strong>주의사항:</strong> 천재지변, 물량 급증, 택배사 사정 등으로 인해 배송이 지연될 수 있습니다.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">배송방법</h3>
                            <div className="text-gray-700">
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>택배배송 (CJ대한통운, 로젠택배 등)</li>
                                    <li>배송 시작 시 주문자 휴대폰으로 송장번호 안내</li>
                                    <li>배송조회는 SnapCap 홈페이지 또는 해당 택배사 홈페이지에서 가능</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 반품 및 교환정책 */}
                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">반품 및 교환정책</h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">반품/교환 가능 기간</h3>
                            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                <p className="text-green-800 font-semibold mb-2">상품 수령일로부터 14일 이내</p>
                                <ul className="text-green-700 space-y-1">
                                    <li>• 전자상거래 등에서의 소비자보호에 관한 법률에 따른 청약철회권</li>
                                    <li>• 반품/교환 신청은 고객센터 또는 마이페이지에서 가능</li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">반품/교환 배송비 정책</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                    <h4 className="font-semibold text-red-800 mb-2">고객 부담</h4>
                                    <ul className="text-red-700 text-sm space-y-1">
                                        <li>• 단순 변심: 반품 배송비 4,000원</li>
                                        <li>• 색상/사이즈 변경: 반품 배송비 4,000원</li>
                                        <li>• 주문 실수: 반품 배송비 4,000원</li>
                                        <li>• 기타 고객 사유: 반품 배송비 4,000원</li>
                                    </ul>
                                    <p className="text-red-600 text-xs mt-2">*왕복 배송비 부담 (발송 시 무료배송이었으므로 반품배송비만 부담)</p>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                    <h4 className="font-semibold text-blue-800 mb-2">SnapCap 부담 (무료)</h4>
                                    <ul className="text-blue-700 text-sm space-y-1">
                                        <li>• 제품 불량/하자</li>
                                        <li>• 잘못된 상품 발송</li>
                                        <li>• 상품정보 오기재</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">반품/교환 불가 사유</h3>
                            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                                <ul className="text-gray-700 space-y-2">
                                    <li>• 상품 수령일로부터 14일이 경과한 경우</li>
                                    <li>• 고객의 사용 또는 일부 소비에 의하여 상품의 가치가 현저히 감소한 경우</li>
                                    <li>• 포장을 개봉하여 착용하거나 사용한 흔적이 있는 경우</li>
                                    <li>• 세탁을 한 경우</li>
                                    <li>• 택, 라벨이 제거되거나 훼손된 경우</li>
                                    <li>• 고객의 실수로 상품이 훼손된 경우</li>
                                    <li>• 향수, 화장품 등의 냄새가 배인 경우</li>
                                    <li>• 맞춤제작 상품인 경우</li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">반품/교환 절차</h3>
                            <div className="space-y-3">
                                <div className="flex items-start space-x-3">
                                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">1</span>
                                    <div>
                                        <p className="font-semibold">반품/교환 신청</p>
                                        <p className="text-gray-600 text-sm">고객센터(010-3055-4972)</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">2</span>
                                    <div>
                                        <p className="font-semibold">상품 발송</p>
                                        <p className="text-gray-600 text-sm">반품 승인 후 상품을 지정된 주소로 발송</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">3</span>
                                    <div>
                                        <p className="font-semibold">상품 검수</p>
                                        <p className="text-gray-600 text-sm">반품 상품 도착 후 검수 진행 (1-2일 소요)</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">4</span>
                                    <div>
                                        <p className="font-semibold">환불/교환 완료</p>
                                        <p className="text-gray-600 text-sm">검수 완료 후 환불 또는 교환상품 발송</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 환불정책 */}
                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">환불정책</h2>
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <h3 className="font-semibold text-blue-800 mb-2">환불 처리 기간</h3>
                            <ul className="text-blue-700 space-y-1">
                                <li>• 카드결제: 카드사 정책에 따라 3-7일</li>
                                <li>• 계좌이체: 반품 확인 후 2-3일</li>
                                <li>• 무통장입금: 반품 확인 후 2-3일</li>
                            </ul>
                        </div>
                        <div className="text-gray-700">
                            <p>환불 시 단순변심으로 인한 반품의 경우 반품 배송비(4,000원)가 차감되며, 제품 하자로 인한 반품의 경우 전액 환불됩니다. 제주도/도서산간 지역에서 추가 배송비를 지불한 경우, 해당 추가 배송비도 함께 고려하여 환불됩니다.</p>
                        </div>
                    </div>
                </section>

                {/* 고객센터 */}
                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">고객센터</h2>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold text-green-800 mb-2">연락처</h3>
                                <ul className="text-green-700 space-y-1">
                                    <li>• 전화: 010-3055-4972</li>
                                    <li>• 이메일: cocacola158500@gmail.com</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-green-800 mb-2">운영시간</h3>
                                <ul className="text-green-700 space-y-1">
                                    <li>• 평일: 09:00 - 18:00</li>
                                    <li>• 일요일 및 공휴일 휴무</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 반품주소 */}
                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">반품 주소</h2>
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                        <p className="text-orange-800 font-semibold mb-2">반품 전 반드시 고객센터에 연락하여 반품신청 후 발송해주세요</p>
                    </div>
                </section>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">중요 안내사항</h3>
                    <ul className="text-gray-700 text-sm space-y-1">
                        <li>• 본 정책은 전자상거래 등에서의 소비자보호에 관한 법률을 준수합니다</li>
                        <li>• 정책 변경 시 홈페이지를 통해 사전 공지합니다</li>
                        <li>• 기타 문의사항은 고객센터로 연락주시기 바랍니다</li>
                    </ul>
                </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
                <p>© 2025 SnapCap. All rights reserved.</p>
                <p>본 배송 및 반품정책은 2025년 6월 1일부터 시행됩니다.</p>
            </div>
        </div>
    );
}

export default Page;