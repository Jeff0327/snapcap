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
    const { success, data: products, error } = await getProductList();

    if (!success) {
        return (
            <Card className="max-w-6xl mx-auto">
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
        <div className="container py-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">상품 관리</h1>
                <Button asChild>
                    <Link href="/admin/products/create">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        상품 등록
                    </Link>
                </Button>
            </div>

            <ProductList products={products || []} />
        </div>
    );
}

export default ProductListPage;