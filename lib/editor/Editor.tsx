'use client'
import React, {useState, useEffect, forwardRef, useImperativeHandle, useCallback, useRef} from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { Node } from '@tiptap/core';
import { mergeAttributes } from '@tiptap/core';
import useAlert from "@/lib/notiflix/useAlert";
import Sticker from './Sticker';
import { VideoIcon } from "@/utils/icons/Video";
import { SlPicture } from "react-icons/sl";
import { BoldIcon } from "@/utils/icons/Bold";
import { ItalicIcon } from "@/utils/icons/Italic";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { LuSticker } from "react-icons/lu";
import { HiStrikethrough } from "react-icons/hi2";
import EmojiPicker from "@/lib/editor/EmojiPicker";
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import FontFamily from '@tiptap/extension-font-family';
import FontSize from '@/lib/editor/extentions/FontSize';
import {UnderlineIcon} from "@/utils/icons/Underline";
import { FaAlignCenter } from "react-icons/fa6";
import { FaAlignLeft } from "react-icons/fa6";
import { FaAlignRight } from "react-icons/fa6";
import VideoModal from "@/components/editor/VideoModal";
import {FONT_FAMILIES} from "@/lib/editor/fonts/Fonts";
const Video = Node.create({
    name: 'video',
    group: 'block',
    selectable: true,
    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [{ tag: 'video' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'video',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                controls: 'true',
                class: 'w-full aspect-video rounded-lg',
            }),
        ];
    },
});

interface EditorProps {
    name: string;
    placeholder?: string;
    defaultValue?: string;
    readOnly?: boolean;
    required?: boolean;
}

export interface EditorRef {
    setContent: (content: string) => void;
}

const Editor = forwardRef<EditorRef, EditorProps>(({
                                                       name,
                                                       placeholder = '텍스트를 입력해주세요.',
                                                       defaultValue = '',
                                                       readOnly = false,
                                                       required = false,
                                                   }, ref) => {
    const [content, setContent] = useState(defaultValue || '');
    const [showSticker, setShowSticker] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [stickerLink, setStickerLink] = useState("");
    const [imageLinks, setImageLinks] = useState<string[]>([]);

    const { notify } = useAlert();
    const contentRef = useRef(defaultValue || '');

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            Underline,
            FontFamily,
            FontSize,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto',
                },
            }),
            Youtube.configure({
                HTMLAttributes: {
                    class: 'w-full aspect-video rounded-lg',
                },
            }),
            Video.configure({
                HTMLAttributes: {},
            }),
        ],
        content: defaultValue,
        editorProps: {
            attributes: {
                class: 'prose prose-sm focus:outline-none max-w-full h-full p-2 overflow-visible min-h-[50vh]',
            },
        },
        onUpdate: ({ editor }) => {
            const newContent = editor.getHTML();
            handleChange(newContent);
        },
    });

    const handleChange = useCallback((newContent: string) => {
        // HTML 컨텐츠를 그대로 유지
        contentRef.current = newContent;
        setContent(newContent);

        // hidden input 값 업데이트
        const hiddenInput = document.getElementById(name) as HTMLInputElement;

        if (hiddenInput) {
            hiddenInput.value = newContent;
        }
    }, [name]);

    const handleVideoSubmit = useCallback((url: string) => {
        if (editor && url) {
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                editor.chain().focus().setYoutubeVideo({
                    src: url
                }).run();
            } else {
                editor.chain().focus().insertContent(`
                <video controls class="w-full aspect-video rounded-lg">
                    <source src="${url}" type="video/mp4">
                </video>
            `).run();
            }
        }
    }, [editor]);

    useEffect(() => {
        const imagesInput = document.getElementById('images') as HTMLInputElement;
        if (imagesInput) {
            imagesInput.value = JSON.stringify(imageLinks);
        }
    }, [imageLinks]);

    useImperativeHandle(ref, () => ({
        setContent: (newContent: string) => {
            if (editor) {
                editor.commands.setContent(newContent);
                handleChange(newContent);
            }
        }
    }));


    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && editor) {
            try {
                const formData = new FormData();
                formData.append('files[0]', file);

                const response = await fetch('/api/upload/?action=fileUpload', {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();

                if (result.success && result.data) {
                    setImageLinks(prev => [...prev, result.data]);
                    editor.chain().focus().setImage({ src: result.data }).run();
                } else {
                    notify.failure('업로드 할수 없는 형식입니다.');
                }
            } catch (error) {
                notify.failure('이미지 업로드에 실패했습니다.');
            }
            e.target.value = '';
        }
    }, [editor]);

    useEffect(() => {
        const imagesInput = document.getElementById('images') as HTMLInputElement;
        if (imagesInput) {
            imagesInput.value = JSON.stringify(imageLinks);
        }
    }, [imageLinks]);
    const insertEmoji = (emoji: string) => {
        if (editor) {
            editor.chain().focus().insertContent(emoji).run();
        }
    };

    useEffect(() => {
        if (stickerLink && editor) {
            editor.chain().focus().setImage({ src: stickerLink }).run();
            setStickerLink("");
        }
    }, [stickerLink, editor]);

    // 툴바 부분 수정
    const renderToolbar = () => (
        <div className="border-b border-gray-200 p-1 rounded w-full min-w-[100vw]">
            {/* 첫 번째 줄 - 미디어 도구 */}
            <div className="flex w-full mb-2">
                <label className="rounded hover:bg-white/10 cursor-pointer p-1 mr-1">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                    <SlPicture className="w-5 h-5"/>
                </label>
                <button
                    type="button"
                    onClick={() => setShowVideoModal(true)}
                    className="rounded hover:bg-white/10 p-1 mr-1"
                    title="동영상"
                >
                    <VideoIcon width={20} height={20}/>
                </button>
                <button
                    type="button"
                    onClick={() => setShowSticker(true)}
                    className="rounded hover:bg-white/10 p-1 mr-1"
                    title="이모티콘"
                >
                    <LuSticker className="w-5 h-5"/>
                </button>
                <button
                    type="button"
                    onClick={() => setShowEmoji(true)}
                    className="rounded hover:bg-white/10 p-1"
                    title="이모지"
                >
                    <MdOutlineEmojiEmotions className="w-5 h-5"/>
                </button>
                <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={`rounded hover:bg-white/10 p-1 mr-1 ${editor?.isActive('bold') ? 'bg-white/20' : ''}`}
                >
                    <BoldIcon width={20} height={20}/>
                </button>
                <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                    className={`rounded hover:bg-white/10 p-1 mr-1 ${editor?.isActive('underline') ? 'bg-white/20' : ''}`}
                >
                    <UnderlineIcon width={20} height={20}/>
                </button>
                <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={`rounded hover:bg-white/10 p-1 mr-1 ${editor?.isActive('italic') ? 'bg-white/20' : ''}`}
                >
                    <ItalicIcon width={20} height={20}/>
                </button>
                <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleStrike().run()}
                    className={`rounded hover:bg-white/10 p-1 ${editor?.isActive('strike') ? 'bg-white/20' : ''}`}
                >
                    <HiStrikethrough className="w-5 h-5"/>
                </button>
                <button
                    type="button"
                    onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                    className={`rounded hover:bg-white/10 p-1 mr-1 ${editor?.isActive({textAlign: 'left'}) ? 'bg-white/20' : ''}`}
                >
                    <FaAlignLeft className="w-4 h-4"/>
                </button>
                <button
                    type="button"
                    onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                    className={`rounded hover:bg-white/10 p-1 mr-1 ${editor?.isActive({textAlign: 'center'}) ? 'bg-white/20' : ''}`}
                >
                    <FaAlignCenter className="w-4 h-4"/>
                </button>
                <button
                    type="button"
                    onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                    className={`rounded hover:bg-white/10 p-1 mr-1 ${editor?.isActive({textAlign: 'right'}) ? 'bg-white/20' : ''}`}
                >
                    <FaAlignRight className="w-4 h-4"/>
                </button>
                <input
                    type="color"
                    className="w-7 h-7 rounded cursor-pointer"
                    onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
                />
            </div>
            {/*두번째 줄*/}
            <div className="flex w-full mb-2">

                <select
                    className="border border-gray-300 rounded px-1 py-1 text-sm w-full"
                    onChange={(e) => editor?.chain().focus().setFontFamily(e.target.value).run()}
                >
                    {FONT_FAMILIES.map(font => (
                        <option key={font.value} value={font.value}>
                            {font.label}
                        </option>
                    ))}
                </select>

                <select
                    className="border border-gray-300 rounded px-1 py-1 text-sm w-full"
                    onChange={(e) => editor?.chain().focus().setFontSize(e.target.value).run()}
                >
                    {[12, 14, 16, 18, 20, 24, 28, 32].map(size => (
                        <option key={size} value={`${size}px`}>{size}px</option>
                    ))}
                </select>
            </div>
        </div>
    );


    return (
        <div className="rounded relative w-full border border-gray-300">
            <input
                type="hidden"
                id={name}
                name={name}
                value={content}
                required={required}
            />
            <input
                type="hidden"
                id="images"
                name="images"
                value={JSON.stringify(imageLinks)}
            />

            {!readOnly && renderToolbar()}

            <div className="w-full h-[30vh] max-h-[30vh] overflow-y-auto">
                <EditorContent editor={editor} className="w-full h-full"/>
            </div>

            <Sticker
                show={showSticker}
                setShow={setShowSticker}
                setStickerLink={setStickerLink}
            />
            <EmojiPicker
                show={showEmoji}
                setShow={setShowEmoji}
                onEmojiSelect={insertEmoji}
            />
            <VideoModal
                show={showVideoModal}
                onClose={() => setShowVideoModal(false)}
                onSubmit={handleVideoSubmit}
            />
        </div>
    );
});

Editor.displayName = 'Editor';

export default Editor;