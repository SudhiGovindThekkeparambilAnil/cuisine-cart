import Image from "next/image";
import Link from "next/link";

const Hero = () => (
  <section id="hero" className="relative text-white py-20 text-center">
    {/* Background Image */}
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src="https://osbgaolfjprzlwkf.public.blob.vercel-storage.com/home-hero-cover-uESxZjQgNBgsLu0g9XYgbs7UeBM2SO"
        alt="Delicious spread of food"
        layout="fill"
        objectFit="cover"
        objectPosition="center"
        priority
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#ac5d00] to-[#ff6a13] opacity-40" />
    </div>

    {/* Hero Content */}
    <div className="relative container mx-auto px-5 sm:px-6 lg:px-10">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
        Bringing the Taste of Home Closer
      </h1>
      <p className="text-xl md:text-2xl mb-6">
        Cuisine Cart connects you with local chefs offering authentic home-cooked meals from around
        the world.
      </p>
      <Link
        href="/user-selection"
        className="inline-block text-white bg-orange-700 hover:bg-orange-800 font-semibold py-3 px-8 rounded-full shadow-md">
        Get Started
      </Link>
    </div>
  </section>
);

export default Hero;
