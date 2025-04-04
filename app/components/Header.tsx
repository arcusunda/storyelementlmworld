"use client"

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRandomMuerto } from '@/utils/muertos';
import { useState } from 'react';

const Header = () => {
  const router = useRouter();
  const handleRandomMuerto = useRandomMuerto(router);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className="header-container">
      <div className="header-content">
        <div className="w-full flex justify-between items-center">
          {/* Mobile menu button */}
          <button 
            className="lg:hidden z-10" 
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-6 items-center">
            <Link
              href="/"
              className="nav-link"
            >
              Home
            </Link>
            <Link
              href="/losmuertosworld"
              className="nav-link"
            >
              Trait Catalog
            </Link>
            
            <button
              onClick={handleRandomMuerto}
              className="nav-link"
            >
              <span>Muerto Chat</span>
            </button>
            
            <Link
              href="/assets"
              className="nav-button inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
            >
              Muerto Storytime
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
            <Link
              href="/losmuertosworld/backstories"
              className="nav-link"
            >
              Backstories
            </Link>
            <Link
              href="/losmuertosworld/refinedstoryelements"
              className="nav-link"
            >
              Story Elements
            </Link>
            <Link
              href="/license"
              className="nav-link"
            >
              License your IP
            </Link>
            <Link
              href="/thevioletreaches"
              className="nav-link"
            >
              The Violet Reaches
            </Link>
          </nav>

          {/* Mobile Navigation Overlay */}
          {isMenuOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-80 z-50 lg:hidden">
              <div className="flex flex-col items-center justify-center h-full">
                <nav className="flex flex-col gap-6 items-center">
                  <Link
                    href="/"
                    className="nav-link text-xl"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/losmuertosworld"
                    className="nav-link text-xl"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Trait Catalog
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleRandomMuerto();
                      setIsMenuOpen(false);
                    }}
                    className="nav-link text-xl"
                  >
                    <span>Muerto Chat</span>
                  </button>
                  
                  <Link
                    href="/assets"
                    className="nav-button text-xl inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Muerto Storytime
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                  <Link
                    href="/losmuertosworld/backstories"
                    className="nav-link text-xl"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Backstories
                  </Link>
                  <Link
                    href="/losmuertosworld/refinedstoryelements"
                    className="nav-link text-xl"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Story Elements
                  </Link>
                  <Link
                    href="/license"
                    className="nav-link text-xl"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    License your IP
                  </Link>
                  <Link
                    href="/thevioletreaches"
                    className="nav-link text-xl"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    The Violet Reaches
                  </Link>
                </nav>
              </div>
            </div>
          )}

          <div className="flex items-center ml-auto">
            <a
              href="https://twitter.com/StoryElementAI"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Follow us on X (formerly Twitter)"
            >
              <Image
                src="/X_logo.jpg"
                alt="X (formerly Twitter) icon"
                width={40}
                height={40}
                className="object-contain"
              />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;