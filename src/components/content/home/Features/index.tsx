import Image from "next/image";

const Features = () => (
  <section id="features" className="py-16 bg-orange-100">
    <div className="container mx-auto px-5 sm:px-6 lg:px-10 text-center">
      <h2 className="text-3xl font-bold mb-8">Features</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex justify-center mb-4">
            <Image
              src="https://osbgaolfjprzlwkf.public.blob.vercel-storage.com/home-features-time-36HYLmvrLwnWWyPX6OOabp6BF5mlLA"
              alt="Time and budget icon"
              width={360}
              height={360}
            />
          </div>
          <h3 className="text-xl font-semibold mb-4">Time & Budget Friendly</h3>
          <p>
            Save time on meal prep and avoid expensive groceries, all while enjoying delicious
            home-cooked meals.
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex justify-center mb-4">
            <Image
              src="https://osbgaolfjprzlwkf.public.blob.vercel-storage.com/home-features-healthy-wea3zqBxoFdUdGLso9g5OssSSGQ052"
              alt="Healthy and nutritious icon"
              width={360}
              height={360}
            />
          </div>
          <h3 className="text-xl font-semibold mb-4">Healthy & Nutritious</h3>
          <p>
            Our meals are balanced and nutritious, keeping your health in mind while satisfying your
            cravings.
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex justify-center mb-4">
            <Image
              src="https://osbgaolfjprzlwkf.public.blob.vercel-storage.com/home-features-culture-6zApdb1fRpg91R1HRyFKN6Z5I8WrKR"
              alt="Cultural connection icon"
              width={360}
              height={360}
            />
          </div>
          <h3 className="text-xl font-semibold mb-4">Cultural Connection</h3>
          <p>
            Explore a diverse range of cuisines and connect with different cultures through their
            food traditions.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default Features;
