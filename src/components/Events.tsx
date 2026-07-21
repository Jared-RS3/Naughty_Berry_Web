import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading'
import { Users, Star, Crown, Check } from 'lucide-react'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

const BERRY = '#E8176D'

const PACKAGES = [
  {
    id: 'small',
    icon: Users,
    name: 'Signature',
    subtitle: 'Up to 30 guests',
    price: 'From R2 500',
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
    cta: 'Enquire Now',
  },
  {
    id: 'large',
    icon: Crown,
    name: 'Premium',
    subtitle: '80+ guests / Weddings',
    price: 'Custom Quote',
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
  'Weddings',
  'Birthdays',
  'Corporate Events',
  'Graduations',
  'Baby Showers',
  'Year Ends',
  'Girls Night',
  'Any Celebration',
]

export default function Events() {
  const toForm = () =>
    document.getElementById('event-form')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section
      id="events"
      className="py-24 lg:py-32 relative overflow-hidden bg-[#FFDCEA] scroll-mt-20"
    >
      {/* Checkerboard — the one patterned surface on the page, faded out at the
          edges so the cards still sit on clean pink. */}
      <div
        aria-hidden="true"
        className="nb-checker absolute inset-0 pointer-events-none"
        style={{
          WebkitMaskImage:
            'radial-gradient(120% 78% at 50% 42%, black 0%, rgba(0,0,0,0.55) 46%, transparent 82%)',
          maskImage:
            'radial-gradient(120% 78% at 50% 42%, black 0%, rgba(0,0,0,0.55) 46%, transparent 82%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <SectionHeading
          eyebrow="Events & Catering"
          word="EVENTS"
          title={['','']}
          // title={['We cater for', 'any occasion.']}
          lead="From intimate birthdays to full-scale weddings, our signature chocolate taps bring fresh strawberries, flowing chocolate and a little extra sweetness to every celebration."
          className="mb-14"
        />

        {/* Occasions */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-16">
          {OCCASIONS.map((o, i) => (
            <motion.span
              key={o}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.04 * i, ease: EASE_OUT }}
              className="nb-pill px-5 py-2.5 text-[13px] font-semibold text-[#7A3B5E]"
            >
              {o}
            </motion.span>
          ))}
        </div>

        {/* Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 items-start">
          {PACKAGES.map((pkg, i) => {
            const Icon = pkg.icon
            const featured = !!pkg.featured
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: EASE_OUT }}
                className={`relative p-8 ${featured ? 'nb-card-berry' : 'nb-card'}`}
              >
                {featured && (
                  <span className="absolute top-8 right-8 text-[10px] font-bold tracking-[0.18em] uppercase text-white/70">
                    Most Popular
                  </span>
                )}

                <Icon
                  size={22}
                  strokeWidth={2}
                  style={{ color: featured ? '#fff' : BERRY }}
                  aria-hidden="true"
                />

                <h3
                  className="mt-6 uppercase text-2xl leading-none"
                  style={{
                    fontFamily: "'Archivo Black', system-ui, sans-serif",
                    color: featured ? '#fff' : '#3B2116',
                  }}
                >
                  {pkg.name}
                </h3>
                <p className={`mt-2 text-sm ${featured ? 'text-white/70' : 'text-[#7A3B5E]/70'}`}>
                  {pkg.subtitle}
                </p>
                <p
                  className="mt-5 text-2xl font-bold"
                  style={{ color: featured ? '#fff' : BERRY }}
                >
                  {pkg.price}
                </p>

                <ul className={`mt-7 space-y-3 ${featured ? 'text-white/85' : 'text-[#7A3B5E]'}`}>
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm leading-snug">
                      <Check
                        size={14}
                        strokeWidth={3}
                        className="mt-[3px] shrink-0"
                        style={{ color: featured ? '#fff' : BERRY }}
                        aria-hidden="true"
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toForm}
                  className={`mt-9 w-full py-3.5 rounded-full text-[12px] font-bold tracking-[0.18em] uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFDCEA] focus-visible:ring-[#E8176D] ${
                    featured
                      ? 'bg-white text-[#E8176D] hover:bg-[#FFF0F6]'
                      : 'bg-[#E8176D] text-white hover:bg-[#C01057]'
                  }`}
                  aria-label={`Enquire about the ${pkg.name} package`}
                >
                  {pkg.cta}
                </motion.button>
              </motion.div>
            )
          })}
        </div>

        {/* Enquiry form */}
        <motion.div
          id="event-form"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          className="scroll-mt-24"
        >
          <div className="text-center mb-8">
            <h3
              className="uppercase leading-[1.05] text-[clamp(1.5rem,3.4vw,2.5rem)]"
              style={{ fontFamily: "'Archivo Black', system-ui, sans-serif" }}
            >
              <span className="text-[#E8176D]">Let’s make it </span>
              <span className="text-[#3B2116]">sweet.</span>
            </h3>
            <p className="mt-3 text-[#7A3B5E]">
              Tell us about your event and we’ll come back to you within 24 hours.
            </p>
          </div>

          <div className="nb-card overflow-hidden">
            <iframe
              title="Naughty Berry event enquiry form"
              src="https://airtable.com/embed/appIfLyWzGV0npV6U/pagEgThqjTZEQCLFY/form"
              width="100%"
              height="733"
              className="block w-full"
              style={{ background: 'transparent', border: 'none' }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
