import Link from "next/link";
import { Code } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-2 rounded-lg">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900">MANTRIQ</div>
                <div className="text-xs text-gray-500">AI Code Mentor</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">Your AI companion for every line of code.</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard" className="text-gray-600 hover:text-purple-600 transition-colors">Code Assistant</Link></li>
              <li><Link href="/mentor" className="text-gray-600 hover:text-purple-600 transition-colors">Mentor Mode</Link></li>
              <li><Link href="/syllabus" className="text-gray-600 hover:text-purple-600 transition-colors">Syllabus</Link></li>
              <li><Link href="/about" className="text-gray-600 hover:text-purple-600 transition-colors">About</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="text-gray-600 hover:text-purple-600 transition-colors">Contact</Link></li>
              <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Tutorial</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Privacy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Terms</a></li>
              <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">License</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <div>&copy; {new Date().getFullYear()} MANTRIQ. All rights reserved.</div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">GitHub</a>
            <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Twitter</a>
            <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Discord</a>
          </div>
        </div>
      </div>
    </footer>
  );
}