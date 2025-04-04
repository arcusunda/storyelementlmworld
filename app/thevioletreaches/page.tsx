import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import Link from 'next/link';

const VioletReaches: NextPage = () => {
    return (
        <>
            <Head>
                <title>The Violet Reaches | Los Muertos World</title>
                <meta name="description" content="Discover The Violet Reaches - the mystical realm between worlds that serves as the setting for Los Muertos World character backstories and narrative development." />
            </Head>

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <Header />
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-xl">
                    <h1 className="text-3xl font-bold mb-8 text-purple-400">The Violet Reaches</h1>

                    <div className="my-8 flex justify-center">
                        <Image
                            src="/images/the_violet_reaches.jpeg"
                            width={1000}
                            height={333}
                            alt="The ethereal landscape of The Violet Reaches"
                            className="rounded-lg shadow-xl"
                        />
                    </div>

                    <div className="space-y-8 text-gray-200">
                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">A Realm Between Worlds</h2>
                            <p className="mb-4">
                            <i>The Violet Reaches</i> is the first StoryElement.ai narrative context available to Los Muertos World holders, offering a rich foundation for character development and storytelling. If all goes well, additional contexts will become available, each providing unique settings and opportunities for your muertos to inhabit.
                            </p>
                            <p className="mb-4">
                            <i>The Violet Reaches</i> is an ethereal dimension that exists between the living world and what lies beyond - a shimmering reflection of Valley del Sol (the fictional setting of the novel <i>Valley of Ancient Fires</i>) transformed by otherworldly energies.
                            </p>
                            <p>
                                To enter this realm is to experience reality dissolving into a liquid vortex of color before solidifying into a landscape both familiar and alien. Overhead stretches an impossible violet sky where lavender clouds drift, filtering emerald light across the rolling hills. The familiar geography of Valley del Sol is recognizable—the ridges of the Fire Peaks, the contours of the valley—yet everything shimmers with otherworldly splendor.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">The Landscape</h2>
                            <p className="mb-3">
                                The flora here exists in heightened, luminous states: oak trees with leaves that flutter in odd rhythms, their serrated edges tinted azure; thick grass threaded with violet and gold that emits its own inner light and releases crisp, sweet aromas when touched; delicate bell-shaped blossoms that peel open when approached, releasing haunting chimes like tiny bells.
                            </p>
                            <p className="mb-3">
                                Most remarkable are the transformed vesper trees, their bark gleaming like polished mahogany, bearing fruit that glows from within—not the sunset-hued vesicles of the mortal world, but clusters of sky-blue spheres or ruby-red pods that shine like precious gems.
                            </p>
                            <p>
                                The fauna too exists in altered states—emerald squirrels with tufted lynx-like ears, deer with flowing azure manes and tails that trail light as they move. The air itself feels perfumed with exotic blooms just beyond sight, and at times carries half-heard whispers when no one seems to be speaking.
                            </p>
                        </section>

                        <section className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex flex-col md:flex-row max-w-3xl">
                                <div className="md:w-1/5 flex justify-center mb-4 md:mb-0 md:mr-6">
                                <div className="w-[250px] h-[355px] relative">
                                    <Image
                                    src="/images/valley-of-ancient-fires.jpg"
                                    alt="Valley of Ancient Fires book cover"
                                    width={250}
                                    height={355}
                                    className="rounded-md shadow-lg object-contain"
                                    priority
                                    />
                                </div>
                                </div>
                                <div className="md:w-4/5">
                                <h2 className="text-xl font-semibold mb-3 text-white">From the Novel</h2>
                                <p className="mb-3">
                                    First introduced in the novel <i>Valley of Ancient Fires</i> (publishing announcement forthcoming), The Violet Reaches serves as a mystical realm accessible only to those with special connections to Valley del Sol. In the novel, it&apos;s described as a place:
                                </p>
                                <blockquote className="pl-4 border-l-4 border-purple-500 italic text-purple-300 my-4">
                                    <p>...where the veil between worlds thins, allowing a worthy few to cross the boundary and walk beneath its ethereal violet skies.</p>
                                </blockquote>
                                <p className="mb-3">
                                    The realm features transformed versions of Valley del Sol&apos;s landmarks and flora - oak trees with azure-tinted leaves, grass threaded with violet and gold that emits its own inner light, and most distinctively, the altered vesper trees with bark gleaming like polished mahogany bearing fruit that glows from within.
                                </p>
                                <p>
                                    In <i>Valley of Ancient Fires</i>, this realm serves as both a haven for ancestral spirits and a place where the guardian spirit Gabinus dwells, watching over the valley and occasionally communing with those pure of heart who discover hidden pathways to this dimension.
                                </p>
                                </div>
                            </div>
                            </section>
                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">For Muerto Holders</h2>
                            <p className="mb-3">
                                The Violet Reaches provides the first narrative context for your Los Muertos World NFT. As a holder, this rich setting allows you to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    <strong className="text-purple-300">Create Unique Backstories</strong>: Let AI develop your muerto&apos;s history, detailing who they were in life (within this particular narrative context), how they came to The Violet Reaches, and what role they&apos;ve taken in this afterlife realm
                                </li>
                                <li>
                                    <strong className="text-purple-300">Likewise, create Unique Story Elements</strong>: Let AI develop story elements related to your muerto&apos;s backstory in The Violet Reaches
                                </li>
                                <li>
                                    <strong className="text-purple-300">Contribute to Worldbuilding</strong>: Help expand this shared universe by adding locations, customs, or elements that enhance The Violet Reaches
                                </li>
                            </ul>
                            <p className="mt-4">
                                While your muerto&apos;s visual traits (Mask, Body, Headwear, Expression) are fixed by the NFT itself, The Violet Reaches context allows for interpretation of these visual elements and for weaving them into a compelling character narrative.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">Story Network Integration</h2>
                            <p className="mb-3">
                                The Violet Reaches serves as an ideal narrative framework for Story Network integration, offering several advantages:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    <strong className="text-purple-300">Structured IP Framework</strong>: The established regions, factions, and mechanics of The Violet Reaches provide clear boundaries and relationships for IP registration
                                </li>
                                <li>
                                    <strong className="text-purple-300">Composable Narrative Elements</strong>: Backstories and story elements associated with your muerto within The Violet Reaches can be registered as distinct IP assets that reference and build upon each other
                                </li>
                                <li>
                                    <strong className="text-purple-300">IP Protection</strong>: Individual character backstories and narrative elements can be registered on Story Network, establishing verifiable ownership
                                </li>
                                <li>
                                    <strong className="text-purple-300">Derivative Works Potential</strong>: The rich setting creates opportunities for derivative content across media forms, with clear licensing and attribution paths
                                </li>
                            </ul>
                            <p className="mt-4">
                                When you develop your muerto&apos;s backstory within The Violet Reaches context, our specialized AI agents—The Violet Reaches Scholar and Story Network Specialist—will help ensure your narrative is both canonically consistent and optimized for registration as IP assets on Story Network.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">Getting Started</h2>
                            <p className="mb-3">
                                Ready to bring your muerto to life within The Violet Reaches? Here are your next steps:
                            </p>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>
                                    <strong className="text-purple-300">Access StoryElement.ai</strong>: Log in with your wallet containing your Los Muertos World NFT
                                </li>
                                <li>
                                    <strong className="text-purple-300">Select Your Muerto</strong>: Choose which of your muertos you want to develop a backstory for
                                </li>
                                <li>
                                    <strong className="text-purple-300">Explore Visual Traits</strong>: Checkout your muerto&apos;s Mask, Body, Headwear, and Expression descriptions
                                </li>
                                <li>
                                    <strong className="text-purple-300">Generate Backstory</strong>: Lean on our generative AI tools to create your muerto&apos;s history and role within The Violet Reaches
                                </li>
                                <li>
                                    <strong className="text-purple-300">Story Element refinement</strong>: Allow our specialized AI agents to ensure your story elements align with The Violet Reaches canon
                                </li>
                                <li>
                                    <strong className="text-purple-300">Register as IP</strong>: Once refined, assessed, and finalized, register your story elements as IP assets on Story Network
                                </li>
                            </ol>
                            <p className="mt-4">
                                Through this process, you&apos;ll not only create a rich character narrative but also establish verifiable ownership of your muerto&apos;s contribution to the Los Muertos World ecosystem.
                            </p>
                        </section>
                    </div>

                    <div className="mt-12 border-t border-gray-700 pt-8 text-center">
                        <p className="text-gray-300">
                            Start crafting your muerto&apos;s story in <i>The Violet Reaches</i> today.
                        </p>
                    </div>

        {/* Testnet Notice Banner */}
        <div className="mt-8 mb-8 bg-gray-800/80 border border-blue-500/30 rounded-xl p-4 shadow-lg text-center">
          <div className="flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-bold text-blue-400">Testnet Environment</span>
          </div>
          <p className="text-gray-300">
            Currently, licensing occurs on Story Network&apos;s{' '}
            <Link 
              href="https://docs.story.foundation/network/network-info/aeneid" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-blue-400 hover:underline"
            >
              Aeneid Testnet
            </Link>
            . Before we launch to Mainnet, transactions are for testing purposes only and do not involve real assets or value. For now, enjoy your stories, try our IP registration process, and stay tuned for updates about Mainnet launch!
          </p>
        </div>

                </div>
                <Footer />
            </div>
        </>
    );
};

export default VioletReaches;