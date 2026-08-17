import React, { useContext, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { DataContext } from '../context/DataContext';

export default function Contact() {
  const { data } = useContext(DataContext);
  const { content } = data;

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Message from ${formData.name}`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
    const targetEmail = import.meta.env.VITE_CONTACT_EMAIL || 'contact@example.com';
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <footer id="contact" className="bg-canvas border-b border-brand/10">
      <div className="px-6 md:px-10 max-w-[1400px] mx-auto py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-16 md:gap-8">
          
          {/* Left: Massive Typography */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand/40 mb-6 whitespace-pre-line">
              {content.contactLabel}
            </p>
            <h2 className="text-6xl sm:text-8xl md:text-9xl font-black uppercase tracking-tighter text-brand leading-[0.85] whitespace-pre-line">
              {content.contactHeadline}
            </h2>
            <p className="mt-8 text-lg font-light text-brand/60 max-w-sm whitespace-pre-line">
              {content.contactSubcopy}
            </p>
          </div>

          {/* Right: Stark Form */}
          <div className="flex flex-col justify-end">
            <form onSubmit={handleSubmit} className="flex flex-col border-t border-brand/20">
              <input
                type="text"
                placeholder="NAME"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-transparent border-b border-brand/20 px-0 py-6 text-xl font-bold uppercase tracking-widest text-brand placeholder:text-brand/30 outline-none focus:border-accent transition-colors rounded-none"
              />
              <input
                type="email"
                placeholder="EMAIL"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-transparent border-b border-brand/20 px-0 py-6 text-xl font-bold uppercase tracking-widest text-brand placeholder:text-brand/30 outline-none focus:border-accent transition-colors rounded-none"
              />
              <textarea
                placeholder="MESSAGE"
                rows={3}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-transparent border-b border-brand/20 px-0 py-6 text-xl font-bold uppercase tracking-widest text-brand placeholder:text-brand/30 outline-none focus:border-accent transition-colors rounded-none resize-none"
              />
              <button
                type="submit"
                className="group flex items-center justify-between w-full py-8 text-2xl font-black uppercase tracking-tighter text-brand hover:text-accent transition-colors"
              >
                Send Message
                <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Clean Footer Bottom */}
      <div className="border-t border-brand/10">
        <div className="px-6 md:px-10 max-w-[1400px] mx-auto py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-widest text-brand/40 whitespace-pre-line">
            {content.footerCopyright}
          </p>
          
          <div className="flex gap-6">
            {['Instagram', 'LinkedIn', 'Discord', 'GitHub'].map((social) => (
              <a
                key={social}
                href="#"
                rel="noopener noreferrer"
                target="_blank"
                className="text-xs font-bold uppercase tracking-widest text-brand/40 hover:text-brand transition-colors"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
