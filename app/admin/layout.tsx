import React, {ReactNode} from 'react';
import Link from "next/link";

function Layout({children}:{children:ReactNode}) {
    return (
        <div>
            <Link href={'/'}>메인페이지이동</Link>
            {children}
        </div>
    );
}

export default Layout;