import React from 'react';
import Navbar from '@/components/ui-custom/Navbar';
import Footer from '@/components/ui-custom/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pb-12 md:px-6 md:pb-16 pt-36">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg mb-6">Last Updated: {new Date().toLocaleDateString('de-DE')}</p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">1. Introduction</h2>
            <p>
              Welcome to Turtle Turning Pages. These Terms of Service ("Terms") govern your use of the Turtle Turning Pages website and services. By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access our services.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">2. Company Information</h2>
            <p>
              Turtle Turning Pages is operated by:
            </p>
            <p>
              Turtle Turning Pages GmbH<br />
              Musterstraße 123<br />
              10115 Berlin<br />
              Germany<br />
              Email: info@turtleturningpages.com<br />
              Commercial Register: Amtsgericht Berlin-Charlottenburg, HRB 123456<br />
              VAT ID: DE123456789<br />
              Managing Directors: [Name of Managing Directors]
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">3. Account Registration</h2>
            <p>
              To use certain features of our services, you must register for an account. You must provide accurate, current, and complete information during the registration process. You are responsible for safeguarding your account credentials and for any activities under your account.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">4. Book Exchange Service</h2>
            <p>
              Turtle Turning Pages provides a platform for users to exchange books with other users. We do not guarantee the condition, quality, or authenticity of books listed on our platform. Users are solely responsible for the accuracy of their book listings and the condition of books they offer to exchange.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">5. User Conduct</h2>
            <p>
              When using our services, you agree not to:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Submit false or misleading information</li>
              <li>Upload or share any content that is illegal, harmful, or offensive</li>
              <li>Attempt to gain unauthorized access to our systems or interfere with the services</li>
              <li>Use our services for any illegal or unauthorized purpose</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">6. Intellectual Property Rights</h2>
            <p>
              The content, features, and functionality of our services are owned by Turtle Turning Pages and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of our services without our explicit permission.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">7. User Content</h2>
            <p>
              By posting content on our platform, you grant us a non-exclusive, royalty-free, worldwide license to use, store, display, reproduce, and distribute that content in connection with our services. You represent and warrant that you have all necessary rights to grant this license.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Turtle Turning Pages shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">9. Warranty Disclaimer</h2>
            <p>
              Our services are provided "as is" and "as available" without warranties of any kind, either express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the updated Terms on our website. Your continued use of our services after such modifications constitutes your acceptance of the revised Terms.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">11. Termination</h2>
            <p>
              We may terminate or suspend your account and access to our services immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use our services will cease immediately.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Germany, without regard to its conflict of law provisions. Any legal action or proceeding arising out of or relating to these Terms shall be brought exclusively in the courts of Berlin, Germany, and you consent to the personal jurisdiction of such courts.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">13. Online Dispute Resolution</h2>
            <p>
              The European Commission provides a platform for online dispute resolution (ODR), which can be accessed at <a href="https://ec.europa.eu/consumers/odr" className="text-book-accent hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>. We are neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration board.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">14. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the Terms will otherwise remain in full force and effect.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">15. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p>
              Turtle Turning Pages GmbH<br />
              Musterstraße 123<br />
              10115 Berlin<br />
              Germany<br />
              Email: legal@turtleturningpages.com
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsOfService; 