import { motion } from 'framer-motion'
import WaveDivider from './WaveDivider'
import { Users, Star, Crown, CheckCircle } from 'lucide-react'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

const PACKAGES = [
  {
    id: 'small',
    icon: Users,
    name: 'Signature',
    subtitle: 'Up to 30 guests',
    price: 'From R2 500',
    color: '#E8176D',
    features: [
      '30 chocolate strawberries',
      '30 dessert cups (mixed)',
      '2 flavour choices',
      '1 styled display station',
      '2-hour service',
      'Naughty Berry team on-site',
    ],
    cta: 'Enquire Now',
  },
  {
    id: 'medium',
    icon: Star,
    name: 'Indulgent',
    subtitle: 'Up to 60 guests',
    price: 'From R4 500',
    color: '#FF6BAD',
    featured: true,
    features: [
      '60 chocolate strawberries',
      '60 dessert cups (mixed)',
      '4 flavour choices',
      '2 styled display stations',
      'Dubai Chocolate add-on available',
      '3-hour service',
      'Naughty Berry team on-site',
      'Custom menu cards',
    ],
    cta: 'Most Popular',
  },
  {
    id: 'large',
    icon: Crown,
    name: 'Premium',
    subtitle: '80+ guests / Weddings',
    price: 'Custom Quote',
    color: '#9B59B6',
    features: [
      'Unlimited strawberries & cups',
      'Full custom flavour menu',
      'Luxury branded stations',
      'Dedicated event coordinator',
      'Full evening service',
      'Dubai Chocolate included',
      'Custom packaging & branding',
      'Photo-ready styling',
    ],
    cta: 'Get a Quote',
  },
]

const OCCASIONS = [
  '💍 Weddings',
  '🎂 Birthdays',
  '🏢 Corporate Events',
  '🎓 Graduations',
  '💜 Baby Showers',
  '🍾 Year Ends',
  '💃 Girls Night',
  '🎉 Any Celebration',
]

