import React from 'react';
import Navbar from '@/components/ui-custom/Navbar';
import Footer from '@/components/ui-custom/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pb-12 md:px-6 md:pb-16 pt-36">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg mb-6">Last Updated: {new Date().toLocaleDateString('de-DE')}</p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">1. Introduction</h2>
            <p>
              Turtle Turning Pages ("we", "our", or "us") is committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website and services.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">2. Data Controller</h2>
            <p>
              The data controller responsible for your personal data is:
            </p>
            <p>
              Turtle Turning Pages<br />
              Email: privacy@turtleturningpages.com
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">3. Data We Collect</h2>
            <p>We may collect the following categories of personal data:</p>
            <ul className="list-disc pl-6 mb-6">
              <li>Identity Data: name, username, or similar identifier</li>
              <li>Contact Data: email address, telephone number, address</li>
              <li>Technical Data: internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system</li>
              <li>Usage Data: information about how you use our website and services</li>
              <li>Book Preference Data: information about books you own, want to exchange, or your reading preferences</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">4. How We Use Your Data</h2>
            <p>We use your personal data for the following purposes:</p>
            <ul className="list-disc pl-6 mb-6">
              <li>To register you as a new user</li>
              <li>To provide and maintain our services</li>
              <li>To connect you with other users for book exchanges</li>
              <li>To notify you about changes to our service</li>
              <li>To improve our website and user experience</li>
              <li>To communicate with you</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">5. Legal Basis for Processing</h2>
            <p>Under the General Data Protection Regulation (GDPR), we process your personal data based on the following legal grounds:</p>
            <ul className="list-disc pl-6 mb-6">
              <li>Performance of a contract</li>
              <li>Your consent</li>
              <li>Our legitimate interests</li>
              <li>Compliance with legal obligations</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">6. Data Retention</h2>
            <p>
              We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">7. Your Data Protection Rights</h2>
            <p>Under the GDPR, you have the following rights:</p>
            <ul className="list-disc pl-6 mb-6">
              <li>Right to access - You have the right to request copies of your personal data.</li>
              <li>Right to rectification - You have the right to request that we correct any inaccurate information or complete any incomplete information.</li>
              <li>Right to erasure - You have the right to request that we erase your personal data in certain circumstances.</li>
              <li>Right to restrict processing - You have the right to request that we restrict the processing of your personal data in certain circumstances.</li>
              <li>Right to data portability - You have the right to request that we transfer the data we have collected to another organization or directly to you under certain conditions.</li>
              <li>Right to object - You have the right to object to our processing of your personal data in certain circumstances.</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">8. Data Security</h2>
            <p>
              We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">9. Third-Party Service Providers</h2>
            <p>
              We may share your personal data with third-party service providers who perform services on our behalf. All third-party providers are required to respect the security of your personal data and to treat it in accordance with the law.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">10. International Transfers</h2>
            <p>
              We may transfer your personal data to countries outside the European Economic Area (EEA). When we do, we ensure a similar degree of protection is afforded to it by implementing appropriate safeguards.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">11. Cookies</h2>
            <p>
              We use cookies to improve your experience on our website. For detailed information about the cookies we use, please see our <a href="/cookie-policy" className="text-book-accent hover:underline">Cookie Policy</a>.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">13. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
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

export default PrivacyPolicy; 