import Image from "next/image";

const Testimonials = () => (
  <section id="testimonials" className="py-16 bg-gradient-to-r from-[#ffa53c] to-[#ff6a13]">
    <div className="container mx-auto px-5 sm:px-6 lg:px-10 text-center">
      <h2 className="text-3xl font-bold mb-8 text-white">What Our Customers Are Saying</h2>
      <div className="flex flex-col md:flex-row justify-center items-center gap-6">
        {/* Testimonial 1 */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full md:w-1/3">
          <div className="flex items-center gap-4 mb-4">
            <Image
              src="https://osbgaolfjprzlwkf.public.blob.vercel-storage.com/indian-food-3-5ClSHeD8Xw6XQZAZ8zbX5JCz8zlkFQ.webp"
              alt="Ananya"
              width={500}
              height={500}
              className="rounded-full"
            />
          </div>
          <div>
            <p className="font-semibold pb-3">Ananya, International Student</p>
          </div>
          <p>
            &quot;Cuisine Cart has truly brought me closer to home! I love the home-cooked meals and
            the cultural stories behind them. The chefs are so talented...&quot;
          </p>
        </div>

        {/* Testimonial 2 */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full md:w-1/3">
          <div className="flex items-center gap-4 mb-4">
            <Image
              src="https://osbgaolfjprzlwkf.public.blob.vercel-storage.com/CarlosMuelaSOMA2-9VCnZoRcbmuaBXScd3auJNyZQlIR78.jpg"
              alt="Carlos"
              width={500}
              height={500}
              className="rounded-full"
            />
          </div>
          <div>
            <p className="font-semibold pb-3">Carlos, Worker</p>
          </div>
          <p>
            &quot;The meals are so flavorful and healthy! I’ve saved time, money, and I feel like
            I'm eating food from my own kitchen. I highly recommend this app...&quot;
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default Testimonials;
