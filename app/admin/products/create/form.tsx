'use client';
import React, { useState } from 'react';
import { createProduct } from "./actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useAlert from "@/lib/notiflix/useAlert";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import ImageUploader from "@/components/admin/products/ImageUploader";
// import ColorVariantInput from "@/components/admin/products/ColorVariantInput";
// import TagsInput from "@/components/admin/products/TagsInput";
import Editor from "@/lib/editor/Editor";
import {ERROR_CODES} from "@/utils/ErrorMessage";
import FormContainer, {FormState} from "@/components/ui/form";
import {SubmitButton} from "@/components/ui/SubmitButton";
import ColorVariantInput from "@/components/admin/products/ColorVariantInput";
import TagsInput from "@/components/admin/products/TagsInput";
import {ColorVariant} from "@/types";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

//ColorVariantInput ,TagInput params 수정!!
const ProductCreateForm = () => {
    const { notify, loading } = useAlert();
    const router = useRouter();
    const [mainImage, setMainImage] = useState('');
    const [additionalImages, setAdditionalImages] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [totalInventory, setTotalInventory] = useState(0);
    const [productType, setProductType] = useState('default');
    // 이미지 URL이 설정되면 hidden input에 값을 넣기 위한 모든 이미지 배열
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
            console.error('Error creating product:', error);
            notify.failure('상품 등록 중 오류가 발생했습니다.');
        } finally {
            loading.remove();
        }
    };

    const onMainImageUploaded = (url: string) => {
        setMainImage(url);
    };

    const onAdditionalImageUploaded = (url: string) => {
        setAdditionalImages([...additionalImages, url]);
    };

    const removeAdditionalImage = (index: number) => {
        setAdditionalImages(additionalImages.filter((_, i) => i !== index));
    };

    const handleTagsChange = (newTags: string[]) => {
        setTags(newTags);
    };

    // 색상별 재고 변경 시 총 재고 업데이트
    const handleVariantsChange = (variants: ColorVariant[]): void => {
        const total: number = variants.reduce((sum: number, v: ColorVariant) => sum + (parseInt(String(v.inventory)) || 0), 0);
        setTotalInventory(total);
    };
    return (
        <FormContainer action={createProduct} onResult={handleResult}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <Label htmlFor="name" className="block mb-2 font-semibold">상품명 *</Label>
                    <Input
                        id="name"
                        name="name"
                        required
                        placeholder="상품명을 입력하세요"
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <Label htmlFor="sku" className="block mb-2 font-semibold">SKU</Label>
                    <Input
                        id="sku"
                        name="sku"
                        placeholder="상품 고유 코드"
                        className="w-full p-2 border rounded"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <Label htmlFor="price" className="block mb-2 font-semibold">판매가 *</Label>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        required
                        placeholder="0"
                        min="0"
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <Label htmlFor="sale_price" className="block mb-2 font-semibold">할인가</Label>
                    <Input
                        id="sale_price"
                        name="sale_price"
                        type="number"
                        placeholder="0"
                        min="0"
                        className="w-full p-2 border rounded"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <Label htmlFor="total_inventory" className={'mb-2'}>총 재고 수량</Label>
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
                    <Label htmlFor="type" className={'mb-2'}>상품 타입</Label>
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
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Switch
                            id="is_active"
                            name="is_active"
                            defaultChecked={true}
                            className="peer h-6 w-11 rounded-full bg-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 data-[state=checked]:bg-blue-600"
                        />
                        <span
                            className="block absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-data-[state=checked]:translate-x-5"></span>
                    </div>
                    <Label htmlFor="is_active">상품 활성화</Label>
                </div>
            </div>

            <div className="mb-6">
                <Label className="block mb-2 font-semibold">메인 이미지 *</Label>
                <ImageUploader onImageUploaded={onMainImageUploaded} label="메인 이미지 업로드"/>
                {mainImage && (
                    <div className="mt-2 relative inline-block">
                        <img src={mainImage} alt="메인 이미지 미리보기" className="w-40 h-40 object-cover"/>
                    </div>
                )}
            </div>

            <div className="mb-6">
                <Label className="block mb-2 font-semibold">추가 이미지</Label>
                <ImageUploader onImageUploaded={onAdditionalImageUploaded} label="추가 이미지 업로드"/>

                <div className="flex flex-wrap gap-2 mt-2">
                    {additionalImages.map((img, index) => (
                        <div key={index} className="relative inline-block">
                            <img src={img} alt={`추가 이미지 ${index + 1}`} className="w-24 h-24 object-cover"/>
                            <button
                                type="button"
                                onClick={() => removeAdditionalImage(index)}
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hidden input for all images */}
            {allImages.map((img, i) => (
                <input key={i} type="hidden" name={`images[${i}]`} value={img}/>
            ))}

            <div className="mb-6">
                <Label className={'my-2'}>색상별 재고 관리</Label>
                <ColorVariantInput
                    defaultValue={{}}
                    variants={[]}
                    onChange={handleVariantsChange}
                />
            </div>

            <div className="mb-6">
                <Label>태그</Label>
                <TagsInput onChange={handleTagsChange} defaultValue={tags}/>
                {tags.map((tag, i) => (
                    <input key={i} type="hidden" name={`tags[${i}]`} value={tag}/>
                ))}
            </div>

            <div className="mb-6">
                <Label htmlFor="description" className="block mb-2 font-semibold">상품 설명</Label>
                <Editor name="description"/>
            </div>

            <div className="flex justify-center md:justify-end mt-6 gap-2">
                <Button variant="outline" size="lg" asChild>
                    <Link href="/admin/products">취소</Link>
                </Button>
                <SubmitButton text="상품 등록"/>
            </div>
        </FormContainer>
    );
};

export default ProductCreateForm;