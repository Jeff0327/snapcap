'use client';
import React, { useState } from 'react';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    MoreHorizontal,
    PenSquare,
    Trash2,
    Eye,
    Search,
    ArrowUpDown
} from "lucide-react";
import Link from "next/link";
import { deleteProduct, toggleProductStatus } from "@/app/admin/products/actions";
import useAlert from "@/lib/notiflix/useAlert";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ERROR_CODES } from "@/utils/ErrorMessage";
import FormContainer from "@/components/ui/form";
import { Products } from "@/types";
import {useLoading} from "@/components/layout/LoadingProvider";

export function ProductList({ products }: {products: Products[];}) {
    const { notify, confirm } = useAlert();
    const { showLoading, hideLoading } = useLoading();
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<keyof Products>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [showActive, setShowActive] = useState<boolean | null>(null);

    // 검색 및 필터링된 상품 목록
    const filteredProducts = products.filter(product => {
        // 검색어 필터링
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());

        // 활성화 상태 필터링
        const matchesActiveState =
            showActive === null ? true : // 모든 상품 표시
                showActive === true ? product.is_active : // 활성화된 상품만
                    !product.is_active; // 비활성화된 상품만

        return matchesSearch && matchesActiveState;
    });

    // 정렬
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortField === 'price' || sortField === 'sale_price' || sortField === 'inventory') {
            return sortDirection === 'asc'
                ? (a[sortField] || 0) - (b[sortField] || 0)
                : (b[sortField] || 0) - (a[sortField] || 0);
        }

        if (sortField === 'created_at') {
            return sortDirection === 'asc'
                ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }

        return sortDirection === 'asc'
            ? (a[sortField] || '').toString().localeCompare((b[sortField] || '').toString())
            : (b[sortField] || '').toString().localeCompare((a[sortField] || '').toString());
    });

    // 정렬 토글
    const toggleSort = (field: keyof Products) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // 전체 선택 토글
    const toggleSelectAll = () => {
        if (selectedProducts.length === sortedProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(sortedProducts.map(p => p.id));
        }
    };

    // 개별 선택 토글
    const toggleSelect = (id: string) => {
        if (selectedProducts.includes(id)) {
            setSelectedProducts(selectedProducts.filter(p => p !== id));
        } else {
            setSelectedProducts([...selectedProducts, id]);
        }
    };

    // 상품 삭제 핸들러
    const handleDeleteProduct = async (id: string, name: string) => {
        // useAlert 훅이 Promise 기반 confirm을 제공하는 경우
        const result = await confirm(
            '상품 삭제',
            `"${name}" 상품을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
            '삭제',
            '취소'
        );

        if (result) {
            showLoading()

            const formData = new FormData();
            formData.append('productId', id);

            const deleteResult = await deleteProduct(formData);

            if (deleteResult.code === ERROR_CODES.SUCCESS) {
                notify.success(deleteResult.message);
                // 선택 목록에서도 제거
                setSelectedProducts(selectedProducts.filter(p => p !== id));
            } else {
                notify.failure(deleteResult.message);
            }

            hideLoading()
        }
    };

    // 선택된 상품 일괄 삭제
    const handleBulkDelete = async () => {
        if (selectedProducts.length === 0) {
            notify.info('삭제할 상품을 선택해주세요.');
            return;
        }

        // useAlert 훅이 Promise 기반 confirm을 제공하는 경우
        const result = await confirm(
            '선택된 상품 삭제',
            `선택한 ${selectedProducts.length}개의 상품을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
            '삭제',
            '취소'
        );

        if (result) {
            showLoading()

            // 순차적으로 삭제 처리
            let successCount = 0;
            let failCount = 0;

            for (const id of selectedProducts) {
                const formData = new FormData();
                formData.append('productId', id);

                const deleteResult = await deleteProduct(formData);

                if (deleteResult.code === ERROR_CODES.SUCCESS) {
                    successCount++;
                } else {
                    failCount++;
                }
            }

            // 결과 알림
            if (failCount === 0) {
                notify.success(`${successCount}개의 상품이 성공적으로 삭제되었습니다.`);
            } else {
                notify.info(`${successCount}개 삭제 성공, ${failCount}개 삭제 실패`);
            }

            // 선택 목록 초기화
            setSelectedProducts([]);

            hideLoading()
        }
    };

    // 상품 상태 토글 핸들러
    const handleToggleStatus = async (id: string, isActive: boolean, name: string) => {
        const formData = new FormData();
        formData.append('productId', id);
        formData.append('isActive', isActive.toString());

        showLoading()

        const result = await toggleProductStatus(formData);

        if (result.code === ERROR_CODES.SUCCESS) {
            notify.success(result.message);
        } else {
            notify.failure(result.message);
        }

        hideLoading()
    };

    // 가격 포맷팅 함수
    const formatPrice = (price: number | null) => {
        if (price === null) return '-';
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-xl font-bold flex justify-between items-center">
                    <span>상품 관리</span>
                    <span className="text-sm text-muted-foreground">
                        총 {products.length}개 상품 중 {filteredProducts.length}개 표시
                    </span>
                </CardTitle>
                <CardDescription>
                    상품을 관리하고 재고, 가격, 상태를 업데이트하세요.
                </CardDescription>

                {/* 검색 및 필터 영역 */}
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="상품명으로 검색..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 items-center">
                        <Label htmlFor="show-active" className="text-sm">상태:</Label>
                        <select
                            id="show-active"
                            className="p-2 rounded border text-sm"
                            value={showActive === null ? 'all' : showActive ? 'active' : 'inactive'}
                            onChange={(e) => {
                                const value = e.target.value;
                                setShowActive(
                                    value === 'all' ? null :
                                        value === 'active' ? true : false
                                );
                            }}
                        >
                            <option value="all">전체 보기</option>
                            <option value="active">활성화됨</option>
                            <option value="inactive">비활성화됨</option>
                        </select>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {/* 일괄 작업 버튼 */}
                <div className="mb-4 flex flex-wrap gap-2">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        disabled={selectedProducts.length === 0}
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        선택 삭제 ({selectedProducts.length})
                    </Button>
                </div>

                {/* 상품 테이블 */}
                <div className="rounded border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={selectedProducts.length === sortedProducts.length && sortedProducts.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="전체 선택"
                                    />
                                </TableHead>
                                <TableHead className="w-14">이미지</TableHead>
                                <TableHead className="min-w-[200px]">
                                    <div className="flex items-center cursor-pointer" onClick={() => toggleSort('name')}>
                                        상품명
                                        <ArrowUpDown className="ml-1 h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead className="w-24">
                                    <div className="flex items-center cursor-pointer" onClick={() => toggleSort('price')}>
                                        가격
                                        <ArrowUpDown className="ml-1 h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead className="w-24">할인가</TableHead>
                                <TableHead className="w-20">
                                    <div className="flex items-center cursor-pointer" onClick={() => toggleSort('inventory')}>
                                        재고
                                        <ArrowUpDown className="ml-1 h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead className="w-24">상태</TableHead>
                                <TableHead className="w-40 text-right">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        {searchTerm
                                            ? '검색 결과가 없습니다.'
                                            : '등록된 상품이 없습니다.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedProducts.map((product) => (
                                    <TableRow key={product.id} className={product.is_active ? '' : 'bg-muted/20'}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedProducts.includes(product.id)}
                                                onCheckedChange={() => toggleSelect(product.id)}
                                                aria-label={`${product.name} 선택`}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {product.images && product.images.length > 0 ? (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-10 h-10 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                                                    No img
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{product.name}</div>
                                        </TableCell>
                                        <TableCell>{formatPrice(product.price)}</TableCell>
                                        <TableCell>{formatPrice(product.sale_price)}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={product.inventory > 0 ? "outline" : "destructive"}
                                                className="whitespace-nowrap"
                                            >
                                                {product.inventory} 개
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <FormContainer action={toggleProductStatus} onResult={(result) => {
                                                if (result.code === ERROR_CODES.SUCCESS) notify.success(result.message);
                                                else notify.failure(result.message);
                                            }}>
                                                <input type="hidden" name="productId" value={product.id} />
                                                <input type="hidden" name="isActive" value={product.is_active.toString()} />
                                                <Switch
                                                    checked={product.is_active}
                                                    onCheckedChange={() =>
                                                        handleToggleStatus(product.id, product.is_active, product.name)
                                                    }
                                                />
                                            </FormContainer>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">메뉴</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/products/edit/${product.id}`} className="cursor-pointer">
                                                            <PenSquare className="h-4 w-4 mr-2" />
                                                            수정
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/products/${product.id}`} className="cursor-pointer">
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            보기
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive cursor-pointer"
                                                        onClick={() => handleDeleteProduct(product.id, product.name)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        삭제
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}