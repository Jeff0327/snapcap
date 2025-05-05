import React from 'react';
import { getProductList } from './actions';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';
import {ProductList} from "@/components/admin/products/ProductList";

export const metadata = {
    title: '상품 관리 - 관리자',
    description: '상품 목록을 관리하는 페이지입니다.',
};

async function ProductListPage() {
    const { data: products,error } = await getProductList();

    if (error) {
        return (
            <Card className="mx-auto">
                <CardHeader>
                    <CardTitle>상품 목록</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-4 text-center">
                        <p className="text-destructive">상품 목록을 불러오는 중 오류가 발생했습니다.</p>
                        <p className="text-sm text-muted-foreground mt-2">{error}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="mx-auto">
            <ProductList products={products || []} />
        </div>
    );
}

export default ProductListPage;