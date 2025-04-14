import Image from "next/image";

const About = () => (
  <section id="about" className="py-16 bg-white text-gray-800">
    <div className="container mx-auto px-5 sm:px-6 lg:px-10">
      <h2 className="text-3xl font-bold mb-6 text-center">About Cuisine Cart</h2>
      <div className="flex flex-col md:flex-row items-center gap-10">
        {/* Text Section */}
        <div className="md:w-1/2 space-y-6">
          <p>
            Cuisine Cart is more than just a food delivery service. It’s a bridge that connects
            international students, workers, and food enthusiasts with local chefs who prepare
            authentic home-cooked meals.
          </p>
          <p>
            Our goal is to make healthy, comforting, and affordable meals accessible to everyone.
            From homemade Hyderabadi Biryani to South Indian Sambar, experience the flavors of
            traditional home-cooked food from local kitchens near you.
          </p>
        </div>

        {/* Image Section */}
        <div className="md:w-1/2 flex flex-col items-center">
          <Image
            src="https://osbgaolfjprzlwkf.public.blob.vercel-storage.com/chef-in-kitchen-gsye7qM3fghoegl91haWp1tejTNoou"
            alt="Chef cooking in a kitchen"
            width={300}
            height={200}
            className="rounded-lg shadow-md object-cover"
          />
        </div>
      </div>
    </div>
  </section>
);

export default About;
