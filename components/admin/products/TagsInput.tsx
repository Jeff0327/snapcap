'use client';
import React, { useState } from 'react';
import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TagsInputProps {
    onChange: (tags: string[]) => void;
}

const TagsInput = ({ onChange }: TagsInputProps) => {
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');

    const handleAddTag = () => {
        if (currentTag.trim() && !tags.includes(currentTag.trim())) {
            const newTags = [...tags, currentTag.trim()];
            setTags(newTags);
            onChange(newTags);
            setCurrentTag('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleRemoveTag = (indexToRemove: number) => {
        const newTags = tags.filter((_, i) => i !== indexToRemove);
        setTags(newTags);
        onChange(newTags);
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                    <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                        <span>{tag}</span>
                        <button
                            type="button"
                            onClick={() => handleRemoveTag(index)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                            <XIcon className="h-3 w-3" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex space-x-2">
                <Input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="태그 입력 후 Enter 또는 추가 버튼"
                    className="flex-1"
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                >
                    <PlusIcon className="h-4 w-4 mr-1" /> 추가
                </Button>
            </div>
        </div>
    );
};

export default TagsInput;