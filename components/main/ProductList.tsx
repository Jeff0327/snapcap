'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Products } from "@/types";
import { formatPrice } from "@/utils/utils";
import { IoIosArrowForward } from "react-icons/io";
import RotatingText from "@/components/ui/rotateText";

interface ProductListProps {
    products: Products[]|[];
    title?: string;
    viewAllLink?: string;
}

function ProductList({ products, title = "PRODUCTS", viewAllLink }: ProductListProps) {
    // 🎯 상품의 품절 여부를 variants 기준으로 판단 (타입 안전하게)
    const isProductOutOfStock = (product: Products) => {
        // variants가 있는 경우 - 모든 variant가 품절이면 상품 품절
        const productVariants = (product as any)?.variants;
        if (productVariants && Array.isArray(productVariants) && productVariants.length > 0) {
            return !productVariants.some((variant: any) =>
                (variant.is_active === true) && (variant.inventory || 0) > 0
            );
        }
        // variants가 없는 경우 - 기본 재고 확인
        return (product.inventory || 0) <= 0;
    };

    // 🎯 사용 가능한 색상 개수 계산 (타입 안전하게)
    const getAvailableColorsCount = (product: Products) => {
        const productVariants = (product as any)?.variants;
        if (!productVariants || !Array.isArray(productVariants)) return 0;
        return productVariants.filter((variant: any) =>
            (variant.is_active === true) && (variant.inventory || 0) > 0
        ).length;
    };

    // 🎯 총 재고 계산 (모든 variant 재고 합계) (타입 안전하게)
    const getTotalInventory = (product: Products) => {
        const productVariants = (product as any)?.variants;
        if (productVariants && Array.isArray(productVariants) && productVariants.length > 0) {
            return productVariants.reduce((total: number, variant: any) => {
                return total + ((variant.is_active === true) ? (variant.inventory || 0) : 0);
            }, 0);
        }
        return product.inventory || 0;
    };

    // 🎯 variants 존재 여부 확인 (타입 안전하게)
    const hasVariants = (product: Products) => {
        const productVariants = (product as any)?.variants;
        return !!(productVariants && Array.isArray(productVariants) && productVariants.length > 0);
    };

    return (
        <div className="py-1">
            {title && (
                <div className="flex justify-between items-center mb-4 mt-12">
                    <h2 className="text-lg lg:text-2xl font-jalnan">{title}</h2>

                    {viewAllLink && (
                        <Link
                            href={viewAllLink}
                            className="flex flex-row items-center font-semibold dark:text-white text-gray-700 hover:text-black transition-colors"
                        >
                            더보기
                            <IoIosArrowForward className="w-5 h-5 ml-1" />
                        </Link>
                    )}
                </div>
            )}

            {products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    등록된 상품이 없습니다.
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {products.map((product) => {
                        const isOutOfStock = isProductOutOfStock(product);
                        const availableColors = getAvailableColorsCount(product);
                        const totalInventory = getTotalInventory(product);
                        const productHasVariants = hasVariants(product);

                        return (
                            <div key={product.id} className="group">
                                {/* 🎯 품절 상품은 클릭 불가, 정상 상품은 클릭 가능 */}
                                {isOutOfStock ? (
                                    // 품절 상품 - 클릭 불가
                                    <div className="cursor-not-allowed">
                                        <div className="relative aspect-square overflow-hidden bg-gray-100 mb-2 rounded">
                                            {product.images && product.images.length > 0 ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                                    className="object-cover grayscale"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                    <span className="text-gray-400">No Image</span>
                                                </div>
                                            )}

                                            {/* 🎯 품절 오버레이 */}
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <div className="text-center">
                                                    <span className="text-white font-bold text-lg">SOLD OUT</span>
                                                    {productHasVariants && (
                                                        <p className="text-white text-xs mt-1">모든 색상 품절</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="opacity-60">
                                            <h3 className="text-xs sm:text-sm font-medium truncate text-gray-500">
                                                {product.name}
                                            </h3>
                                            <div>
                                                {product.sale_price && product.sale_price < product.price ? (
                                                    <div className="flex items-center">
                                                        <span className="text-gray-400 text-sm line-through mr-2">{formatPrice(product.sale_price)}</span>
                                                        <span className="text-gray-400 text-xs line-through">{formatPrice(product.price)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
                                                )}
                                            </div>
                                            {productHasVariants && (
                                                <p className="text-xs text-gray-400 mt-1">전체 색상 품절</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    // 정상 상품 - 클릭 가능
                                    <Link
                                        href={`/products/${product.id}`}
                                        className="block"
                                    >
                                        <div className="relative aspect-square overflow-hidden bg-gray-100 mb-2 rounded">
                                            {product.images && product.images.length > 0 ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                                    className="object-cover transition-all duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                    <span className="text-gray-400">No Image</span>
                                                </div>
                                            )}

                                            {/* 🎯 재고 정보 배지 */}
                                            {productHasVariants && availableColors > 0 && (
                                                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                                    {availableColors}색상
                                                </div>
                                            )}

                                            {/* 🎯 신상품 배지 (7일 이내 등록된 상품) */}
                                            {(() => {
                                                const createdDate = new Date(product.created_at);
                                                const now = new Date();
                                                const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
                                                return daysDiff <= 7;
                                            })() && (
                                                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
                                                    NEW
                                                </div>
                                            )}

                                            {/* 🎯 할인 배지 */}
                                            {product.sale_price && product.sale_price < product.price && (
                                                <div className="absolute bottom-0 left-0 text-white text-xs px-2 py-1 rounded font-bold">
                                                    <RotatingText
                                                        texts={['SALE','배송비무료']}
                                                        mainClassName="px-2 sm:px-2 md:px-3 bg-red-500 text-white overflow-hidden py-0.5 sm:py-1 px-2 md:py-2 justify-center rounded-sm"
                                                        staggerFrom={"last"}
                                                        initial={{ y: "100%" }}
                                                        animate={{ y: 0 }}
                                                        exit={{ y: "-120%" }}
                                                        staggerDuration={0.025}
                                                        splitLevelClassName="overflow-hidden"
                                                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                                                        rotationInterval={2000}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-xs sm:text-sm font-medium truncate">
                                                {product.name}
                                            </h3>
                                            <div>
                                                {product.sale_price && product.sale_price < product.price ? (
                                                    <div className="flex items-center">
                                                        <span className="text-red-500 text-sm font-bold mr-2">{formatPrice(product.sale_price)}</span>
                                                        <span className="text-gray-400 text-xs line-through">{formatPrice(product.price)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-bold">{formatPrice(product.price)}</span>
                                                )}
                                            </div>

                                            {/* 🎯 상품 상태 표시 */}
                                            {!product.is_active && (
                                                <div className="mt-1">
                                                    <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                                                        비활성화
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ProductList;