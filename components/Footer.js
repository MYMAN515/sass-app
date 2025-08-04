'use client';

import Link from 'next/link';
import {
  FaXTwitter, FaInstagram, FaYoutube,
  FaTiktok, FaLinkedin, FaDiscord, FaGithub
} from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="bg-[#0B0F19] text-[#F1F5F9] px-6 md:px-24 py-16 font-sans">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
        <div>
          <h4 className="font-bold text-white mb-3">Products</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/dashboard">Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-3">Tools</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/tryon">Virtual Try-On</Link></li>
            <li><Link href="/enhance">Image Enhancer</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-3">Resources</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/pricing">Pricing</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/privacy-terms">Privacy & Terms</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-3">Social</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><FaXTwitter /> X</li>
            <li className="flex items-center gap-2"><FaLinkedin /> LinkedIn</li>
          </ul>
        </div>
      </div>

      {/* Bottom info */}
      <div className="mt-12 border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center text-sm gap-4">
        <div>
          <p className="text-white font-bold text-lg">🧠 AIStore</p>
          <p className="mt-1 text-gray-400">© 2025 AIStore. All rights reserved.</p>
          <p className="mt-1 text-gray-500">Built with 🤎 from Qais, Jordan | UAE</p>
        </div>

        <div className="flex items-center gap-2 bg-[#22C55E] text-black px-3 py-1 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 bg-black rounded-full inline-block" />
          All systems operational
        </div>
      </div>
    </footer>
  );
}
