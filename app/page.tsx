'use client';

import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Header from './components/Header';
import Footer from './components/Footer';
import { ArrowRight, Skull, MessageSquare, Palette } from 'lucide-react';
import { useAppKitAccount } from '@reown/appkit/react';
import dynamic from 'next/dynamic';

const ConnectButton = dynamic(
  () => import('./components/ConnectButton'),
  { ssr: false }
);

export default function Home() {
  const { isConnected, address } = useAppKitAccount();

  return (
    <>
      <Head>
        <title>StoryElement for Los Muertos World - Explore the Stories Behind the Traits</title>
        <meta name="description" content="Dive into StoryElement for Los Muertos World with our trait catalog, featuring AI-generated descriptions that bring each trait to life." />
      </Head>

      <div className="min-h-screen flex flex-col">
        <div className="absolute top-4 right-4 z-20">
          <ConnectButton />
        </div>
        
        <Header />
        
        <main className="flex-grow pt-16"> {/* Added padding-top */}
          {/* Banner Section */}
          <div className="relative w-full h-40 mb-16">
            <div className="absolute inset-0 z-0"> {/* Added z-index */}
              <Image 
                src="/muertos-1600.jpg" 
                alt="StoryElement for Los Muertos World Banner" 
                fill
                className="object-cover"
                priority
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-transparent to-gray-900/80" />
            </div>
            
            {/* Banner Content */}
            <div className="relative h-full flex items-center justify-center z-10"> {/* Added z-index */}
              <h1 className="text-4xl md:text-5xl font-bold text-white px-4 text-center drop-shadow-lg">
                Welcome to StoryElement for Los Muertos World
              </h1>
            </div>
          </div>

          {/* Wallet Status - Optional section to show connected wallet status */}
          {isConnected && address && (
            <div className="bg-gray-800 px-4 py-3 mb-4 text-center">
              <p className="text-sm text-gray-300">
                Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
          )}

          {/* Features Section */}
          <div className="bg-gray-900 px-4 pb-16">
            <div className="container mx-auto max-w-6xl">
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm hover:bg-gray-800/70 transition-colors">
                  <Skull className="w-12 h-12 mb-4 text-blue-400" />
                  <h3 className="text-xl font-bold mb-2">Unique Traits</h3>
                  <p className="text-gray-300">Every mask, body, headwear, and expression carries its own distinctive personality.</p>
                </div>
                
                <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm hover:bg-gray-800/70 transition-colors">
                  <MessageSquare className="w-12 h-12 mb-4 text-purple-400" />
                  <h3 className="text-xl font-bold mb-2">AI Chat</h3>
                  <p className="text-gray-300">Have fun conversations with your favorite muerto.</p>
                </div>

                <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm hover:bg-gray-800/70 transition-colors">
                  <Palette className="w-12 h-12 mb-4 text-green-400" />
                  <h3 className="text-xl font-bold mb-2">Rich Lore</h3>
                  <p className="text-gray-300">Get ready for the deep, interconnected stories that will bring each character to life.</p>
                </div>
              </div>

              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Explore the Stories Behind the Traits
                </h2>
                
                <p className="text-lg leading-relaxed mb-8 text-gray-300">
                  Step into <i>StoryElement for Los Muertos World</i>, where every trait tells a story, 
                  and every muerto has a distinct personality etched into their design. 
                  Our <i>trait catalog</i> delves into the unique details of each mask, 
                  body, headwear, and expression, blending darkly intriguing lore with AI-generated 
                  descriptions that invite curiosity and exploration.
                </p>

                <Link 
                  href="/losmuertosworld" 
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg 
                    hover:bg-blue-700 transition-colors text-lg font-medium"
                >
                  Start Exploring
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}