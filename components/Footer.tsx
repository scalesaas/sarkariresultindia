import React from "react";
import { Github, Linkedin, MessageCircle } from "lucide-react";

export default function Footer() {
	return (
		<footer className="border-t bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
				{/* Main Footer Content */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
					{/* Brand Section */}
					<div className="lg:col-span-2 space-y-6">
						<div className="space-y-4">
							<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
								Ashish Rohilla
							</h1>
							<p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-md leading-relaxed">
								Get the knowledge of Software World and DevOps
							</p>
						</div>
						
						{/* Social Media Links */}
						<div className="flex items-center gap-4">
							<a 
								href="https://github.com" 
								className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
								aria-label="GitHub Profile"
								target="_blank"
								rel="noopener noreferrer"
							>
								<Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />
							</a>
							<a 
								href="https://linkedin.com" 
								className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
								aria-label="LinkedIn Profile"
								target="_blank"
								rel="noopener noreferrer"
							>
								<Linkedin className="w-5 h-5 text-gray-700 dark:text-gray-300" />
							</a>
							<a 
								href="https://discord.com" 
								className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
								aria-label="Discord Server"
								target="_blank"
								rel="noopener noreferrer"
							>
								<MessageCircle className="w-5 h-5 text-gray-700 dark:text-gray-300" />
							</a>
						</div>
					</div>

					{/* Navigation Links */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
							Quick Links
						</h3>
						<nav className="flex flex-col space-y-2">
							<a
								href="/privacypolicy"
								className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 text-sm sm:text-base"
							>
								Privacy Policy
							</a>
							<a
								href="/contactus"
								className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 text-sm sm:text-base"
							>
								Contact Us
							</a>
							<a
								href="/aboutus"
								className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 text-sm sm:text-base"
							>
								About Us
							</a>
							<a
								href="/"
								className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200 text-sm sm:text-base"
							>
								Hire Me
							</a>
						</nav>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
					<div className="flex flex-col sm:flex-row justify-between items-center gap-4">
						<p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
							&copy; 2024 Ashish Rohilla. All rights reserved.
						</p>
						<p className="text-xs text-gray-400 dark:text-gray-500">
							Built with ❤️ for the dev community
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}