export default function Events() {
  return (
    <section id="events" className="py-24 lg:py-32 relative overflow-hidden bg-[#FFF0F6]">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(45deg, #E8176D 25%, transparent 25%, transparent 75%, #E8143C 75%), linear-gradient(45deg, #E8176D 25%, transparent 25%, transparent 75%, #E8143C 75%)',
          backgroundSize: '60px 60px',
          backgroundPosition: '0 0, 30px 30px',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <img
              src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
              alt=""
              aria-hidden="true"
              className="w-5 h-5 object-contain opacity-85"
              draggable={false}
            />
            <span className="w-8 h-[1px] bg-[#E8176D]" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#E8176D]">
              Events & Catering
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[#2D1225] mb-4">
            We Cater for <br /><span className="text-shimmer">Any Occasion.</span>
          </h2>
          <p className="text-[#7A3B5E] text-lg max-w-xl mx-auto">
            From intimate birthdays to full scale weddings, Naughty Berry brings the chocolate fountain vibes without the mess. Just the good stuff.
          </p>
        </motion.div>

        {/* Occasions strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT }}
          className="flex flex-wrap justify-center gap-2 mb-16"
        >
          {OCCASIONS.map((o, i) => (
            <motion.span
              key={o}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.04 * i, ease: EASE_OUT }}
              whileHover={{ y: -2, scale: 1.02 }}
              className="px-4 py-2 text-sm text-[#7A3B5E] bg-white border border-[#F9BDD4] rounded-full"
            >
              {o}
            </motion.span>
          ))}
        </motion.div>

        {/* Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {PACKAGES.map((pkg, i) => {
            const Icon = pkg.icon
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.01 }}
                transition={{ duration: 0.65, delay: i * 0.1, ease: EASE_OUT }}
                className={`relative rounded-3xl p-8 overflow-hidden ${pkg.featured ? '' : 'bg-white border border-[#F9BDD4]'}`}
                style={pkg.featured ? {
                  background: "linear-gradient(145deg, #FFF0F6 0%, #FDE8EF 100%)",
                  border: `1px solid ${pkg.color}44`,
                  boxShadow: `0 0 40px ${pkg.color}22, 0 8px 32px rgba(232,23,109,0.08)`,
                } : {}}
              >
                <motion.div
                  className="absolute inset-0 pointer-events-none motion-aurora"
                  initial={{ opacity: 0.28 }}
                  whileHover={{ opacity: 0.6 }}
                />

                {pkg.featured && (
                  <div
                    className="absolute top-0 inset-x-0 h-1 rounded-t-3xl"
                    style={{ background: `linear-gradient(90deg, transparent, ${pkg.color}, transparent)` }}
                  />
                )}

                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `${pkg.color}20`, border: `1px solid ${pkg.color}40` }}
                >
                  <Icon size={20} style={{ color: pkg.color }} />
                </div>

                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-display text-2xl font-bold text-[#2D1225]">{pkg.name}</h3>
                  {pkg.featured && (
                    <span
                      className="text-[9px] px-2 py-0.5 rounded-full font-bold tracking-widest uppercase"
                      style={{ background: pkg.color, color: '#fff' }}
                    >
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-[#2D1225]/40 text-sm mb-1">{pkg.subtitle}</p>
                <p className="font-bold text-2xl mb-6" style={{ color: pkg.color }}>{pkg.price}</p>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-[#7A3B5E]">
                      <CheckCircle size={14} className="mt-0.5 shrink-0" style={{ color: pkg.color }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    document.getElementById('event-form')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="w-full py-3 rounded-full text-sm font-semibold tracking-widest uppercase transition-all focus:outline-none"
                  style={pkg.featured ? {
                    background: `linear-gradient(135deg, ${pkg.color} 0%, #C01057 100%)`,
                    color: '#fff',
                    boxShadow: `0 0 20px ${pkg.color}44`,
                  } : {
                    border: `1px solid ${pkg.color}40`,
                    color: pkg.color,
                    background: `${pkg.color}10`,
                  }}
                  aria-label={`Enquire about ${pkg.name} package`}
                >
                  {pkg.cta}
                </motion.button>
              </motion.div>
            )
          })}
        </div>

        {/* Event Inquiry Form */}
        {/* <motion.div
          id="event-form"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white border border-[#F9BDD4] rounded-3xl p-8 md:p-12 motion-sheen">
            <h3 className="font-display text-3xl font-bold text-[#2D1225] mb-2">
              Let's Make It Sweet.
            </h3>
            <p className="text-[#2D1225]/50 text-sm mb-8">
              Fill in the details below and we'll get back to you within 24 hours.
            </p>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.55, ease: EASE_OUT }}
                  className="text-center py-10"
                >
                  <div className="w-16 h-16 rounded-full gradient-berry flex items-center justify-center mx-auto mb-5">
                    <CheckCircle size={28} className="text-white" />
                  </div>
                  <h4 className="font-display text-2xl font-bold text-[#2D1225] mb-2">
                    We've got your details!
                  </h4>
                  <p className="text-[#2D1225]/50 text-sm max-w-xs mx-auto">
                    Expect a reply from us within 24 hours. We can't wait to make your event extra naughty. 🍓
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  aria-label="Event enquiry form"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Your Name" name="name" value={form.name} onChange={handleChange} required placeholder="Jane Doe" />
                    <FormField label="Phone Number" name="phone" value={form.phone} type="tel" onChange={handleChange} required placeholder="+27 82 000 0000" />
                  </div>
                  <FormField label="Email Address" name="email" value={form.email} type="email" onChange={handleChange} required placeholder="jane@email.com" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Event Date" name="date" value={form.date} type="date" onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
                    <FormField label="Venue / Location" name="location" value={form.location} onChange={handleChange} required placeholder="Cape Town, venue name..." />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Estimated Guests" name="guests" value={form.guests} type="number" onChange={handleChange} required placeholder="e.g. 50" min="1" />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold tracking-widest uppercase text-[#2D1225]/50">
                        Budget Range
                      </label>
                      <select
                        name="budget"
                        value={form.budget}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#F9BDD4] text-[#2D1225] text-sm focus:outline-none focus:border-[#E8176D]/60 focus:ring-1 focus:ring-[#E8176D]/40 transition-all appearance-none"
                        aria-label="Select budget range"
                      >
                        <option value="">Select a range</option>
                        {BUDGET_RANGES.map((r) => (
                          <option key={r} value={r} className="bg-[#FFF0F6]">{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold tracking-widest uppercase text-[#2D1225]/50">
                      Notes (optional)
                    </label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Tell us about your event, theme, special requests..."
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#F9BDD4] text-[#2D1225] text-sm resize-none focus:outline-none focus:border-[#E8176D]/60 focus:ring-1 focus:ring-[#E8176D]/40 transition-all placeholder:text-[#2D1225]/25"
                      aria-label="Additional notes"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={loading ? {} : { scale: 1.02 }}
                    whileTap={loading ? {} : { scale: 0.98 }}
                    className="w-full py-4 rounded-full gradient-berry text-white font-semibold text-sm tracking-widest uppercase mt-2 disabled:opacity-60 transition-all focus:outline-none focus:ring-2 focus:ring-[#E8176D] focus:ring-offset-2 focus:ring-offset-[#FFF0F6] inline-flex items-center justify-center gap-2"
                    aria-label="Submit event enquiry"
                  >
                    <img
                      src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
                      alt=""
                      aria-hidden="true"
                      className="w-4 h-4 object-contain"
                      draggable={false}
                    />
                    {loading ? 'Sending...' : 'Send My Enquiry 🍓'}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div> */}
        <div className="lg:col-span-3 animate-slide-in-right" id="form">
            <div className="w-full h-full shadow-xl rounded-3xl overflow-hidden border border-gray-200">
              <iframe
                src="https://airtable.com/embed/appIfLyWzGV0npV6U/pagEgThqjTZEQCLFY/form"
                frameBorder="0"
                width="100%"
                height="733"
                className="rounded-3xl"
                style={{
                  background: "transparent",
                  border: "none",
                }}
              ></iframe>
            </div>
          </div>
      </div>
      <WaveDivider variant="events" fill="#FDE8EF" height={64} />
    </section>
  )
}
