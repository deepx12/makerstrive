import type { ReactNode } from 'react';

const Section = ({ children, className = "" }: { children: ReactNode, className?: string }) => (
    <section className={`h-screen w-full flex flex-col justify-center px-10 max-w-7xl mx-auto ${className}`}>
        {children}
    </section>
);

export const Overlay = () => {
    return (
        <div className="w-full text-white">
            {/* Scroll 0.0 - 0.2: Start (Wide Debris) */}
            <Section className="items-start">
                <h1 className="text-7xl md:text-9xl font-light tracking-tighter">
                    ROBOTICS<br />
                    <span className="font-bold text-primary">& NUCLEAR POWER</span>
                </h1>
                <p className="mt-8 text-xl max-w-md text-gray-400">
                    Redefining autonomous energy infrastructure.
                    Advanced containment for the atomic age.
                </p>
                <div className="mt-12 flex gap-4">
                    <button className="bg-primary text-black px-8 py-3 rounded-none font-bold hover:bg-white transition-colors">
                        EXPLORE TECH
                    </button>
                </div>
            </Section>

            {/* Scroll 0.2 - 0.4: Implosion (Assembly) */}
            <Section className="items-end text-right">
                <div className="max-w-xl">
                    <h2 className="text-5xl font-bold mb-6">/AUTONOMOUS ASSEMBLY</h2>
                    <p className="text-lg text-gray-300">
                        Swarm robotics construct reactor containment fields in high-radiation zones.
                        Zero-latency remote manipulation.
                    </p>
                </div>
            </Section>

            {/* Scroll 0.45 - 0.6: Core Energy (Peak) */}
            <Section className="items-start">
                <div className="max-w-xl bg-black/50 p-8 backdrop-blur-md border-l-2 border-primary">
                    <h2 className="text-5xl font-bold mb-6">/CRITICAL REACTION</h2>
                    <p className="text-lg text-gray-300">
                        Fusion core stability maintained by AI-driven magnetic confinement.
                        Ensuring 99.99% uptime for global energy grids.
                    </p>
                </div>
            </Section>

            {/* Scroll 0.6 - 0.9: Dispersion (Grid) */}
            <Section className="items-center text-center">
                <div className="max-w-2xl">
                    <h2 className="text-5xl font-bold mb-6">/GRID DISPERSION</h2>
                    <p className="text-lg text-gray-300">
                        Wireless power transmission to orbital and terrestrial nodes.
                        Decentralized energy distribution.
                    </p>
                </div>
            </Section>

            {/* Scroll 1.0: End (Void) */}
            <Section className="items-center text-center">
                <h2 className="text-4xl font-bold mb-4 tracking-widest">SUSTAINABLE FUTURE</h2>
                <div className="flex gap-8 justify-center text-gray-400 mt-8">
                    <a href="#" className="hover:text-white transition-colors">CONTACT</a>
                    <a href="#" className="hover:text-white transition-colors">CAREERS</a>
                    <a href="#" className="hover:text-white transition-colors">PRESS</a>
                </div>
            </Section>
        </div>
    );
};
