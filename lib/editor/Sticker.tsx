import Image from "next/image";
import React, {useEffect, useRef, useState} from "react";
import {ChevronLeftIcon, ChevronRightIcon} from "lucide-react";
import {Button} from "@/components/ui/button";

interface Sticker {
    id: number;
    type: string;
    length: string;
}

interface StickerHoverProps {
    show: boolean;
    setShow: (show: boolean) => void;
    setStickerLink: (url: string) => void;
}

const stickerData: Sticker[] = [
    { id: 1, type: "png", length: "23" },
    { id: 2, type: "gif", length: "23" },
    { id: 3, type: "png", length: "12" },
    { id: 4, type: "png", length: "39" },
    { id: 5, type: "png", length: "23" },
    { id: 6, type: "png", length: "39" },
    { id: 7, type: "png", length: "21" },
    { id: 8, type: "png", length: "39" },
    { id: 9, type: "png", length: "27" },
    { id: 10, type: "png", length: "15" },
    { id: 11, type: "png", length: "23" },
];

const StickerHover: React.FC<StickerHoverProps> = ({
                                                       show,
                                                       setShow,
                                                       setStickerLink,
                                                   }) => {
    const stickerHoverRef = useRef<HTMLDivElement | null>(null); // Ref to the component's root div
    const [selectSticker, setSelectSticker] = useState<number>(0);
    const [sticker, setSticker] = useState<Sticker>(stickerData[0]);

    useEffect(() => {
        if (selectSticker > 0) {
            const selected = stickerData.find((item) => item.id === selectSticker);
            if (selected) setSticker(selected);
        }
    }, [selectSticker]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (stickerHoverRef.current && !stickerHoverRef.current.contains(event.target as Node)) {
                setShow(false);
            }
        };

        // Add event listener for click events
        document.addEventListener("mousedown", handleClickOutside);

        // Cleanup the event listener on component unmount
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [setShow]);


    const saveStickers = (url: string) => {
        setShow(false);
        setStickerLink(url);
    };

    if (!show) return null;

    return (
        <div ref={stickerHoverRef} className="absolute inset-0 bg-black z-10 top-10 border-gray-300 border ">
            <div className="flex items-center justify-between border-b-[0.8px] border-zinc-300 h-[40px] w-full">
                <div className="flex items-center h-full w-full overflow-auto no-scrollbar">
                    <Button variant={'ghost'}
                            className="rounded-none h-full border-r-[0.8px] border-gray-300 hover:text-sub te text-gray-300"
                            onClick={()=>setShow(false)}>
                        <ChevronLeftIcon className="h-5 w-5 stroke-[3px]"/>
                    </Button>
                    {Array.from({length: stickerData.length}, (_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.preventDefault();
                                setSelectSticker(index + 1)
                            }}
                            className={`${
                                selectSticker === index + 1 && "bg-nc3"
                            } flex items-center justify-center`}
                        >
                            <Image
                                alt={`sticker_icons_${index + 1}`}
                                src={`/sticker/tab/${index + 1}.png`}
                                width={34}
                                height={26}
                                className="w-auto h-auto"
                            />
                        </button>
                    ))}
                </div>
            </div>
            <div className="w-full h-[320px] bg-white overflow-y-auto">
                <div className="flex flex-wrap gap-2 p-4 justify-start">
                    {Array.from({length: parseInt(sticker.length)}, (_, index) => (
                        <button
                            key={index}
                            onClick={() =>
                                saveStickers(`/sticker/${sticker.id}/${index}.${sticker.type}`)
                            }
                            className="flex-none hover:bg-nc3 p-1 rounded"
                        >
                            <Image
                                alt={`sticker_${sticker.id}_icons1_${index}`}
                                src={`/sticker/${sticker.id}/${index}.${sticker.type}`}
                                width={370}
                                height={320}
                                className="w-[100px] h-auto object-contain"
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StickerHover;
