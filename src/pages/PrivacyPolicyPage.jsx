import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-brand-black font-inter text-white pt-6 md:pt-10 pb-24 md:pb-20 px-4 md:px-8">
      <div className="max-w-[900px] mx-auto">
        {/* Top Back Navigation Button */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141414] border border-white/20 text-white hover:border-white text-xs font-bold uppercase transition-all shadow-lg"
          >
            <ArrowLeft size={15} />
            <span>Back to Store</span>
          </Link>
        </div>

        {/* Header Hero */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#161616] via-[#121212] to-[#161616] border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl mb-8"
        >
          <div className="flex items-center gap-2 text-brand-red text-xs font-bold uppercase mb-2">
            <ShieldCheck size={16} />
            <span>MONTARAW DATA PROTECTION</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase leading-tight">
            PRIVACY POLICY & DATA SECURITY
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-2">
            Last Updated: January 2025 • Effective for all Montaraw Atelier clientele & digital storefront visitors.
          </p>
        </motion.div>

        {/* Content Sections */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#121212] border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-xs sm:text-sm leading-relaxed text-gray-200"
        >
          {/* Section 1 */}
          <section className="space-y-2.5">
            <h2 className="text-base sm:text-lg font-black text-white uppercase flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-brand-red font-mono">01.</span> Commitment to Client Privacy
            </h2>
            <p>
              At <strong>MONTARAW</strong>, we respect your privacy and are committed to safeguarding the personal data you share with our atelier. This Privacy Policy details how we collect, utilize, store, and protect your information when you browse our lookbook, create a customer profile, or purchase our luxury garments.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-white uppercase flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-brand-red font-mono">02.</span> Information We Collect
            </h2>
            <p>
              We collect information necessary to fulfill orders and provide an uncompromising atelier experience:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-4 bg-[#181818] border border-white/10 rounded-2xl">
                <span className="text-white font-bold block mb-1 uppercase text-xs">Customer Profile Data</span>
                <p className="text-gray-300 text-xs">Full Name, Email address, Contact phone number, and Saved delivery addresses.</p>
              </div>
              <div className="p-4 bg-[#181818] border border-white/10 rounded-2xl">
                <span className="text-white font-bold block mb-1 uppercase text-xs">Garment Order History</span>
                <p className="text-gray-300 text-xs">Items ordered, selected sizes, colorways, shipping preferences, and tracking IDs.</p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-2.5">
            <h2 className="text-base sm:text-lg font-black text-white uppercase flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-brand-red font-mono">03.</span> 256-Bit Payment Encryption
            </h2>
            <p>
              All online transactions (UPI, Credit/Debit Cards, Net Banking) are processed via secure, PCI-DSS compliant payment gateways with bank-grade 256-bit SSL encryption. <strong>MONTARAW does NOT store your debit/credit card numbers or CVV codes on our servers.</strong>
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2.5">
            <h2 className="text-base sm:text-lg font-black text-white uppercase flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-brand-red font-mono">04.</span> How We Use Your Data
            </h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-brand-red shrink-0 mt-0.5" />
                <span><strong>Order Fulfillment & Logistics:</strong> Processing payments, packaging garments, and dispatching via express courier partners with live SMS/email tracking.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-brand-red shrink-0 mt-0.5" />
                <span><strong>Client Support:</strong> Assisting with sizing guidance, order alterations, exchanges, and returns.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-brand-red shrink-0 mt-0.5" />
                <span><strong>VIP Drops & Lookbook Alerts:</strong> Notifying opted-in clientele regarding limited-edition streetwear drops and archive sales.</span>
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-2.5">
            <h2 className="text-base sm:text-lg font-black text-white uppercase flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-brand-red font-mono">05.</span> Zero Third-Party Data Selling
            </h2>
            <p>
              We maintain a strict zero-tolerance policy against selling, renting, or trading client data to third-party advertisers. Your information is strictly utilized within the Montaraw ecosystem and our verified fulfillment logistics partners.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2.5">
            <h2 className="text-base sm:text-lg font-black text-white uppercase flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-brand-red font-mono">06.</span> Data Rights & Contact Concierge
            </h2>
            <p>
              You possess the right to access, update, or request permanent deletion of your customer profile and saved addresses at any time. For privacy inquiries or data requests, contact our privacy desk:
            </p>
            <div className="p-4 bg-[#181818] border border-white/15 rounded-2xl mt-2 text-xs">
              <p className="text-white font-bold">MONTARAW PRIVACY DESK</p>
              <p className="text-gray-300 mt-0.5">
                Email: <a href="mailto:montarawsupport@gmail.com" className="text-white hover:text-brand-red font-bold underline transition-colors">montarawsupport@gmail.com</a>
              </p>
              <p className="text-gray-300">
                Helpline: <a href="tel:+916206424372" className="text-white hover:text-brand-red font-bold underline transition-colors">+91 62064 24372</a>
              </p>
              <p className="text-gray-300">Address: Flat No. 102, GAZAWALI, SARWAT, Muzzafarnagar, Uttar Pradesh 251002</p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
