import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PrivacyPolicy: NextPage = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy | Los Muertos World</title>
        <meta name="description" content="Privacy Policy for StoryElement for Los Muertos World - Learn how we protect your data" />
      </Head>
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Header />
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold mb-8 text-purple-400">Privacy Policy</h1>
          
          <div className="space-y-6 text-gray-200">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">Introduction</h2>
              <p>
                Welcome to StoryElement for Los Muertos World. We respect your privacy and are committed to 
                protecting your personal data. This Privacy Policy explains how we collect, 
                use, and safeguard your information when you interact with our platform.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">Data We Collect</h2>
              
              <h3 className="text-lg font-medium mb-2 text-purple-300">Wallet Information</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>
                  <strong>Ethereum Wallet Addresses</strong>: We collect and store public Ethereum 
                  wallet addresses when you connect your wallet to our platform.
                </li>
                <li>
                  <strong>Purpose</strong>: To verify ownership of Los Muertos World NFTs and associate 
                  generated content with the appropriate owner.
                </li>
              </ul>
              
              <h3 className="text-lg font-medium mb-2 text-purple-300">Content Information</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>
                  <strong>Backstories</strong>: We store backstories generated for your Los Muertos World NFTs.
                </li>
                <li>
                  <strong>Tweets</strong>: We store tweets generated from backstories when you use the share functionality.
                </li>
                <li>
                  <strong>Character Names</strong>: We collect and store character names you create or select for your NFTs.
                </li>
              </ul>
              
              <h3 className="text-lg font-medium mb-2 text-purple-300">Technical Information</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Browser Information</strong>: We may collect information about your browser type and version.
                </li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide and improve our services</li>
                <li>Associate generated content with the appropriate NFT and owner</li>
                <li>Ensure only authorized users can create content for owned NFTs</li>
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Protect against unauthorized access</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">Data Retention</h2>
              <p>
                We retain your wallet address and associated content for as long as:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>You continue to use our services</li>
                <li>You own the associated Los Muertos World NFTs</li>
                <li>It&apos;s necessary to fulfill the purposes outlined in this policy</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">Your Rights</h2>
              <p>
                You have the right to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data (subject to our legitimate business needs)</li>
                <li>Opt-out of certain data collection</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect 
                your personal data against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes 
                by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">Special Note on Blockchain Data</h2>
              <p>
                Please be aware that blockchain transactions are public by nature. While we protect 
                the data stored on our servers, any on-chain interactions may be visible to others 
                through blockchain explorers and similar tools.
              </p>
              <p>
                To exercise these rights, please contact us at{' '}
                <a href="mailto:contact@naturalmotion.io" className="text-blue-400 hover:underline">
                contact@naturalmotion.io
                </a>.
              </p>
            </section>
            
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-400">Last Updated: March 6, 2025</p>
          </div>
        </div>
        <Footer />
        </div>
    </>
  );
};

export default PrivacyPolicy;