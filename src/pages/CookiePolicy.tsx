import React from 'react';
import Navbar from '@/components/ui-custom/Navbar';
import Footer from '@/components/ui-custom/Footer';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pb-12 md:px-6 md:pb-16 pt-36">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-8">Cookie Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg mb-6">Last Updated: {new Date().toLocaleDateString('de-DE')}</p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">1. Introduction</h2>
            <p>
              This Cookie Policy explains how Turtle Turning Pages GmbH ("we", "our", or "us") uses cookies and similar technologies when you visit our website. This policy provides you with clear and comprehensive information about the cookies we use and the purposes for which we use them.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">2. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. Cookies help websites recognize your device and remember certain information about your visit, such as your preferences and settings. They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">3. Types of Cookies We Use</h2>
            <p>We use the following types of cookies on our website:</p>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Essential Cookies</h3>
            <p>
              These cookies are necessary for the website to function properly. They enable basic functions like page navigation, access to secure areas of the website, and authentication. The website cannot function properly without these cookies.
            </p>
            <table className="border-collapse border border-gray-300 my-4 w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Cookie Name</th>
                  <th className="border border-gray-300 p-2 text-left">Purpose</th>
                  <th className="border border-gray-300 p-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">session</td>
                  <td className="border border-gray-300 p-2">Maintains user session and authentication</td>
                  <td className="border border-gray-300 p-2">Session</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">XSRF-TOKEN</td>
                  <td className="border border-gray-300 p-2">Prevents cross-site request forgery</td>
                  <td className="border border-gray-300 p-2">Session</td>
                </tr>
              </tbody>
            </table>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Preference Cookies</h3>
            <p>
              These cookies enable a website to remember information that changes the way the website behaves or looks, like your preferred language or the region you are in.
            </p>
            <table className="border-collapse border border-gray-300 my-4 w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Cookie Name</th>
                  <th className="border border-gray-300 p-2 text-left">Purpose</th>
                  <th className="border border-gray-300 p-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">language</td>
                  <td className="border border-gray-300 p-2">Remembers user language preference</td>
                  <td className="border border-gray-300 p-2">1 year</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">theme</td>
                  <td className="border border-gray-300 p-2">Remembers user theme preference (light/dark)</td>
                  <td className="border border-gray-300 p-2">1 year</td>
                </tr>
              </tbody>
            </table>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Analytics Cookies</h3>
            <p>
              These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. They help us improve the performance and user experience of our website.
            </p>
            <table className="border-collapse border border-gray-300 my-4 w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Cookie Name</th>
                  <th className="border border-gray-300 p-2 text-left">Purpose</th>
                  <th className="border border-gray-300 p-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">_ga</td>
                  <td className="border border-gray-300 p-2">Used by Google Analytics to distinguish users</td>
                  <td className="border border-gray-300 p-2">2 years</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">_gid</td>
                  <td className="border border-gray-300 p-2">Used by Google Analytics to distinguish users</td>
                  <td className="border border-gray-300 p-2">24 hours</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">_gat</td>
                  <td className="border border-gray-300 p-2">Used by Google Analytics to throttle request rate</td>
                  <td className="border border-gray-300 p-2">1 minute</td>
                </tr>
              </tbody>
            </table>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">4. Your Cookie Choices</h2>
            <p>
              When you first visit our website, we will present you with a cookie banner that allows you to accept or decline non-essential cookies. You can change your cookie preferences at any time by clicking on the "Cookie Settings" link in the footer of our website.
            </p>
            <p>
              You can also control cookies through your browser settings. Most web browsers allow you to manage your cookie preferences. You can set your browser to refuse cookies, or to alert you when cookies are being sent. The following links provide information on how to modify cookie settings in common browsers:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li><a href="https://support.google.com/chrome/answer/95647" className="text-book-accent hover:underline" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" className="text-book-accent hover:underline" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-book-accent hover:underline" target="_blank" rel="noopener noreferrer">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-book-accent hover:underline" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
            </ul>
            <p>
              Please note that if you choose to refuse cookies, you may not be able to use the full functionality of our website.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">5. Third-Party Cookies</h2>
            <p>
              Some cookies are placed by third-party services that appear on our pages. We use services from the following third parties that may set cookies on your device:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Google Analytics (for website analytics)</li>
              <li>Cloudflare (for website performance and security)</li>
              <li>Supabase (for authentication and database services)</li>
            </ul>
            <p>
              Please note that we have no access to or control over cookies used by these third parties. We recommend reviewing the privacy and cookie policies of these third parties for more information.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">6. Data Protection</h2>
            <p>
              Information collected via cookies is processed in accordance with our <a href="/privacy-policy" className="text-book-accent hover:underline">Privacy Policy</a>. For more information about how we protect your data, please refer to our Privacy Policy.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">7. Changes to This Cookie Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. Any changes will be posted on this page, and if the changes are significant, we will provide a more prominent notice.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">8. Contact Us</h2>
            <p>
              If you have any questions about our Cookie Policy, please contact us at:
            </p>
            <p>
              Turtle Turning Pages GmbH<br />
              Musterstraße 123<br />
              10115 Berlin<br />
              Germany<br />
              Email: privacy@turtleturningpages.com
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CookiePolicy; 