import React from 'react';
import Image from "next/image";
import {formatPrice} from "@/utils/utils";

const OrderProducts = ({ products }: { products: any[] }) => {
    if (!products || products.length === 0) return <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">주문 상품</h2>
        <p className="text-gray-500">주문 상품 정보를 불러올 수 없습니다.</p>
    </div>;

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">주문 상품 ({products.length}개)</h2>

            <div className="space-y-4">
                {products.map((item, index) => (
                    <div key={index} className="flex items-center border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded mr-4 overflow-hidden">
                            {item.product_image ? (
                                <Image
                                    src={item.product_image}
                                    alt={item.product_name}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    이미지 없음
                                </div>
                            )}
                        </div>

                        <div className="flex-grow">
                            <h3 className="font-medium">{item.product_name}</h3>
                            {item.color && (
                                <p className="text-sm text-gray-600">
                                    {item.color} {item.color_code &&
                                    <span className="inline-block w-3 h-3 rounded-full ml-1"
                                          style={{ backgroundColor: item.color_code }} />
                                }
                                </p>
                            )}
                            <p className="text-sm text-gray-600">수량: {item.quantity}개</p>
                        </div>

                        <div className="text-right">
                            <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                            {item.original_price > item.price && (
                                <p className="text-sm text-gray-500 line-through">
                                    {formatPrice(item.original_price * item.quantity)}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                    <span className="font-medium">총 상품 금액</span>
                    <span className="font-bold text-lg">
            {formatPrice(products.reduce((total, item) => total + (item.price * item.quantity), 0))}
          </span>
                </div>
            </div>
        </div>
    );
};

export default OrderProducts;