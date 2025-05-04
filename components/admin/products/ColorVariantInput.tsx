'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import {ColorVariant} from "@/types";

interface ColorVariantInputProps {
    defaultValue?: any;
    variants?: any[];
    onChange?: (variants: ColorVariant[]) => void;
}

const ColorVariantInput = ({ defaultValue = {}, variants = [], onChange }: ColorVariantInputProps) => {
    const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);
    const isInitialMount = useRef(true);

    // 첫 번째 useEffect: 초기 데이터 로드 (한 번만 실행)
    useEffect(() => {
        // variants 데이터가 있으면 이를 우선 사용
        if (variants && variants.length > 0) {
            const formattedVariants = variants.map(v => ({
                color: v.color,
                colorCode: v.color_code,
                inventory: v.inventory || ''
            }));
            setColorVariants(formattedVariants);
            return;
        }

        // variants가 없는 경우 defaultValue에서 색상 정보만 추출
        if (defaultValue && typeof defaultValue === 'object') {
            const initialVariants: ColorVariant[] = [];

            if (Object.keys(defaultValue).length > 0) {
                Object.entries(defaultValue).forEach(([color, colorCode]) => {
                    initialVariants.push({
                        color,
                        colorCode: String(colorCode),
                        inventory: ''
                    });
                });
            }

            setColorVariants(initialVariants.length > 0 ? initialVariants : [{ color: '', colorCode: '#000000', inventory: '' }]);
        } else {
            // 기본값이 없으면 빈 색상 하나로 시작
            setColorVariants([{ color: '', colorCode: '#000000', inventory: '' }]);
        }
    }, []); // 의존성 배열을 비워서 컴포넌트 마운트 시 한 번만 실행

    // 두 번째 useEffect: onChange 호출 (colorVariants가 변경될 때만)
    useEffect(() => {
        // 초기 마운트 시에는 onChange를 호출하지 않음
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // colorVariants가 변경됐을 때만 onChange 호출
        if (onChange && colorVariants.length > 0) {
            onChange(colorVariants);
        }
    }, [colorVariants]); // onChange는 의존성 배열에서 제거

    const addVariant = () => {
        setColorVariants([...colorVariants, { color: '', colorCode: '#000000', inventory: '' }]);
    };

    const removeVariant = (index: number) => {
        setColorVariants(colorVariants.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: keyof ColorVariant, value: string | number) => {
        const newVariants = [...colorVariants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setColorVariants(newVariants);
    };

    // 총 재고 계산 (빈 문자열은 0으로 처리)
    const totalInventory = colorVariants.reduce((sum, v) => {
        const inventory = v.inventory === '' ? 0 : Number(v.inventory);
        return sum + (isNaN(inventory) ? 0 : inventory);
    }, 0);

    return (
        <div className="space-y-4">
            {colorVariants.map((variant, index) => (
                <div
                    key={index}
                    className="p-4 border rounded-md bg-gray-50 relative"
                >
                    {colorVariants.length > 1 && (
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => removeVariant(index)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
                        <div>
                            <Label htmlFor={`color-${index}`}>색상명 *</Label>
                            <Input
                                id={`color-${index}`}
                                value={variant.color}
                                onChange={(e) => updateVariant(index, 'color', e.target.value)}
                                placeholder="예: 빨강, 블루"
                                required
                            />
                            <input
                                type="hidden"
                                name={`variants[${index}][color]`}
                                value={variant.color}
                            />
                        </div>

                        <div>
                            <Label htmlFor={`colorCode-${index}`}>색상 코드</Label>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id={`colorCode-${index}`}
                                    value={variant.colorCode}
                                    onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
                                    placeholder="#RRGGBB"
                                    className="flex-1"
                                />
                                <Input
                                    type="color"
                                    value={variant.colorCode}
                                    onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
                                    className="w-14 p-1 h-10"
                                />
                            </div>
                            <input
                                type="hidden"
                                name={`variants[${index}][colorCode]`}
                                value={variant.colorCode}
                            />
                        </div>

                        <div>
                            <Label htmlFor={`inventory-${index}`}>재고 수량 *</Label>
                            <Input
                                id={`inventory-${index}`}
                                type="number"
                                value={variant.inventory}
                                onChange={(e) => updateVariant(index, 'inventory', e.target.value)}
                                required
                            />
                            <input
                                type="hidden"
                                name={`variants[${index}][inventory]`}
                                value={variant.inventory}
                            />
                        </div>
                    </div>
                </div>
            ))}

            <Button
                type="button"
                variant="outline"
                onClick={addVariant}
                className="w-full"
            >
                <Plus className="h-4 w-4 mr-2" /> 색상 추가
            </Button>

            {/* 총 재고 숨겨진 필드 */}
            <input
                type="hidden"
                name="inventory"
                value={totalInventory}
            />
        </div>
    );
};

export default ColorVariantInput;