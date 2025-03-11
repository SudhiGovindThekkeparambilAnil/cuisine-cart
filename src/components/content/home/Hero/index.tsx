import Link from "next/link";

const Hero = () => (
  <section
    id="hero"
    className="bg-gradient-to-r from-[#ffa53c] to-[#ff6a13] text-white py-20 text-center">
    <div className="container mx-auto px-5 sm:px-6 lg:px-10">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
        Bringing the Taste of Home Closer
      </h1>
      <p className="text-xl md:text-2xl mb-6">
        Cuisine Cart connects you with local chefs offering authentic home-cooked meals from around
        the world.
      </p>
      <Link
        href="/user-selection"
        className="text-white bg-orange-700 hover:bg-orange-800 font-semibold py-3 px-8 rounded-full shadow-md">
        Get Started
      </Link>
    </div>
  </section>
);

export default Hero;
