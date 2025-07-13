import React from 'react';
import { redirect } from "next/navigation";
import {User} from "@supabase/supabase-js";
import {formatDate} from "@/utils/utils";
import {Card} from "@/components/ui/card";
import PasswordChange from "@/components/profile/PasswordChange";

// 유저 정보 카드 컴포넌트
function UserInfoCard({ user }:{user:User}) {


    if(!user) redirect('/login')

    return (
        <Card className="mx-auto p-6 rounded-none shadow-lg border-none max-w-4xl">
            <div className="border-b pb-4 mb-6 mt-16 max-w-full md:max-w-5xl">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">사용자 정보</h1>
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                            {user.user_metadata?.full_name || user.email}
                        </h2>
                        <p className="text-gray-600 dark:text-white">{user.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-2 mt-6">

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">계정 상태</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.email_confirmed_at
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {user.email_confirmed_at ? '인증됨' : '미인증'}
                        </span>
                    </div>
                    <div>
                        {user.user_metadata.phone ? user.user_metadata.phone : ''}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">가입일</h3>
                        <p className="text-gray-800">{formatDate(user.created_at)}</p>
                    </div>
                </div>
                <PasswordChange />
            </div>
        </Card>
    );
}
export default UserInfoCard;