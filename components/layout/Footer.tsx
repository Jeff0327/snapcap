import React from 'react';
import Link from "next/link";
import BusinessCheck from "@/components/layout/BusinessCheck";
import {FaInstagram} from "react-icons/fa";
import {FaYoutube} from "react-icons/fa";

function Footer() {

    return (
        <footer className="py-8 bg-black text-gray-300">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className={'flex flex-col'}>
                        <h3 className="mb-4 text-2xl font-bold text-white">스냅캡</h3>
                        <BusinessCheck/>
                    </div>
                    <div>
                        <h4 className="mb-4 text-sm font-bold text-white">SNS</h4>
                        <div className={'flex flex-row items-center gap-2'}>
                            <FaInstagram className={'w-5 h-5'}/>
                            <FaYoutube className={'w-5 h-5'}/>
                        </div>
                    </div>
                    <div>
                        <h4 className="mb-4 text-sm font-bold text-white">고객센터</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/contact/help">고객 센터</Link>
                            </li>
                            <li>
                                <Link href="/contact/deliver">배송 정책</Link>
                            </li>
                            <li>
                                <Link href="/contact/exchange">교환 및 반품</Link>
                            </li>
                        </ul>
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