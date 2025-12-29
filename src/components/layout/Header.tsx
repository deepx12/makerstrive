export const Header = () => {
    const navItems = ['ROBOTICS', 'NUCLEAR', 'RESEARCH', 'CAREERS']

    return (
        <header className="fixed top-6 left-0 w-full z-40 px-10 flex justify-between items-center pointer-events-none mix-blend-difference text-white">
            {/* Logo Area */}
            <div className="text-2xl font-bold tracking-widest pointer-events-auto cursor-pointer">
                ROBOTICS
            </div>

            {/* Glass Nav Bar */}
            <nav className="pointer-events-auto">
                <ul className="flex gap-2 p-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-full shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
                    {navItems.map((item) => (
                        <li key={item}>
                            <a
                                href={`#${item.toLowerCase()}`}
                                className="block px-6 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 ease-out"
                            >
                                {item}
                            </a>
                        </li>
                    ))}
                    <li className="ml-2">
                        <button className="px-6 py-2 text-sm font-bold bg-white text-black rounded-full hover:bg-gray-200 transition-colors">
                            GET ACCESS
                        </button>
                    </li>
                </ul>
            </nav>
        </header>
    )
}
