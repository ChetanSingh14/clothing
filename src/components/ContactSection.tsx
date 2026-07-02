"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Check } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAlertStore } from "@/store/useAlertStore";

export default function ContactSection() {
  const companyName = useSettingsStore((state) => state.companyName);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      useAlertStore.getState().showAlert("Please agree to the privacy policy first.");
      return;
    }

    setStatus("sending");
    try {
      // Mock sending message
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus("success");
      setFirstName("");
      setLastName("");
      setEmail("");
      setMessage("");
      setAgreed(false);
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="py-24 bg-brand-bg px-6 sm:px-8 border-t border-brand-charcoal/5">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Contact Details */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-xs font-semibold tracking-widest text-brand-green uppercase"
              >
                get in touch
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl font-semibold tracking-tight text-brand-charcoal sm:text-5xl font-serif mt-2"
              >
                Contact us
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-4 text-sm text-brand-charcoal/60 font-light leading-relaxed max-w-md"
              >
                We'd love to hear from you. Please fill out this form, and we'll reply soon.
              </motion.p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-brand-charcoal/80">
                  <Mail className="h-4 w-4 text-brand-green" />
                  <h4 className="text-sm font-bold tracking-wide">Email</h4>
                </div>
                <p className="text-xs text-brand-charcoal/50 font-light leading-relaxed">
                  Contact us by email, and we will respond shortly.
                </p>
                <p className="text-xs font-semibold text-brand-charcoal hover:text-brand-green transition-colors">
                  support@{companyName.toLowerCase().replace(/[^a-z0-9]/g, "") || "mdfk"}.in
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-brand-charcoal/80">
                  <Phone className="h-4 w-4 text-brand-green" />
                  <h4 className="text-sm font-bold tracking-wide">Phone</h4>
                </div>
                <p className="text-xs text-brand-charcoal/50 font-light leading-relaxed">
                  Call us on weekdays from 9 AM to 5 PM.
                </p>
                <p className="text-xs font-semibold text-brand-charcoal">
                  +91 (222) 333-4444
                </p>
              </div>

              {/* Mobile */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-brand-charcoal/80">
                  <Phone className="h-4 w-4 text-brand-green" />
                  <h4 className="text-sm font-bold tracking-wide">Mobile</h4>
                </div>
                <p className="text-xs text-brand-charcoal/50 font-light leading-relaxed">
                  Support line available from 9 AM to 6 PM daily.
                </p>
                <p className="text-xs font-semibold text-brand-charcoal">
                  +91 98765 43210
                </p>
              </div>

              {/* Office */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-brand-charcoal/80">
                  <MapPin className="h-4 w-4 text-brand-green" />
                  <h4 className="text-sm font-bold tracking-wide">Office</h4>
                </div>
                <p className="text-xs text-brand-charcoal/50 font-light leading-relaxed">
                  Visit our design studio headquarters.
                </p>
                <p className="text-xs font-semibold text-brand-charcoal leading-relaxed">
                  104 Creative Zone, Bandra West,<br />
                  Mumbai, Maharashtra 400050,<br />
                  India
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form Card */}
          <div className="lg:col-span-7 w-full">
            <div className="bg-brand-brown/5 border border-brand-brown/15 rounded-3xl p-8 sm:p-10 shadow-xs">
              <h3 className="text-xl font-semibold tracking-tight text-brand-charcoal font-serif mb-6">
                Write us a message
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="cFirstName">
                      First name *
                    </label>
                    <input
                      type="text"
                      id="cFirstName"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="cLastName">
                      Last name *
                    </label>
                    <input
                      type="text"
                      id="cLastName"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Smith"
                      className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="cEmail">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="cEmail"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@email.com"
                    className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="cMessage">
                    Message *
                  </label>
                  <textarea
                    id="cMessage"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Leave us a message..."
                    className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none resize-none transition-colors"
                  />
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAgreed(!agreed)}
                    className={`mt-0.5 h-4 w-4 rounded flex items-center justify-center border transition-all duration-300 ${
                      agreed 
                        ? 'bg-brand-charcoal border-brand-charcoal text-brand-bg' 
                        : 'border-brand-charcoal/20 bg-transparent'
                    }`}
                  >
                    {agreed && <Check className="h-3 w-3 stroke-[3]" />}
                  </button>
                  <span className="text-xs text-brand-charcoal/60 font-light select-none cursor-pointer" onClick={() => setAgreed(!agreed)}>
                    I agree the Privacy Policy.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-brand-brown text-brand-bg rounded-full py-4 text-xs font-semibold tracking-widest uppercase hover:bg-brand-brown-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-4 flex items-center justify-center gap-2"
                >
                  {status === "sending" ? (
                    <span>Sending...</span>
                  ) : status === "success" ? (
                    <span>Message Sent ✓</span>
                  ) : (
                    <>
                      <span>Send</span>
                      <Send className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
