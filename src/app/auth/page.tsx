
import { Metadata } from "next";
import Image from "next/image"

export const metadata: Metadata = {
  title: "About Us | Cuisine Cart",
  description:
    "Cuisine Cart connects international students, workers, and food enthusiasts to home-cooked meals made with love and authenticity.",
};

export default function Auth() {
  return (
    <>
      {/* Hero Section with Gradient */}
      <section className="bg-gradient-to-r from-[#ffa53c] to-[#ff6a13] text-white py-20 text-center">
        <div className="container mx-auto px-5 sm:px-6 lg:px-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Auth Cuisine Cart</h1>
          <p className="text-xl md:text-2xl mb-6">
            Cuisine Cart brings the taste of home closer to you with authentic home-cooked meals
            from local chefs.
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-white text-gray-800">
        <div className="container mx-auto px-5 sm:px-6 lg:px-10 text-center">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="mb-6">
            Cuisine Cart connects international students, workers, and food enthusiasts to
            home-cooked meals made with love and authenticity. Our mission is to make healthy,
            comforting, and affordable meals accessible to everyone wherever they are.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-orange-50">
        <div className="container mx-auto px-5 sm:px-6 lg:px-10 text-center">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <p className="mb-6">
            Cuisine Cart was born from the idea of bringing authentic home-cooked meals to people
            who miss the flavors of their native cultures. Founded by food lovers and home-cooks,
            our platform is designed to connect chefs with customers who crave home-made meals, made
            with fresh and nutritious ingredients.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white text-gray-800">
        <div className="container mx-auto px-5 sm:px-6 lg:px-10 text-center">
          <h2 className="text-3xl font-bold mb-8">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Authenticity</h3>
              <p>
                We believe in the power of authentic home-cooked meals that bring comfort and joy,
                connecting people through food.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Health</h3>
              <p>
                Our meals are balanced and healthy, promoting well-being and nourishing the body
                without compromising on taste.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Community</h3>
              <p>
                We aim to create a supportive community where chefs and food lovers can share and
                experience the joy of home-cooked meals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-orange-100 text-gray-800">
        <div className="container mx-auto px-5 sm:px-6 lg:px-10 text-center">
          <h2 className="text-3xl font-bold mb-6">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <Image
                src="/team1.jpg"
                alt="Team Member"
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Sarah Kim</h3>
              <p className="text-sm">Founder & CEO</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <Image
                src="/team2.jpg"
                alt="Team Member"
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">John Doe</h3>
              <p className="text-sm">Co-Founder & Chief Operations</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <Image
                src="/team3.jpg"
                alt="Team Member"
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Emily Tan</h3>
              <p className="text-sm">Marketing Director</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section with Dark Orange */}
      <section
        id="contact"
        className="py-16 bg-gradient-to-r from-[#ff6a13] to-[#ff4500] text-white">
        <div className="container mx-auto px-5 sm:px-6 lg:px-10 text-center">
          <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
          <p className="mb-6">
            Have questions? Want to learn more about how Cuisine Cart works? We&apos;re here to help!
          </p>
          <a
            href="mailto:support@cuisinecart.com"
            className="bg-orange-800 hover:bg-orange-900 font-semibold py-3 px-8 rounded-full shadow-md">
            Contact Us
          </a>
        </div>
      </section>
    </>
  );
}
