import React from 'react';

function Page() {
    return (
        <div className="max-w-4xl mx-auto p-8 bg-white mt-4 lg:mt-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">개인정보처리방침</h1>
                <div className="text-sm text-gray-600 mb-4">
                    <p>시행일자: 2025년 6월 1일</p>
                    <p>최종 수정일: 2025년 6월 1일</p>
                </div>
            </div>

            <div className="space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">제1조 (개인정보의 처리목적)</h2>
                    <div className="text-gray-700 space-y-3">
                        <p>
                            SnapCap(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다.
                            처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
                            이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>회원가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리</li>
                            <li>서비스 제공: 콘텐츠 제공, 맞춤서비스 제공, 본인인증</li>
                            <li>마케팅 및 광고에의 활용: 신규 서비스(제품) 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공</li>
                            <li>고충처리: 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">제2조 (개인정보의 처리 및 보유기간)</h2>
                    <div className="text-gray-700 space-y-3">
                        <p>
                            회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에
                            동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>회원가입 및 관리: 회원 탈퇴 시까지</li>
                                <li>서비스 제공: 서비스 이용계약 종료 시까지</li>
                                <li>마케팅 및 광고 활용: 동의철회 시까지</li>
                                <li>민원처리: 민원 처리 완료 후 3년</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">제3조 (처리하는 개인정보의 항목)</h2>
                    <div className="text-gray-700 space-y-3">
                        <p>회사는 다음의 개인정보 항목을 처리하고 있습니다:</p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">필수항목:</h3>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>이메일주소, 비밀번호, 이름</li>
                                <li>서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보</li>
                            </ul>
                            <h3 className="font-semibold mb-2 mt-4">선택항목:</h3>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>전화번호, 주소</li>
                                <li>프로필 사진, 기타 서비스 이용 과정에서 생성되는 정보</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">제4조 (개인정보의 제3자 제공)</h2>
                    <div className="text-gray-700 space-y-3">
                        <p>
                            회사는 정보주체의 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며,
                            정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <p className="font-semibold text-blue-800">
                                현재 회사는 개인정보를 제3자에게 제공하고 있지 않습니다.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">제5조 (개인정보처리의 위탁)</h2>
                    <div className="text-gray-700 space-y-3">
                        <p>회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:</p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">위탁현황:</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    <strong>수탁업체:</strong> Supabase Inc.<br/>
                                    <strong>위탁업무:</strong> 데이터베이스 서비스 제공 및 데이터 보관<br/>
                                    <strong>위탁기간:</strong> 서비스 이용계약 종료시까지<br/>
                                    <strong>소재지:</strong> 미국 (AWS 인프라 기반)
                                </li>
                                <li>
                                    <strong>수탁업체:</strong> Amazon Web Services, Inc.<br/>
                                    <strong>위탁업무:</strong> 클라우드 인프라 서비스 제공<br/>
                                    <strong>위탁기간:</strong> Supabase 서비스 이용기간<br/>
                                    <strong>소재지:</strong> 미국
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">제6조 (개인정보의 국외이전)</h2>
                    <div className="text-gray-700 space-y-3">
                        <p>회사는 서비스 제공을 위해 아래와 같이 개인정보를 국외로 이전하고 있습니다:</p>
                        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2 text-orange-800">국외이전 현황:</h3>
                            <ul className="space-y-2 text-orange-700">
                                <li><strong>이전받는 자:</strong> Supabase Inc., Amazon Web Services, Inc.</li>
                                <li><strong>이전받는 자의 소재지:</strong> 미국</li>
                                <li><strong>이전일시 및 방법:</strong> 서비스 이용 시점에 네트워크를 통한 전송</li>
                                <li><strong>이전되는 개인정보 항목:</strong> 제3조에 명시된 모든 개인정보 항목</li>
                                <li><strong>이전받는 자의 이용목적:</strong> 데이터베이스 및 클라우드 서비스 제공</li>
                                <li><strong>이전받는 자의 보유·이용기간:</strong> 회원 탈퇴 시 또는 위탁계약 종료 시까지</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">제7조 (정보주체의 권리·의무 및 행사방법)</h2>
                    <div className="text-gray-700 space-y-3">
                        <p>정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>개인정보 처리현황 통지요구</li>
                            <li>개인정보 열람요구</li>
                            <li>개인정보 정정·삭제요구</li>
                            <li>개인정보 처리정지요구</li>
                        </ul>
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-4">
                            <p className="font-semibold text-yellow-800 mb-2">권리 행사 방법:</p>
                            <p>위의 권리 행사는 회사에 대해 서면, 전화, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며,
                                회사는 이에 대해 지체없이 조치하겠습니다.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">제8조 (개인정보의 파기)</h2>
                    <div className="text-gray-700 space-y-3">
                        <p>
                            회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
                            지체없이 해당 개인정보를 파기합니다.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">파기절차 및 방법:</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>파기절차:</strong> 회사는 파기 사유가 발생한 개인정보를 선정하고, 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.
                                </li>
                                <li><strong>파기방법:</strong> 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">제9조 (개인정보의 안전성 확보조치)</h2>
                    <div className="text-gray-700 space-y-3">
                        <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육</li>
                            <li>기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
                            <li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">제10조 (개인정보 보호책임자)</h2>
                    <div className="text-gray-700">
                        <p className="mb-4">
                            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및
                            피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">개인정보 보호책임자</h3>
                            <ul className="space-y-1">
                                <li><strong>성명:</strong> [김지섭]</li>
                                <li><strong>연락처:</strong> [010-3055-4972]</li>
                                <li><strong>이메일:</strong> [cocacola158500@gmail.com]</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">제11조 (권익침해 구제방법)</h2>
                    <div className="text-gray-700 space-y-3">
                        <p>
                            정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회,
                            한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2 text-blue-800">관련 기관 연락처:</h3>
                            <ul className="space-y-2 text-blue-700">
                                <li>개인정보분쟁조정위원회: privacy.go.kr (국번없이) 1833-6972</li>
                                <li>개인정보침해신고센터: privacy.kisa.or.kr (국번없이) 118</li>
                                <li>대검찰청: www.spo.go.kr (국번없이) 1301</li>
                                <li>경찰청: ecrm.cyber.go.kr (국번없이) 182</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">제12조 (개인정보처리방침 변경)</h2>
                    <div className="text-gray-700">
                        <p>
                            이 개인정보처리방침은 2025년 6월 1일부터 적용됩니다.
                            개인정보처리방침의 내용 추가, 삭제 및 수정이 있을 시에는 변경사항의 시행 7일 전부터
                            공지사항을 통하여 고지할 것입니다.
                        </p>
                    </div>
                </section>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                <p>© 2025 SnapCap. All rights reserved.</p>
                <p>본 개인정보처리방침은 2025년 6월 1일부터 시행됩니다.</p>
            </div>
        </div>
    );
}

export default Page;