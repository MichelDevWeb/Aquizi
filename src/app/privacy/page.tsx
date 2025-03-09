"use client";

import React from 'react';
import LegalPage from '@/components/LegalPage';

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy">
      <h2>Introduction</h2>
      <p>
        Welcome to Aquizi. We respect your privacy and are committed to protecting your personal data.
        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
        you use our application.
      </p>

      <h2>Information We Collect</h2>
      <p>We may collect several types of information from and about users of our application, including:</p>
      <ul>
        <li>
          <strong>Personal Information:</strong> Email address, name, and profile picture when you register
          using Google or email authentication.
        </li>
        <li>
          <strong>Usage Data:</strong> Information about how you use our application, including quiz topics,
          scores, and interaction patterns.
        </li>
        <li>
          <strong>Device Information:</strong> Information about your device and internet connection, including
          IP address, browser type, and operating system.
        </li>
      </ul>

      <h2>How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide, maintain, and improve our services</li>
        <li>Personalize your experience</li>
        <li>Process transactions</li>
        <li>Send you notifications related to your account</li>
        <li>Monitor usage patterns and analyze trends</li>
        <li>Protect against unauthorized access and legal liability</li>
      </ul>

      <h2>Data Storage and Security</h2>
      <p>
        We use Firebase for authentication and data storage. Your data is stored according to
        Firebase&apos;s security practices and our own security measures. We implement appropriate
        technical and organizational measures to protect your personal data.
      </p>

      <h2>Third-Party Services</h2>
      <p>
        We use third-party services such as Firebase, Stripe, and OpenAI. These services have
        their own privacy policies that govern how they use your information.
      </p>

      <h2>Your Rights</h2>
      <p>Depending on your location, you may have rights regarding your personal data, including:</p>
      <ul>
        <li>Access to your personal data</li>
        <li>Correction of inaccurate data</li>
        <li>Deletion of your data</li>
        <li>Restriction or objection to processing</li>
        <li>Data portability</li>
      </ul>

      <h2>Children&apos;s Privacy</h2>
      <p>
        Our application is not intended for children under 13 years of age. We do not knowingly
        collect personal information from children under 13.
      </p>

      <h2>Changes to This Privacy Policy</h2>
      <p>
        We may update our Privacy Policy from time to time. We will notify you of any changes by
        posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us at:
        <br />
        <a href="mailto:contact@aquizi.com" className="text-primary hover:underline">
          contact@aquizi.com
        </a>
      </p>
    </LegalPage>
  );
} 