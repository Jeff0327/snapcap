'use client'
import React, {useState} from 'react';
import {User} from "@supabase/supabase-js";
import UserDetails from "@/components/admin/users/UserDetails";
import { FiMoreHorizontal } from "react-icons/fi";
const UserList = ({ users }: {users:User[]}) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    if (!users || users.length === 0) {
        return (
            <div className="flex justify-center items-center p-8">
                <p className="text-gray-500">회원이 없습니다.</p>
            </div>
        );
    }

    const handleViewDetails = (user: User) => {
        setSelectedUser(user);
    };

    const handleCloseDetails = () => {
        setSelectedUser(null);
    };

    // Get display name from user metadata
    const getDisplayName = (user: User) => {
        return user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.user_metadata?.preferred_username ||
            '-';
    };

    // Get login provider name
    const getProviderName = (user: User) => {
        const provider = user.app_metadata?.provider || '';

        switch(provider) {
            case 'email': return '이메일';
            case 'google': return '구글';
            case 'kakao': return '카카오';
            default: return provider;
        }
    };

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="py-3 px-4 text-left">ID</th>
                        <th className="py-3 px-4 text-left">이메일</th>
                        <th className="py-3 px-4 text-left">이름</th>
                        <th className="py-3 px-4 text-left">가입방법</th>
                        <th className="py-3 px-4 text-left">가입일</th>
                        <th className="py-3 px-4 text-left">최근 로그인</th>
                        <th className="py-3 px-4 text-left">관리</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-t hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm">{user.id.substring(0, 8)}...</td>
                            <td className="py-3 px-4">{user.email}</td>
                            <td className="py-3 px-4">{getDisplayName(user)}</td>
                            <td className="py-3 px-4">{getProviderName(user)}</td>
                            <td className="py-3 px-4">{new Date(user.created_at).toLocaleDateString('ko-KR')}</td>
                            <td className="py-3 px-4">
                                {user.last_sign_in_at
                                    ? new Date(user.last_sign_in_at).toLocaleDateString('ko-KR')
                                    : '로그인 기록 없음'}
                            </td>
                            <td className="py-3 px-4">
                                <button
                                    onClick={() => handleViewDetails(user)}
                                >
                                    <FiMoreHorizontal className={'w-5 h-5'}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {selectedUser && (
                <UserDetails user={selectedUser} onClose={handleCloseDetails}/>
            )}
        </div>
    );
};

export default UserList;