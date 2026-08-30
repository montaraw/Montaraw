import { Shield, Truck, RotateCcw, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Shield, title: 'Premium Quality', desc: '240+ GSM fabrics' },
  { icon: Truck, title: 'Fast Delivery', desc: '3-5 business days' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '7-day return policy' },
  { icon: Lock, title: 'Secure Payment', desc: '100% protected' },
];

export default function FeatureStrip() {
  return (
    <section className="border-y border-white/5 bg-brand-dark/50">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-4 px-6 md:px-8 py-6 md:py-8 ${
                i < 3 ? 'border-r border-white/5' : ''
              } ${i < 2 ? 'border-b md:border-b-0 border-white/5' : ''}`}
            >
              <div className="w-12 h-12 flex items-center justify-center border border-white/20 bg-white/[0.05] shrink-0">
                <feature.icon size={22} className="text-white" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-outfit font-semibold text-white tracking-wide">
                  {feature.title}
                </p>
                <p className="text-xs text-white/80 font-inter mt-0.5">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
