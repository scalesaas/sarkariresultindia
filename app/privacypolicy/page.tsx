import React from 'react';
import { Shield, Mail, Calendar } from 'lucide-react';

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 space-y-8">
            
            {/* Introduction */}
            <section className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base sm:text-lg">
                Thank you for visiting <span className="font-semibold text-blue-600 dark:text-blue-400">Ashish Rohilla's Platform</span>, 
                dedicated to providing free resources for learning software development and DevOps. Your privacy is important to us, 
                and we are committed to protecting any personal information you may provide while using our website.
              </p>
            </section>

            {/* Information Collection */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                Information We Collect
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  When you visit our platform, we may collect certain information automatically, including your IP address, 
                  browser type, operating system, and other technical details. We may also collect information through cookies 
                  and similar technologies to enhance your browsing experience and analyze website traffic.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  If you choose to subscribe to our newsletter or contact us through our website, we may collect personal 
                  information such as your name and email address.
                </p>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                How We Use Your Information
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We use the information we collect to improve the content and functionality of our website, personalize your 
                  experience, and communicate with you about updates, tutorials, and other relevant information. We may also 
                  use aggregated data for analytical purposes to better serve our community.
                </p>
              </div>
            </section>

            {/* Third Party Links */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <div className="w-2 h-8 bg-yellow-500 rounded-full"></div>
                Third-Party Links
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Our website may contain links to third-party websites or services that are not operated by us. These 
                  third-party sites have their own privacy policies, and we encourage you to review them before providing 
                  any personal information.
                </p>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <div className="w-2 h-8 bg-red-500 rounded-full"></div>
                Data Security
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We take reasonable measures to protect the security of your personal information and prevent unauthorized 
                  access, disclosure, or alteration. However, please note that no method of transmission over the internet 
                  or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </div>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                Children's Privacy
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Our website is not intended for children under the age of 13, and we do not knowingly collect personal 
                  information from children. If you are a parent or guardian and believe that your child has provided us 
                  with personal information, please contact us immediately, and we will take steps to remove such information 
                  from our records.
                </p>
              </div>
            </section>

            {/* Policy Updates */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
                Updates to this Privacy Policy
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We reserve the right to update or change this privacy policy at any time. Any changes will be posted on 
                  this page with a revised effective date. We encourage you to review this policy periodically for any updates.
                </p>
              </div>
            </section>

            {/* Contact Section */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
                Contact Us
              </h2>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  If you have any questions or concerns about our privacy policy or the handling of your personal information, 
                  please don't hesitate to reach out to us:
                </p>
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                  <Mail className="w-5 h-5" />
                  <a 
                    href="mailto:ashishrohilla510@gmail.com" 
                    className="hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 underline decoration-2 underline-offset-4"
                  >
                    ashishrohilla510@gmail.com
                  </a>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>This privacy policy was last updated June 1, 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;