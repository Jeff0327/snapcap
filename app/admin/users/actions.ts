'use server';

import {AdminClient} from "@/utils/adminClient";

export async function getAllUsers() {
    const supabase =AdminClient()
    try{
        const {data:{users}}=await supabase.auth.admin.listUsers();

        return users;
    }catch(error){
        return {
            message:'회원목록을 불러오는중 서버에러가 발생하였습니다.',
            data:[]
        }
    }
}