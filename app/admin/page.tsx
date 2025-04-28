import React from 'react';
import Editor from "@/lib/editor/Editor";

function Page() {
    return (
        <div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    맛집 내용
                </label>
                <Editor name={'contents'}/>
            </div>
        </div>
    );
}

export default Page;