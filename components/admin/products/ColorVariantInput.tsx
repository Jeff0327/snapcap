'use client';
import React, { useState } from 'react';
import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ColorOption {
    name: string;
    code: string;
}

const ColorVariantInput = () => {
    const [colors, setColors] = useState<ColorOption[]>([
        { name: '블랙', code: '#000000' }
    ]);

    const addColor = () => {
        setColors([...colors, { name: '', code: '#ffffff' }]);
    };

    const removeColor = (index: number) => {
        setColors(colors.filter((_, i) => i !== index));
    };

    const updateColor = (index: number, field: 'name' | 'code', value: string) => {
        const newColors = [...colors];
        newColors[index][field] = value;
        setColors(newColors);
    };

    return (
        <div className="space-y-3">
            {colors.map((color, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <Input
                        type="text"
                        value={color.name}
                        onChange={(e) => updateColor(index, 'name', e.target.value)}
                        placeholder="색상명 (예: 블랙, 화이트)"
                        className="flex-1"
                    />
                    <Input
                        type="color"
                        value={color.code}
                        onChange={(e) => updateColor(index, 'code', e.target.value)}
                        className="w-14 p-1 h-10"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeColor(index)}
                    >
                        <XIcon className="h-4 w-4" />
                    </Button>

                    {/* Hidden inputs for form submission */}
                    <input type="hidden" name={`colors[${index}].name`} value={color.name} />
                    <input type="hidden" name={`colors[${index}].code`} value={color.code} />
                </div>
            ))}

            <Button
                type="button"
                variant="outline"
                onClick={addColor}
                className="mt-2"
            >
                <PlusIcon className="h-4 w-4 mr-2" /> 색상 추가
            </Button>
        </div>
    );
};

export default ColorVariantInput;