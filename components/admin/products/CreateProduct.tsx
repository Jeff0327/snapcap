'use client'
import React, { useState } from 'react';
import Editor from "@/lib/editor/Editor";
import { PlusIcon, XIcon } from "lucide-react";
import useAlert from "@/lib/notiflix/useAlert";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell
} from "@/components/ui/table";
import FormContainer, {FormState} from "@/components/ui/form";
import {ERROR_CODES} from "@/utils/ErrorMessage";

// 이 함수는 서버 액션으로 구현해야 합니다
async function createProduct(formData: FormData): Promise<FormState> {
    // 실제 구현은 서버 액션에서 처리해야 합니다
    return {
        code: ERROR_CODES.SUCCESS,
        message: '상품이 성공적으로 등록되었습니다.'
    }
}

interface ColorOption {
    name: string;
    code: string;
}

interface SizeOption {
    name: string;
}

interface ProductVariant {
    color: string;
    colorCode: string;
    size: string;
    inventory: number;
    isActive: boolean;
}

function ProductForm() {
    const { notify } = useAlert();
    const router = useRouter();
    const [colorOptions, setColorOptions] = useState<ColorOption[]>([
        { name: '블랙', code: '#000000' }
    ]);
    const [sizeOptions, setSizeOptions] = useState<SizeOption[]>([
        { name: 'S' }
    ]);
    const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');

    // 폼 제출 결과 처리
    const handleResult = (formState: FormState) => {
        if (formState.code === ERROR_CODES.SUCCESS) {
            notify.success(formState.message);
            router.push('/admin/products'); // 상품 목록으로 이동
        } else {
            notify.failure(formState.message);
        }
    }

    // 색상 옵션 추가
    const addColorOption = () => {
        setColorOptions([...colorOptions, { name: '', code: '#ffffff' }]);
    }

    // 색상 옵션 제거
    const removeColorOption = (index: number) => {
        setColorOptions(colorOptions.filter((_, i) => i !== index));
    }

    // 사이즈 옵션 추가
    const addSizeOption = () => {
        setSizeOptions([...sizeOptions, { name: '' }]);
    }

    // 사이즈 옵션 제거
    const removeSizeOption = (index: number) => {
        setSizeOptions(sizeOptions.filter((_, i) => i !== index));
    }

    // 상품 바리에이션 생성
    const generateVariants = () => {
        const variants: ProductVariant[] = [];

        colorOptions.forEach(color => {
            sizeOptions.forEach(size => {
                variants.push({
                    color: color.name,
                    colorCode: color.code,
                    size: size.name,
                    inventory: 0,
                    isActive: true
                });
            });
        });

        setProductVariants(variants);
    }

    // 이미지 URL 추가
    const handleAddImage = () => {
        setImages([...images, '']);
    }

    // 이미지 URL 업데이트
    const handleImageChange = (index: number, value: string) => {
        const newImages = [...images];
        newImages[index] = value;
        setImages(newImages);
    }

    // 이미지 URL 제거
    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    }

    // 태그 추가
    const handleAddTag = () => {
        if (currentTag.trim() !== '' && !tags.includes(currentTag.trim())) {
            setTags([...tags, currentTag.trim()]);
            setCurrentTag('');
        }
    }

    // 태그 제거
    const handleRemoveTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    }

    // 바리에이션 인벤토리 업데이트
    const updateVariantInventory = (index: number, value: number) => {
        const newVariants = [...productVariants];
        newVariants[index].inventory = value;
        setProductVariants(newVariants);
    }

    // 바리에이션 활성화 상태 업데이트
    const updateVariantActive = (index: number, value: boolean) => {
        const newVariants = [...productVariants];
        newVariants[index].isActive = value;
        setProductVariants(newVariants);
    }

    return (
        <FormContainer action={createProduct} onResult={handleResult} >
            <h1 className="text-2xl font-bold">상품 등록</h1>

            {/* 기본 정보 섹션 */}
            <div className="space-y-4 p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold border-b pb-2">기본 정보</h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">상품명 *</Label>
                        <Input type="text" id="name" name="name" required placeholder="상품명을 입력하세요" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="상품 가격">상품가격</Label>
                        <Input type="text" id="sku" name="sku" placeholder="상품 가격을 입력하세요" />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="price">판매가 *</Label>
                        <Input type="number" id="price" name="price" required placeholder="0" min="0" step="100" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sale_price">할인가</Label>
                        <Input type="number" id="sale_price" name="sale_price" placeholder="0" min="0" step="100" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">상품 설명</Label>
                    <Editor name="description" />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>상품 활성화</Label>
                        <Switch name="is_active" defaultChecked />
                    </div>
                    <p className="text-sm text-gray-500">활성화된 상품만 쇼핑몰에 표시됩니다</p>
                </div>
            </div>

            {/* 이미지 섹션 */}
            <div className="space-y-4 p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold border-b pb-2">상품 이미지</h2>

                {images.map((image, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <Input
                            type="text"
                            value={image}
                            onChange={(e) => handleImageChange(index, e.target.value)}
                            placeholder="이미지 URL을 입력하세요"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveImage(index)}
                        >
                            <XIcon className="h-4 w-4" />
                        </Button>
                        <input type="hidden" name={`images[${index}]`} value={image} />
                    </div>
                ))}

                <Button type="button" variant="outline" onClick={handleAddImage} className="mt-2">
                    <PlusIcon className="h-4 w-4 mr-2" /> 이미지 추가
                </Button>
            </div>

            {/* 태그 섹션 */}
            <div className="space-y-4 p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold border-b pb-2">태그</h2>

                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag, index) => (
                        <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                            <span>{tag}</span>
                            <button
                                type="button"
                                onClick={() => handleRemoveTag(index)}
                                className="ml-2 text-gray-500 hover:text-gray-700"
                            >
                                <XIcon className="h-4 w-4" />
                            </button>
                            <input type="hidden" name={`tags[${index}]`} value={tag} />
                        </div>
                    ))}
                </div>

                <div className="flex space-x-2">
                    <Input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        placeholder="태그를 입력하세요"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button type="button" onClick={handleAddTag}>추가</Button>
                </div>
            </div>

            {/* 옵션 섹션 */}
            <div className="space-y-4 p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold border-b pb-2">상품 옵션</h2>

                {/* 색상 옵션 */}
                <div className="space-y-4">
                    <h3 className="font-medium">색상 옵션</h3>

                    {colorOptions.map((color, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <Input
                                type="text"
                                value={color.name}
                                onChange={(e) => {
                                    const newColors = [...colorOptions];
                                    newColors[index].name = e.target.value;
                                    setColorOptions(newColors);
                                }}
                                placeholder="색상명"
                                className="flex-1"
                            />
                            <Input
                                type="color"
                                value={color.code}
                                onChange={(e) => {
                                    const newColors = [...colorOptions];
                                    newColors[index].code = e.target.value;
                                    setColorOptions(newColors);
                                }}
                                className="w-20"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeColorOption(index)}
                            >
                                <XIcon className="h-4 w-4" />
                            </Button>
                            <input type="hidden" name={`colors[${index}].name`} value={color.name} />
                            <input type="hidden" name={`colors[${index}].code`} value={color.code} />
                        </div>
                    ))}

                    <Button type="button" variant="outline" onClick={addColorOption}>
                        <PlusIcon className="h-4 w-4 mr-2" /> 색상 추가
                    </Button>
                </div>

                {/* 사이즈 옵션 */}
                <div className="space-y-4 mt-6">
                    <h3 className="font-medium">사이즈 옵션</h3>

                    {sizeOptions.map((size, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <Input
                                type="text"
                                value={size.name}
                                onChange={(e) => {
                                    const newSizes = [...sizeOptions];
                                    newSizes[index].name = e.target.value;
                                    setSizeOptions(newSizes);
                                }}
                                placeholder="사이즈"
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeSizeOption(index)}
                            >
                                <XIcon className="h-4 w-4" />
                            </Button>
                            <input type="hidden" name={`sizes[${index}]`} value={size.name} />
                        </div>
                    ))}

                    <Button type="button" variant="outline" onClick={addSizeOption}>
                        <PlusIcon className="h-4 w-4 mr-2" /> 사이즈 추가
                    </Button>
                </div>

                <div className="mt-6">
                    <Button
                        type="button"
                        onClick={generateVariants}
                        className="my-4"
                    >
                        바리에이션 생성
                    </Button>

                    {productVariants.length > 0 && (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>색상</TableHead>
                                        <TableHead>사이즈</TableHead>
                                        <TableHead>재고</TableHead>
                                        <TableHead>활성화</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {productVariants.map((variant, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className="w-4 h-4 rounded-full"
                                                        style={{ backgroundColor: variant.colorCode }}
                                                    ></div>
                                                    <span>{variant.color}</span>
                                                </div>
                                                <input type="hidden" name={`variants[${index}].color`} value={variant.color} />
                                                <input type="hidden" name={`variants[${index}].colorCode`} value={variant.colorCode} />
                                            </TableCell>
                                            <TableCell>
                                                {variant.size}
                                                <input type="hidden" name={`variants[${index}].size`} value={variant.size} />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={variant.inventory}
                                                    onChange={(e) => updateVariantInventory(index, parseInt(e.target.value))}
                                                    min="0"
                                                    className="w-24"
                                                    name={`variants[${index}].inventory`}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={variant.isActive}
                                                    onCheckedChange={(checked) => updateVariantActive(index, checked)}
                                                    name={`variants[${index}].isActive`}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>

            {/* 총 재고 (자동 계산) */}
            <div className="p-6 bg-white rounded-lg shadow">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">총 재고</h2>
                    <div className="text-xl font-bold">
                        {productVariants.reduce((sum, variant) => sum + variant.inventory, 0)}
                    </div>
                    <input
                        type="hidden"
                        name="inventory"
                        value={productVariants.reduce((sum, variant) => sum + variant.inventory, 0)}
                    />
                </div>
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-end">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="mr-2"
                >
                    취소
                </Button>
                <Button type="submit">상품 등록</Button>
            </div>
        </FormContainer>
    );
}

export default ProductForm;