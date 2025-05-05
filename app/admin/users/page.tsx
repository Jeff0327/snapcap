import React from 'react';
import { getAllUsers } from "@/app/admin/users/actions";
import UserList from "@/components/admin/users/UserList";
import {Card} from "@/components/ui/card";

async function Page() {
    const users = await getAllUsers();

    // Check if there was an error fetching the users
    const isError = users && 'message' in users;

    return (
        <Card className={'p-6 min-h-[90vh]'}>
            <div className="mb-6">
                <h1 className="text-xl font-bold">회원 관리</h1>
            </div>

            {isError ? (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                    {users.message}
                </div>
            ) : (
                <>
                    <div className="mb-4 flex justify-between items-center">
                        <div>
                            <span className="text-gray-700">총 {users.length}명의 회원</span>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="회원 검색"
                                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <UserList users={users} />
                </>
            )}
        </Card>
    );
}

export default Page;