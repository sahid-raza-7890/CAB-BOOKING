import React from 'react';

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 pt-24">
      <div className="max-w-3xl mx-auto premium-glass p-8 rounded-3xl">
        <h1 className="text-3xl font-bold mb-6 text-[#FFD700]">Contact Us</h1>
        <p className="text-gray-300 mb-8">
          We're here to help. Reach out to the Ucab support team and we'll get back to you within 24 hours.
        </p>
        
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input type="email" className="w-full p-3 rounded-xl bg-[#121212] border border-white/10 outline-none focus:border-[#FFD700]" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea className="w-full p-3 rounded-xl bg-[#121212] border border-white/10 outline-none focus:border-[#FFD700]" rows="5" placeholder="How can we help?"></textarea>
          </div>
          <button type="button" className="w-full bg-[#FFD700] text-black py-3 rounded-xl font-bold hover:bg-[#E6C200] transition">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
