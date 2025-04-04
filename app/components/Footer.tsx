// components/Footer.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface FooterProps {
  className?: string;
  customText?: string;
}

const Footer: React.FC<FooterProps> = ({
  className = '',
}) => {
  return (
    <footer className={`footer-container py-4 ${className}`}>
      <div className="footer-content container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <p className="footer-text my-2">
            © {new Date().getFullYear()} Story Element for Los Muertos World
          </p>
          <div className="flex items-center gap-6">
            <Link 
              href="/thevioletreaches"
              className="text-sm text-gray-400 hover:text-white transition-colors border-r border-gray-600 pr-6"
            >
              The Violet Reaches
            </Link>
            <a
              href="mailto:contact@naturalmotion.io"
              className="text-sm text-gray-400 hover:text-white transition-colors border-r border-gray-600 pr-6"
            >
              Contact
            </a>
            <Link 
              href="/privacy-policy"
              className="text-sm text-gray-400 hover:text-white transition-colors border-r border-gray-600 pr-6"
            >
              Privacy Policy
            </Link>
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
                className="object-contain rounded"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;