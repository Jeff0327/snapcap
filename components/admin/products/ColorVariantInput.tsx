'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';

// 색상 변형 타입 정의
interface ColorVariant {
    color: string;
    colorCode: string;
    inventory: number;
}

interface ColorVariantInputProps {
    defaultValue?: any; // 다양한 형태로 들어올 수 있음 (객체, 배열 등)
    variants?: any[]; // variant 정보 (색상별 재고 정보 포함)
    onChange?: (variants: ColorVariant[]) => void;
}

const ColorVariantInput = ({ defaultValue = {}, variants = [], onChange }: ColorVariantInputProps) => {
    const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);

    useEffect(() => {
        // variants 데이터가 있으면 이를 우선 사용
        if (variants && variants.length > 0) {
            // variant 데이터에서 필요한 정보만 추출
            const formattedVariants = variants.map(v => ({
                color: v.color,
                colorCode: v.color_code,
                inventory: v.inventory || 0
            }));
            setColorVariants(formattedVariants);
            return;
        }

        // variants가 없는 경우 defaultValue(colors)에서 색상 정보만 추출
        if (defaultValue && typeof defaultValue === 'object') {
            const initialVariants: ColorVariant[] = [];

            // JSON 형식: { "Red": "#ff0000", "Blue": "#0000ff" }
            if (Object.keys(defaultValue).length > 0) {
                Object.entries(defaultValue).forEach(([color, colorCode]) => {
                    initialVariants.push({
                        color,
                        colorCode: String(colorCode),
                        inventory: 0 // 초기값
                    });
                });
            }

            setColorVariants(initialVariants.length > 0 ? initialVariants : [{ color: '', colorCode: '#000000', inventory: 0 }]);
        } else {
            // 기본값이 없으면 빈 색상 하나로 시작
            setColorVariants([{ color: '', colorCode: '#000000', inventory: 0 }]);
        }
    }, [defaultValue, variants]);

    // 상태 변경 시 onChange 콜백 호출
    useEffect(() => {
        if (onChange && colorVariants.length > 0) {
            onChange(colorVariants);
        }
    }, [colorVariants, onChange]);

    const addVariant = () => {
        setColorVariants([...colorVariants, { color: '', colorCode: '#000000', inventory: 0 }]);
    };

    const removeVariant = (index: number) => {
        setColorVariants(colorVariants.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: keyof ColorVariant, value: string | number) => {
        const newVariants = [...colorVariants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setColorVariants(newVariants);
    };

    // 총 재고 계산
    const totalInventory = colorVariants.reduce((sum, v) => sum + (typeof v.inventory === 'number' ? v.inventory : 0), 0);

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
                                min="0"
                                value={variant.inventory}
                                onChange={(e) => updateVariant(index, 'inventory', parseInt(e.target.value) || 0)}
                                placeholder="0"
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

            {/* 디버깅용 정보 - 개발 완료 후 제거 */}
            <div className="mt-4 px-3 py-2 bg-gray-100 rounded text-sm text-gray-700">
                총 재고: {totalInventory}개 (모든 색상의 재고 합계)
            </div>
        </div>
    );
};

export default ColorVariantInput;