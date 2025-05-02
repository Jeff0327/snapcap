'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Products } from "@/types";
import {formatPrice} from "@/utils/utils";

interface ProductListProps {
    products: Products[];
    title?: string;
}

function ProductList({ products, title = "PRODUCTS" }: ProductListProps) {


    return (
        <div className="py-4">
            {title && (
                <h2 className="text-lg md:text-2xl font-bold mb-4">{title}</h2>
            )}

            {products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    등록된 상품이 없습니다.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                        <Link
                            href={`/products/${product.id}`}
                            key={product.id}
                            className="group"
                        >
                            <div className="relative aspect-square overflow-hidden bg-gray-100 mb-2 rounded">
                                {product.images && product.images.length > 0 ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                        className="object-cover transition-all duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                        <span className="text-gray-400">No Image</span>
                                    </div>
                                )}

                                {/* 재고 없음 표시 */}
                                {product.inventory <= 0 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="text-white font-medium">SOLD OUT</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-sm md:text-base font-medium truncate">{product.name}</h3>
                                <div>
                                    {product.sale_price && product.sale_price < product.price ? (
                                        <div className="flex items-center">
                                            <span className="text-red-500 font-bold mr-2">{formatPrice(product.sale_price)}</span>
                                            <span className="text-gray-400 text-sm line-through">{formatPrice(product.price)}</span>
                                        </div>
                                    ) : (
                                        <span className="font-bold">{formatPrice(product.price)}</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProductList;