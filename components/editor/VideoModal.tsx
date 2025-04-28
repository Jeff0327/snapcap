'use client'
import React,{useState} from 'react'
interface VideoModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (url: string) => void;
}

const VideoModal = ({ show, onClose, onSubmit }: VideoModalProps) => {
    const [url, setUrl] = useState('');

    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gray-400 border border-black rounded-lg p-6 w-96">
                <h3 className="text-lg font-bold mb-4">동영상 URL 입력</h3>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="YouTube URL을 입력하세요"
                    className="w-full p-2 mb-4 border border-red-500 rounded"
                />
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded hover:bg-white/10"
                    >
                        취소
                    </button>
                    <button
                        onClick={() => {
                            onSubmit(url);
                            setUrl('');
                            onClose();
                        }}
                        className="px-4 py-2 rounded hover:bg-white/10"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoModal;