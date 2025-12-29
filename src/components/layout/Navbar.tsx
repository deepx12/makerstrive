

export const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center pointer-events-none mix-blend-difference">
            <div className="text-2xl font-bold tracking-tighter text-white pointer-events-auto cursor-pointer">
                HAILSTONE<span className="text-primary">.CLONE</span>
            </div>

            <div className="flex gap-8 items-center pointer-events-auto">
                <a href="#vision" className="text-sm font-medium hover:text-primary transition-colors">/VISION</a>
                <a href="#technology" className="text-sm font-medium hover:text-primary transition-colors">/TECHNOLOGY</a>
                <button className="border border-white/20 px-6 py-2 rounded-full text-sm hover:bg-white hover:text-black transition-all">
                    CONTACT US
                </button>
            </div>
        </nav>
    );
};
