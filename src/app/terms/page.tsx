"use client";

import React from 'react';
import LegalPage from '@/components/LegalPage';

export default function TermsOfService() {
  return (
    <LegalPage title="Terms of Service">
      <h2>Agreement to Terms</h2>
      <p>
        By accessing or using Aquizi, you agree to be bound by these Terms of Service. If you disagree
        with any part of the terms, you may not access the service.
      </p>

      <h2>Description of Service</h2>
      <p>
        Aquizi is an AI-powered quiz generation platform that allows users to create, take, and share
        quizzes on various topics. Our service uses artificial intelligence to generate quiz content
        based on user input.
      </p>

      <h2>User Accounts</h2>
      <p>
        When you create an account with us, you must provide accurate and complete information. You are
        responsible for safeguarding the password and for all activities that occur under your account.
        You agree to notify us immediately of any unauthorized use of your account.
      </p>

      <h2>User Content</h2>
      <p>
        You retain ownership of any content you submit to our service. By submitting content, you grant
        us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish,
        and display such content in connection with the service.
      </p>
      <p>
        You agree not to submit content that is illegal, offensive, harmful, infringing, or otherwise
        objectionable. We reserve the right to remove any content that violates these terms.
      </p>

      <h2>Intellectual Property</h2>
      <p>
        The service and its original content, features, and functionality are owned by Aquizi and are
        protected by international copyright, trademark, patent, trade secret, and other intellectual
        property laws.
      </p>

      <h2>AI-Generated Content</h2>
      <p>
        Our service uses AI to generate quiz content. While we strive for accuracy, we cannot guarantee
        that AI-generated content will be error-free or suitable for all purposes. You acknowledge that
        AI-generated content may contain inaccuracies or biases.
      </p>

      <h2>Payment Terms</h2>
      <p>
        Some features of our service may require payment. By subscribing to a paid plan, you agree to
        pay all fees in accordance with the pricing and payment terms presented to you. Prices are
        subject to change with notice.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        In no event shall Aquizi, its directors, employees, partners, agents, suppliers, or affiliates
        be liable for any indirect, incidental, special, consequential, or punitive damages, including
        without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting
        from your access to or use of or inability to access or use the service.
      </p>

      <h2>Termination</h2>
      <p>
        We may terminate or suspend your account and access to the service immediately, without prior
        notice or liability, for any reason, including without limitation if you breach the Terms.
      </p>

      <h2>Changes to Terms</h2>
      <p>
        We reserve the right to modify or replace these Terms at any time. We will provide notice of
        changes by posting the updated Terms on this page and updating the &quot;Last updated&quot; date.
      </p>

      <h2>Governing Law</h2>
      <p>
        These Terms shall be governed by the laws of the jurisdiction in which Aquizi operates, without
        regard to its conflict of law provisions.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have any questions about these Terms, please contact us at:
        <br />
        <a href="mailto:contact@aquizi.com" className="text-primary hover:underline">
          contact@aquizi.com
        </a>
      </p>
    </LegalPage>
  );
} 