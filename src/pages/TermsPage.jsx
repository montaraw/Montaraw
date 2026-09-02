import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, RefreshCw, Truck } from 'lucide-react';

export default function TermsPage() {
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
            <FileText size={16} />
            <span>MONTARAW TERMS OF SERVICE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase leading-tight">
            TERMS OF ATELIER & CONDITIONS
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-2">
            Effective Date: January 2025 • Governing the purchase of Montaraw streetwear garments, couture dresses, and atelier services.
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
              <span className="text-brand-red font-mono">01.</span> General Agreement
            </h2>
            <p>
              By accessing the <strong>MONTARAW</strong> website or placing an order through our digital storefront, you agree to be bound by these Terms of Atelier. These terms apply to all visitors, registered customer accounts, and patrons purchasing our garments.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-white uppercase flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-brand-red font-mono">02.</span> Product Authenticity & Heavyweight Standards
            </h2>
            <p>
              Every Montaraw piece is engineered from curated raw textiles:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 bg-[#181818] border border-white/10 rounded-2xl">
                <span className="text-white font-bold block mb-1 uppercase text-xs">240 GSM Cotton</span>
                <p className="text-gray-300 text-xs">Combed heavyweight drop shoulder silhouettes with pre-shrunk bio-wash.</p>
              </div>
              <div className="p-3.5 bg-[#181818] border border-white/10 rounded-2xl">
                <span className="text-white font-bold block mb-1 uppercase text-xs">380 GSM Fleece</span>
                <p className="text-gray-300 text-xs">Thermal heavy fleece hoodies with double-lined structural hoods.</p>
              </div>
              <div className="p-3.5 bg-[#181818] border border-white/10 rounded-2xl">
                <span className="text-white font-bold block mb-1 uppercase text-xs">Couture Partywear</span>
                <p className="text-gray-300 text-xs">Sculpted velvet, silk blends, and tailored midi/maxi cocktail gowns.</p>
              </div>
            </div>
            <p className="text-gray-300 text-xs mt-1">
              *While we strive for precise digital color accuracy, slight color variations may occur depending on display calibrations.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2.5">
            <h2 className="text-base sm:text-lg font-black text-white uppercase flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-brand-red font-mono">03.</span> Orders, Pricing & Taxes
            </h2>
            <p>
              All prices listed on Montaraw are inclusive of applicable GST. We reserve the right to revise catalog pricing, apply discount coupons (e.g. <strong>MONTARAW10</strong>), and manage limited drops. Orders are confirmed upon successful payment or valid Cash on Delivery (COD) authentication.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-white uppercase flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-brand-red font-mono">04.</span> Shipping & Express Delivery
            </h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2.5">
                <Truck size={16} className="text-brand-red shrink-0 mt-0.5" />
                <span><strong>Dispatch Timeline:</strong> Orders are packaged and dispatched from our atelier within 24 to 48 business hours.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Truck size={16} className="text-brand-red shrink-0 mt-0.5" />
                <span><strong>Transit Time:</strong> Metro cities (Mumbai, Delhi NCR, Bangalore) receive delivery in 2–3 business days. Rest of India in 4–6 business days.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Truck size={16} className="text-brand-red shrink-0 mt-0.5" />
                <span><strong>Free Shipping:</strong> Complimentary express shipping across India on all orders exceeding ₹1,999.</span>
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-white uppercase flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-brand-red font-mono">05.</span> 7-Day Hassle-Free Exchange & Return Policy
            </h2>
            <p>
              We want you to love your fit. If the garment size or silhouette does not match your expectations:
            </p>
            <div className="p-4 bg-[#181818] border border-white/15 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-white font-bold">
                <RefreshCw size={15} className="text-brand-red" />
                <span>7-Day Return Window</span>
              </div>
              <p className="text-gray-300">
                Garments can be exchanged or returned within <strong>7 days of delivery</strong>, provided the garment is unworn, unwashed, unaltered, and with all original atelier brand tags intact.
              </p>
              <p className="text-gray-300">
                Refunds are processed back to your original payment method or UPI bank account within 3–5 business days following quality inspection at our atelier.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-2.5">
            <h2 className="text-base sm:text-lg font-black text-white uppercase flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-brand-red font-mono">06.</span> Intellectual Property & Trademarks
            </h2>
            <p>
              All visual assets, garment typography, logos, and graphics associated with <strong>MONTARAW</strong> are the exclusive intellectual property of Montaraw Couture Studio. Unauthorized reproduction or commercial use is strictly prohibited.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-2.5">
            <h2 className="text-base sm:text-lg font-black text-white uppercase flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-brand-red font-mono">07.</span> Client Concierge & Inquiries
            </h2>
            <p>
              For sizing advice, custom fit inquiries, or order assistance, our atelier team is at your service:
            </p>
            <div className="p-4 bg-[#181818] border border-white/15 rounded-2xl mt-2 text-xs">
              <p className="text-white font-bold">MONTARAW CLIENT CONCIERGE</p>
              <p className="text-gray-300 mt-0.5">
                Email: <a href="mailto:montarawsupport@gmail.com" className="text-white hover:text-brand-red font-bold underline transition-colors">montarawsupport@gmail.com</a>
              </p>
              <p className="text-gray-300">
                Primary Helpline: <a href="tel:+919720538576" className="text-white hover:text-brand-red font-bold underline transition-colors">+91 97205 38576</a> | Secondary: <a href="tel:+916206424372" className="text-gray-300 hover:text-white underline transition-colors">+91 62064 24372</a> (Mon–Sat, 10:00 AM – 7:00 PM IST)
              </p>
              <p className="text-gray-300 mt-0.5">Address: <strong className="text-white">Flat No. 102, GAZAWALI, SARWAT, Muzzafarnagar, Uttar Pradesh 251002</strong></p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
