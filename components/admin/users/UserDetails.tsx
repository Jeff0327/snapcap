import React from 'react';
import Image from 'next/image';
import {User} from "@supabase/supabase-js";

type UserDetailsProps = {
    user: User;
    onClose: () => void;
};

const UserDetails = ({ user, onClose }: UserDetailsProps) => {
    // Format date for display
    const formatDate = (dateString?: string) => {
        if (!dateString) return '정보 없음';
        return new Date(dateString).toLocaleString('ko-KR');
    };

    // Get user display name
    const getDisplayName = () => {
        return user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.user_metadata?.preferred_username ||
            '이름 정보 없음';
    };

    // Get login provider name in Korean
    const getProviderName = () => {
        const provider = user.app_metadata?.provider || '';

        switch(provider) {
            case 'email': return '이메일';
            case 'google': return '구글';
            case 'kakao': return '카카오';
            default: return provider;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">회원 상세 정보</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* User avatar */}
                    <div className="flex flex-col items-center">
                        {user.user_metadata?.avatar_url ? (
                            <div className="relative w-28 h-28 rounded-full overflow-hidden mb-2">
                                <img
                                    src={user.user_metadata.avatar_url}
                                    alt={`${getDisplayName()} 프로필`}
                                    className="object-cover"
                                    width={112}
                                    height={112}
                                />
                            </div>
                        ) : (
                            <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                <span className="text-3xl text-gray-500">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
                            </div>
                        )}
                        <span className="font-medium text-lg">{getDisplayName()}</span>
                        <span className="text-sm text-gray-500">{getProviderName()} 로그인</span>
                    </div>

                    {/* User details */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <h3 className="text-lg font-medium border-b pb-2 mb-2">기본 정보</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-sm text-gray-500">사용자 ID</p>
                                        <p className="text-sm font-mono break-all">{user.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">이메일</p>
                                        <p>{user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">이메일 인증</p>
                                        <p>{user.user_metadata?.email_verified ? '인증됨' : '인증되지 않음'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">역할</p>
                                        <p>{user.user_metadata?.role || '일반 사용자'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">가입일</p>
                                        <p>{formatDate(user.created_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">최근 로그인</p>
                                        <p>{formatDate(user.last_sign_in_at)}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium border-b pb-2 mb-2">상세 메타데이터</h3>
                                <div className="bg-gray-50 p-3 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(user.user_metadata, null, 2)}
                  </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetails;