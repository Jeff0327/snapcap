import React from 'react';
import Link from "next/link";
import {Button} from "@/components/ui/button";

function Footer() {
    return (
        <footer className="py-8 bg-black text-gray-300">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div>
                        <h3 className="mb-4 text-lg font-bold text-white">HAT STORE</h3>
                        <p className="text-sm">최고 품질의 모자를 제공하는 프리미엄 모자 전문점입니다.</p>
                    </div>
                    <div>
                        <h4 className="mb-4 text-sm font-bold text-white">링크</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/about">회사 소개</Link>
                            </li>
                            <li>
                                <Link href="/contact">고객 센터</Link>
                            </li>
                            <li>
                                <Link href="/shipping">배송 정책</Link>
                            </li>
                            <li>
                                <Link href="/returns">교환 및 반품</Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 text-sm font-bold text-white">SNS</h4>
                        인스타
                    </div>
                </div>
                <div className="pt-8 mt-8 text-sm text-center border-t border-gray-800">
                    &copy; {new Date().getFullYear()} HAT STORE. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

export default Footer;