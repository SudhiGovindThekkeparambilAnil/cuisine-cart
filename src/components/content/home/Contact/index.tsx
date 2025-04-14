import Image from "next/image";

const Contact = () => (
  <section id="contact" className="relative py-16 text-white">
    {/* Background Image */}
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src="https://osbgaolfjprzlwkf.public.blob.vercel-storage.com/mohid-tahir-xzMzj-ug42Q-unsplash-pw9MF5Bt4ZKmwLgFnspemdxh7v6bCj.jpg"
        alt="Contact background"
        layout="fill"
        objectFit="cover"
        objectPosition="center"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#ff6a13] to-[#ff4500] opacity-20" />
    </div>

    <div className="relative container mx-auto px-5 sm:px-6 lg:px-10 text-center">
      <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
      <p className="mb-6">
        Have questions? Want to learn more about how Cuisine Cart works? We’re here to help!
      </p>
      <a
        href="mailto:support@cuisinecart.com"
        className="bg-orange-800 hover:bg-orange-900 font-semibold py-3 px-8 rounded-full shadow-md">
        Contact Us
      </a>
    </div>
  </section>
);

export default Contact;
