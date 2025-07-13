'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import useAlert from '@/lib/notiflix/useAlert';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageUploader from '@/components/admin/products/ImageUploader';
import ColorVariantInput from '@/components/admin/products/ColorVariantInput';
import TagsInput from '@/components/admin/products/TagsInput';
import Editor from '@/lib/editor/Editor';
import { ERROR_CODES } from '@/utils/ErrorMessage';
import FormContainer, { FormState } from '@/components/ui/form';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { editProduct } from "@/app/admin/products/edit/[id]/actions";
import Image from "next/image";
import { ColorVariant} from "@/types";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import ProductActiveToggle from "@/components/admin/products/ProductActiveToggle";

const ProductEditForm = ({ product }: { product: any }) => {
    const { notify, loading } = useAlert();
    const router = useRouter();

    const [mainImage, setMainImage] = useState(product.images?.[0] || '');
    const [additionalImages, setAdditionalImages] = useState<string[]>(product.images?.slice(1) || []);
    const [tags, setTags] = useState<string[]>(product.tags || []);
    const [totalInventory, setTotalInventory] = useState(product.inventory || 0);
    const [productType, setProductType] = useState(product.type || 'default');
    const allImages = [mainImage, ...additionalImages].filter(Boolean);

    const handleResult = async (formState: FormState) => {
        loading.start();
        try {
            if (formState.code === ERROR_CODES.SUCCESS) {
                notify.success(formState.message);
                router.push('/admin/products');
            } else {
                notify.failure(formState.message);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            notify.failure('상품 수정 중 오류가 발생했습니다.');
        } finally {
            loading.remove();
        }
    };

    const onMainImageUploaded = (url: string) => setMainImage(url);
    const onAdditionalImageUploaded = (url: string) =>
        setAdditionalImages([...additionalImages, url]);
    const removeAdditionalImage = (index: number) =>
        setAdditionalImages(additionalImages.filter((_, i) => i !== index));
    const handleTagsChange = (newTags: string[]) => setTags(newTags);

    // 색상별 재고 변경 시 총 재고 업데이트
    const handleVariantsChange = (variants: ColorVariant[]): void => {
        const total: number = variants.reduce((sum: number, v: ColorVariant) => sum + (parseInt(String(v.inventory)) || 0), 0);
        setTotalInventory(total);
    };

    return (
        <FormContainer action={(formData)=>editProduct(product.id,formData)} onResult={handleResult}>
            <input type="hidden" name="id" value={product.id} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <Label htmlFor="name">상품명 *</Label>
                    <Input id="name" name="name" required defaultValue={product.name} />
                </div>

                <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" name="sku" defaultValue={product.sku} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <Label htmlFor="price">판매가 *</Label>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        required
                        defaultValue={product.price}
                    />
                </div>

                <div>
                    <Label htmlFor="sale_price">할인가</Label>
                    <Input
                        id="sale_price"
                        name="sale_price"
                        type="number"
                        defaultValue={product.sale_price}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <Label htmlFor="total_inventory">총 재고 수량</Label>
                    <Input
                        id="total_inventory"
                        type="number"
                        value={totalInventory}
                        readOnly
                        className="bg-gray-50"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        총 재고는 아래 색상별 재고의 합계로 자동 계산됩니다.
                    </p>
                    <input type="hidden" name="inventory" value={totalInventory}/>
                </div>
                <div>
                    <Label htmlFor="type">상품 타입</Label>
                    <Select
                        value={productType}
                        onValueChange={(value) => setProductType(value)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="타입 선택"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">기본</SelectItem>
                            <SelectItem value="best">베스트</SelectItem>
                            <SelectItem value="new">신상품</SelectItem>
                            <SelectItem value="sale">할인</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* Hidden input for product type */}
                    <input type="hidden" name="type" value={productType}/>
                </div>
            </div>

            <div className="mb-6">
                <Label>메인 이미지 *</Label>
                <ImageUploader onImageUploaded={onMainImageUploaded} label="메인 이미지 변경"/>
                {mainImage &&
                    <Image alt={'mainImage'} src={mainImage} className="w-40 h-40 object-cover mt-2" width={400}
                           height={400}/>}
            </div>

            <div className="mb-6">
                <Label>추가 이미지</Label>
                <ImageUploader onImageUploaded={onAdditionalImageUploaded} label="추가 이미지 업로드"/>
                <div className="flex flex-wrap gap-2 mt-2">
                    {additionalImages.map((img, index) => (
                        <div key={index} className="relative inline-block">
                            <img src={img} alt="" className="w-24 h-24 object-cover"/>
                            <button
                                type="button"
                                onClick={() => removeAdditionalImage(index)}
                                className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {allImages.map((img, i) => (
                <input key={i} type="hidden" name={`images[${i}]`} value={img} />
            ))}

            <div className="mb-6">
                <Label className={'my-2'}>색상별 재고 관리</Label>
                <ColorVariantInput
                    defaultValue={product.colors || {}}
                    variants={product.variants || []}
                    onChange={handleVariantsChange}
                />
            </div>

            <div className="mb-6">
                <Label>태그</Label>
                <TagsInput onChange={handleTagsChange} defaultValue={tags} />
                {tags.map((tag, i) => (
                    <input key={i} type="hidden" name={`tags[${i}]`} value={tag} />
                ))}
            </div>

            <div className="mb-6">
                <Label>상품 설명</Label>
                <Editor name="description" defaultValue={product.description} />
            </div>

            <div className="flex justify-center md:justify-end mt-6 gap-2">
                <Button variant="outline" size="lg" asChild>
                    <Link className={'border border-black'} href="/admin/products">취소</Link>
                </Button>
                <SubmitButton text="상품 수정" className={'border border-black'}/>
            </div>
        </FormContainer>
    );
};

export default ProductEditForm;