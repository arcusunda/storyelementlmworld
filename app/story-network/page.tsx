import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';

const StoryNetwork: NextPage = () => {
  return (
    <>
      <Head>
        <title>Story Element | Los Muertos World</title>
        <meta name="description" content="Explore how Story Element for Los Muertos World integrates with Story Network to create a decentralized narrative ecosystem" />
      </Head>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Header />
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold mb-8 text-purple-400">Features Delivered & Future Vision</h1>

          <div className="my-8 flex justify-center">
            <Image
              src="/images/story-element-diagram.svg"
              width={900}
              height={580}
              alt="StoryElement for Los Muertos World ecosystem diagram"
              className="rounded-lg shadow-xl"
            />
          </div>

          <div className="space-y-8 text-gray-200">
            <section>
              <p>
                Story Element for Los Muertos World aims to expand the Los Muertos universe beyond a 10K PFP NFT collection into an expansive narrative ecosystem. Our vision includes integration with Story Network, a groundbreaking blockchain infrastructure designed specifically for intellectual property management.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">StoryElement.ai: Current Features</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-purple-300">AI Vision</strong>: Our AI agents analyze the entire collection&apos;s traits, creating detailed visual descriptions and a comprehensive trait dataset
                </li>
                <li>
                  <strong className="text-purple-300">Muerto Chat</strong>: Engage in conversations with any Muerto in the collection, bringing these characters to life
                </li>
                <li>
                  <strong className="text-purple-300">Muerto Storytime</strong>: Holders can craft rich backstories for their Muertos using our trait dataset and Los Muertos World lore
                </li>
                <li>
                  <strong className="text-purple-300">Trait Analytics</strong>: Access detailed trait rarity data and market analytics all in one place
                </li>
                <li>
                  <strong className="text-purple-300">Price Tracking</strong>: Monitor current price trends from a trait perspective to better understand the collection&apos;s market dynamics
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">Specialized AI Agents</h2>
              <p className="mb-4">
                StoryElement.ai is developing specialized AI agents that serve critical roles in ensuring quality and value in the Los Muertos narrative ecosystem:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/70 p-4 rounded-lg border border-purple-700">
                  <h3 className="text-lg font-medium mb-2 text-purple-300">Los Muertos World Scholar</h3>
                  <p className="text-gray-300 mb-3">
                    The AI Scholar specializes in Los Muertos World canon and ensures all generated narrative elements maintain consistency with the established universe.
                  </p>
                  <ul className="list-disc pl-6 text-gray-300 space-y-1">
                    <li>Validates backstories against established lore</li>
                    <li>Identifies potential narrative inconsistencies</li>
                    <li>Suggests refinements to align content with Los Muertos World</li>
                    <li>Helps preserve the integrity of the shared universe</li>
                  </ul>
                </div>

                <div className="bg-gray-800/70 p-4 rounded-lg border border-purple-700">
                  <h3 className="text-lg font-medium mb-2 text-purple-300">Story Network Specialist</h3>
                  <p className="text-gray-300 mb-3">
                    This specialist focuses on maximizing the value of narrative elements as IP assets within the Story Network ecosystem.
                  </p>
                  <ul className="list-disc pl-6 text-gray-300 space-y-1">
                    <li>Evaluates narrative elements for IP asset potential</li>
                    <li>Recommends structural improvements to increase value</li>
                    <li>Ensures IP assets are properly formatted for registration</li>
                    <li>Identifies licensing opportunities</li>
                  </ul>
                </div>
              </div>

              <p className="mt-4 text-gray-300">
                Together, these specialized AI agents create a validation pipeline that ensures every story element is both canonically consistent and optimized for value as intellectual property.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">Technical Infrastructure</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-purple-300">Application</strong>: Modern Next.js application deployed on Vercel Pro for high availability and performance
                </li>
                <li>
                  <strong className="text-purple-300">Version Control</strong>: Full source code management via GitHub with industry-standard development practices
                </li>
                <li>
                  <strong className="text-purple-300">Data Storage</strong>: MongoDB Atlas Flex plan for automatic scaling, ensuring cost efficiency and seamless performance for apps with unpredictable workloads
                </li>
                <li>
                  <strong className="text-purple-300">Decentralized Storage</strong>: Once vetted by AI agents trained on Los Muertos World canon and the Story Network ecosystem, Story Elements will be stored permanently on IPFS and registered as IP Assets on the Story Network blockchain
                </li>
                <li>
                  <strong className="text-purple-300">AI Generation</strong>: Integration with Anthropic API using the latest <i>Claude 3.7 Sonnet</i> model for state-of-the-art narrative generation
                </li>
                <li>
                  <strong className="text-purple-300">Blockchain Access</strong>: Reown (formerly WalletConnect) for secure wallet connections and Alchemy for reliable blockchain data access
                </li>
                <li>
                  <strong className="text-purple-300">IPFS Integration</strong>: Pinata for efficient accessing and serving of decentralized IPFS data
                </li>
                <li>
                  <strong className="text-purple-300">Trusted Engineering</strong>: Developed by seasoned veteran of the software industry, specializing in blockchain and AI solutions
                </li>
              </ul>
              <p className="mt-3">
                This enterprise-level infrastructure ensures reliability, security, and scalability as the project grows and evolves alongside the Story Network ecosystem.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">What is Story Network?</h2>
              <p className="mb-3">
                Story Network is a decentralized intellectual property network that transforms how creators register, protect, and monetize their creative assets. Think of it as a universal layer for IP management that works across digital ecosystems.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">How Will This Benefit Los Muertos World?</h2>

              <h3 className="text-lg font-medium mb-2 text-purple-300">For Muertos Holders</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <strong>IP Ownership</strong>: Register your Muerto&apos;s backstory and creative elements as verifiable IP assets
                </li>
                <li>
                  <strong>Monetization Opportunities</strong>: Set licensing terms for your story elements, characters, and world-building assets
                </li>
                <li>
                  <strong>Collaborative Storytelling</strong>: Safely collaborate with other holders while retaining rights to your contributions
                </li>
              </ul>

              <h3 className="text-lg font-medium mb-2 text-purple-300">For The Community</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Expanding Universe</strong>: Every story element expands the shared universe, enriching the narrative ecosystem
                </li>
                <li>
                  <strong>Cross-Media Development</strong>: Enable seamless expansion into other media formats with proper attribution
                </li>
                <li>
                  <strong>Community Governance</strong>: Participate in decisions about narrative direction through decentralized voting
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">Development Concept</h2>

              <h3 className="text-lg font-medium mb-2 text-purple-300">Phase 1: Core Infrastructure (In Progress)</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Building Story Element interfaces to connect with Story Network framework</li>
                <li>Implementing backstory generation and visualization tools</li>
                <li>Developing basic IP registration capabilities for Muertos holders</li>
                <li>Prototyping the Los Muertos World AI Scholar validation system</li>
              </ul>

              <h3 className="text-lg font-medium mb-2 text-purple-300">Phase 2: Advanced Features</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Enhanced AI systems for narrative refinement and connections</li>
                <li>Full deployment of the Los Muertos World AI Scholar and Story Network Specialist</li>
                <li>Integrated validation pipeline for narrative content</li>
                <li>Community marketplace for licensing and collaboration</li>
                <li>Launch of participatory governance mechanisms</li>
              </ul>

              <h3 className="text-lg font-medium mb-2 text-purple-300">Phase 3: Ecosystem Expansion</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>APIs for third-party applications to integrate with the Los Muertos universe</li>
                <li>Cross-media development tools for community creators</li>
                <li>Advanced curation systems powered by specialized AI agents</li>
                <li>Comprehensive analytics on universe growth and story element usage</li>
                <li>Expanded specialized Muerto roles for different narrative contexts</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">The Bigger Picture</h2>
              <p className="mb-3">
                Story Element for Los Muertos World seeks to demonstrate how Story Network can enable a new model of interactive, decentralized storytelling—one where ownership and creativity work together. This infrastructure creates a foundation where holders can shape and contribute to an evolving narrative universe.
              </p>
              <p className="mb-3">
                The specialized AI agents—the Los Muertos World Scholar and Story Network Specialist—represent a crucial innovation in this ecosystem. By creating AI validators that ensure both narrative consistency and IP value optimization, we establish a scalable approach to quality control that can grow with the community while maintaining the integrity of the Los Muertos World.
              </p>
              <p>
                As more story elements are registered, validated, and refined through this system, the shared Los Muertos universe becomes richer and more valuable to everyone participating in it. The protocol handles complex relationships between story elements, ensures proper attribution, and enables fair compensation when elements are used or built upon—all with the expertise of specialized AI agents helping to guide the process.
              </p>
            </section>

            <div className="my-8 flex justify-center">
              <Image
                src="/images/features-delivered.jpg"
                width={1000}
                height={422}
                alt="StoryElement for Los Muertos World ecosystem diagram"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>

          <div className="mt-12 border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-300">
              Learn more about {' '}
              <a href="https://www.story.foundation/" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                Story Network
              </a>
            </p>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8 text-center">
          <p>
            For additional inquiries about StoryElement.ai, please{' '}
            <a href="mailto:contact@naturalmotion.io" className="text-blue-400 hover:underline">
              Contact us
            </a>.
          </p>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default StoryNetwork;