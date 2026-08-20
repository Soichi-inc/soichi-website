import React from "react";

const Footer = () => {
    return (
        <footer className="bg-black text-white py-24 px-6 lg:px-12">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-16 mb-24">
                    <div>
                        <h2 className="text-4xl font-black mb-8">SOICHI</h2>
                        <p className="text-gray-400 font-medium leading-relaxed max-w-md">
                            〒107-0061<br />
                            東京都港区北青山二丁目14番4号
                        </p>
                    </div>
                    <div className="flex flex-col space-y-6 items-start md:items-end uppercase font-bold">
                        <a href="/about.html" className="text-3xl hover:text-gray-400 transition-colors">About</a>
                        <a href="/services.html" className="text-3xl hover:text-gray-400 transition-colors">Services</a>
                        <a href="/news.html" className="text-3xl hover:text-gray-400 transition-colors">News</a>
                        <a href="/contact.html" className="text-3xl hover:text-gray-400 transition-colors">Contact</a>
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <div className="flex flex-col md:flex-row md:space-x-8 items-center mb-4 md:mb-0">
                        <p>&copy; 2025 Soichi, Inc.</p>
                        <a href="/privacy.html" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="/tokushoho.html" className="hover:text-white transition-colors">特定商取引法に基づく表記</a>
                    </div>
                    <p>Technology x Creative</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
