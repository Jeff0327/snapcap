import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";

interface EmojiPickerProps {
    show: boolean;
    setShow: (show: boolean) => void;
    onEmojiSelect: (emoji: string) => void;
}

const emojiCategories = [
    {
        name: "Smileys",
        emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘']
    },
    {
        name: "Gestures",
        emojis: ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤝', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤟']
    },
    {
        name: "Hearts",
        emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓', '💗']
    },
    {
        name: "Animals",
        emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵']
    },
    {
        name: "Food",
        emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥']
    }
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({
                                                     show,
                                                     setShow,
                                                     onEmojiSelect,
                                                 }) => {
    const pickerRef = useRef<HTMLDivElement | null>(null);
    const [selectedCategory, setSelectedCategory] = React.useState(0);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShow(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [setShow]);

    if (!show) return null;

    const handleEmojiClick = (emoji: string) => {
        onEmojiSelect(emoji);
        setShow(false);
    };

    return (
        <div ref={pickerRef} className="absolute inset-0 bg-black z-10 top-10 border-gray-300 border">
            <div className="flex items-center justify-between border-b-[0.8px] border-zinc-300 h-[40px] w-full">
                <div className="flex items-center h-full w-full overflow-auto no-scrollbar">
                    <Button
                        variant="ghost"
                        className="rounded-none h-full border-r-[0.8px] border-gray-300 hover:text-sub text-gray-300"
                        onClick={()=>setShow(false)}
                    >
                        <ChevronLeftIcon className="h-5 w-5 stroke-[3px]" />
                    </Button>
                    {emojiCategories.map((category, index) => (
                        <button
                            key={index}
                            onClick={(e) => { e.preventDefault(); setSelectedCategory(index)}}
                            className={`${
                                selectedCategory === index && "bg-nc3"
                            } flex items-center justify-center px-4 h-full`}
                        >
                            {category.emojis[0]}
                        </button>
                    ))}
                </div>
            </div>
            <div className="w-full min-h-[320px] max-h-[320px] bg-white overflow-auto">
                <div className="flex flex-wrap justify-start gap-2 p-4">
                    {emojiCategories[selectedCategory].emojis.map((emoji, index) => (
                        <button
                            key={index}
                            onClick={() => handleEmojiClick(emoji)}
                            className="hover:bg-nc3 w-10 h-10 flex items-center justify-center text-2xl rounded"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EmojiPicker;