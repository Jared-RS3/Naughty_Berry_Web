import LegalLayout, {
  A,
  BUSINESS,
  Bullet,
  Bullets,
  Callout,
  DataTable,
  Detail,
  Section,
  SubHeading,
  type TocEntry,
} from './LegalLayout'

/**
 * /terms — terms of use for the website, plus the disclaimers the site's own
 * features make necessary.
 *
 * ── Scope, deliberately ─────────────────────────────────────────────────────
 * These are *website* terms. They cover using this site, the status of a quote
 * produced by the builder, the accuracy of the pop-up schedule, allergens, and
 * liability. They are NOT the event booking contract: deposits, cancellation
 * windows, postponement, travel fees, breakages and weather are commercial
 * decisions only the business can make, and inventing them here would create
 * terms nobody agreed to. Section 5 therefore points at a separate booking
 * agreement issued with each quote — which needs to exist.
 *
 * ── Why section 6 is not boilerplate ────────────────────────────────────────
 * The menu is strawberries, chocolate, brownie pieces, a pistachio-and-kataifi
 * topping and a cream-and-Biscoff topping. That is milk, nuts, wheat and gluten
 * in a product prepared on shared equipment in a trailer. Allergen disclosure is
 * a real obligation under the Consumer Protection Act and the foodstuffs
 * labelling regulations, not a formality — it is the section on this page most
 * likely to matter to an actual person.
 */

const TOC: TocEntry[] = [
  { id: 'about', label: 'About these terms' },
  { id: 'business', label: 'Who you are dealing with' },
  { id: 'using-the-site', label: 'Using this site' },
  { id: 'content', label: 'Our content and yours' },
  { id: 'quotes', label: 'Quotes, prices and bookings' },
  { id: 'allergens', label: 'Allergens and food safety' },
  { id: 'schedule', label: 'Pop-up locations and times' },
  { id: 'availability', label: 'Availability of the site' },
  { id: 'links', label: 'Links to other sites' },
  { id: 'liability', label: 'Liability' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'law', label: 'Governing law and disputes' },
  { id: 'changes', label: 'Changes to these terms' },
]

export default function TermsPage() {
  return (
    <LegalLayout
      path="/terms"
      eyebrow="Terms"
      title={
        <>
          Terms
          <br />
          of Use
        </>
      }
      documentTitle="Terms of Use – Naughty Berry | Cape Town"
      intro={
        <>
          These terms govern your use of {BUSINESS.site} and the enquiry and quote features on it.
          They are written to be read, not to be survived — plain language, no traps. Using the site
          means you accept them.
        </>
      }
      toc={TOC}
    >
      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="about" heading="1. About these terms">
        <p>
          By browsing {BUSINESS.site}, sending us an enquiry or building a quote, you agree to these
          terms. If you do not agree with them, please do not use the site — email or message us
          instead and we will happily deal with you the old-fashioned way.
        </p>

        <Callout>
          <strong>These are website terms, not your booking contract.</strong> If you book us for an
          event, the terms of that booking — deposit, cancellation, travel, timing, what we bring
          and what you provide — are set out in the written booking agreement we send with your
          final quote. Those terms govern the event; these ones govern the website.
        </Callout>

        <p>
          Nothing in these terms limits or excludes any right you have under the Consumer Protection
          Act 68 of 2008, the Electronic Communications and Transactions Act 25 of 2002, or any
          other law that cannot be contracted out of. Where any part of these terms conflicts with
          such a right, that right wins and the rest of these terms carry on unaffected.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="business" heading="2. Who you are dealing with">
        <p>
          Section 43 of the Electronic Communications and Transactions Act requires a business
          offering goods or services online to identify itself properly. Ours:
        </p>

        <DataTable
          columns={['Detail', 'Value']}
          rows={[
            ['Trading name', BUSINESS.tradingName],
            [
              'Legal name',
              <Detail value={BUSINESS.registeredName} placeholder="registered company name" />,
            ],
            [
              'Registration number',
              <Detail value={BUSINESS.registrationNumber} placeholder="CIPC registration number" />,
            ],
            [
              'VAT number',
              <Detail value={BUSINESS.vatNumber} placeholder="VAT number, if registered" />,
            ],
            [
              'Physical address',
              <Detail value={BUSINESS.address} placeholder="business address" />,
            ],
            [
              'Postal address',
              <Detail value={BUSINESS.postalAddress ?? BUSINESS.address} placeholder="postal address" />,
            ],
            ['Email', <A href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</A>],
            [
              'Telephone',
              <Detail value={BUSINESS.phone} placeholder="contact number" />,
            ],
            ['Website', <A href={BUSINESS.siteUrl}>{BUSINESS.site}</A>],
            [
              'What we do',
              'Fresh strawberries with chocolate, dessert cups, toppings and iced tea, served from our trailers at markets, pop-ups and private events in and around Cape Town.',
            ],
          ]}
        />

        <p>
          This site does not take payments. Nothing on it is a checkout, and we will never ask you
          for card details through it. Payment for a booking happens by arrangement, against an
          invoice we issue to you.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="using-the-site" heading="3. Using this site">
        <p>You may use this site to read about us, plan an event and get in touch. Please do not:</p>

        <Bullets>
          <Bullet>
            Submit enquiries you have no intention of following up, or submit them in bulk. Every
            one lands in front of a person.
          </Bullet>
          <Bullet>
            Use bots, scrapers or automated tools against the site or the enquiry endpoint, or try to
            get around the rate limits and spam checks protecting them.
          </Bullet>
          <Bullet>
            Give false information, impersonate someone else, or submit someone else’s contact
            details without their permission.
          </Bullet>
          <Bullet>
            Submit anything unlawful, defamatory, hateful, threatening, obscene or infringing, or
            anything containing malicious code.
          </Bullet>
          <Bullet>
            Probe, scan or test the security of the site, interfere with it, or try to gain access to
            any system, account or data you are not entitled to.
          </Bullet>
          <Bullet>
            Copy, reproduce or republish substantial parts of the site, or use it to build a
            competing service.
          </Bullet>
        </Bullets>

        <p>
          We may refuse or delete an enquiry, and block access to the site, if any of the above
          happens. Some of it is also a criminal offence under Chapter 13 of the Electronic
          Communications and Transactions Act and the Cybercrimes Act 19 of 2020.
        </p>

        <p>
          <strong>Found a security problem?</strong> Please tell us at{' '}
          <A href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</A> rather than exploiting it or
          publishing it. We will take it seriously and thank you properly.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="content" heading="4. Our content and yours">
        <SubHeading>Ours</SubHeading>

        <p>
          The Naughty Berry name and logo, and the photography, illustrations, video, design, text
          and code on this site, belong to us or are used with permission. You may look at them,
          share links to our pages, and print a page for your own planning. You may not use our
          branding or our photographs commercially, pass them off as your own, or take our content
          for another business, without our written permission.
        </p>

        <SubHeading>Yours</SubHeading>

        <p>
          Anything you send us through the site — enquiry details, notes, requests — stays yours. You
          give us permission to use it for the purpose you sent it: reading it, quoting on it and
          delivering your event. How we handle it is set out in our{' '}
          <A href="/privacy-policy">Privacy Policy</A>.
        </p>

        <p>
          If you tag us or send us photographs of your event and we would like to share them, we will
          ask you first. We do not repost people’s events without permission.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="quotes" heading="5. Quotes, prices and bookings">
        <Callout>
          <strong>The number the quote builder shows you is an estimate, not a quote.</strong> It is
          the published price of the package and add-ons you selected, added up. It is not an offer
          capable of acceptance, it does not reserve a date, and it is not a booking. A real quote is
          one we send you in writing after reading your enquiry.
        </Callout>

        <p>Specifically:</p>

        <Bullets>
          <Bullet>
            The estimate covers cups and the add-ons you chose. It <strong>excludes</strong> travel,
            setup, staffing beyond what the package includes, extended service hours, equipment
            hire, and anything your venue charges us. Those depend on where and when your event is,
            which is why a person prices them.
          </Bullet>
          <Bullet>
            Prices shown on the site are in South African Rand and are those current at the time you
            look. They can change — a quote we send you is held for the period stated on it.
          </Bullet>
          <Bullet>
            Whether VAT is included is stated on every quote and invoice we issue.{' '}
            <Detail value={BUSINESS.vatNumber} placeholder="confirm VAT status and whether displayed prices include VAT" />
          </Bullet>
          <Bullet>
            A date is only yours once we have confirmed it in writing and any deposit set out in your
            booking agreement has been received. Until then it stays open to everyone.
          </Bullet>
          <Bullet>
            Availability is not guaranteed. We run a limited number of trailers and weekends fill up
            far in advance.
          </Bullet>
          <Bullet>
            We do our best to keep package contents, flavours and photographs accurate, but products
            change with the season and with what our suppliers have. What arrives at your event is
            what your written quote describes.
          </Bullet>
        </Bullets>

        <p>
          Cancellation, postponement, deposits and refunds are dealt with in the booking agreement
          that accompanies your quote, together with your rights under section 17 of the Consumer
          Protection Act to cancel an advance booking (subject to a reasonable cancellation charge).
        </p>

        <SubHeading>Checking what you send us</SubHeading>

        <p>
          Section 43(2) of the Electronic Communications and Transactions Act 25 of 2002 says we
          must give you a chance to review the whole transaction and correct any mistake before you
          commit to it. The quote builder is built around that: every step can be gone back to, the
          review screen shows you everything you have chosen in one place, and nothing is sent until
          you press confirm on it.
        </p>

        <Bullets>
          <Bullet>
            Before sending, you tick a box confirming you have read these terms and that the details
            you entered are correct. We record that tick, the moment it was made, and which version
            of the wording was on screen.
          </Bullet>
          <Bullet>
            We work from what you send us. If a date, a headcount, a venue or a contact number is
            wrong, the quote we build on it will be wrong too — so it is worth a second look at the
            review screen.
          </Bullet>
          <Bullet>
            Spotted a mistake after sending? Simply reply to our email or write to{' '}
            <A href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</A>. Nothing is binding at the
            enquiry stage, so there is nothing to undo — we will just correct it.
          </Bullet>
        </Bullets>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="allergens" heading="6. Allergens and food safety">
        <Callout>
          <strong>Our products contain common allergens.</strong> Depending on what you order, they
          may contain <strong>milk and dairy</strong>, <strong>nuts</strong> (the Dubai topping
          contains pistachio), <strong>wheat and gluten</strong> (brownie pieces and Biscoff),{' '}
          <strong>soya</strong> and <strong>egg</strong>. Everything is prepared on shared equipment
          in a small trailer, so we cannot guarantee any item is free from traces of any allergen.
        </Callout>

        <Bullets>
          <Bullet>
            If you or any of your guests have a food allergy or intolerance, tell us in your enquiry
            or before we confirm your booking. Do not rely on the website alone — ask us, and we will
            give you a straight answer about a specific product.
          </Bullet>
          <Bullet>
            If we cannot safely serve a particular allergy at an event, we will say so rather than
            take the risk.
          </Bullet>
          <Bullet>
            Fresh fruit and dairy are perishable. Our products are made to be eaten on the day and
            should be kept cool and consumed promptly. We are not responsible for products stored or
            handled incorrectly after we have handed them over.
          </Bullet>
          <Bullet>
            Photographs on this site are of our real products, but presentation varies with fruit
            size, season and how a cup is built on the day.
          </Bullet>
        </Bullets>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="schedule" heading="7. Pop-up locations and times">
        <p>
          The pop-up schedule on this site is read live from our own calendar, so it is as current as
          we are. Even so, markets get cancelled, weather turns and plans change at short notice. The
          schedule is information, not a promise that we will be at a place at a time.
        </p>

        <p>
          Before travelling to find us, check our Instagram —{' '}
          <A href={BUSINESS.instagram}>{BUSINESS.instagramHandle}</A> — where we post changes as they
          happen. We are not liable for a wasted trip, and we would feel bad about it anyway.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="availability" heading="8. Availability of the site">
        <p>
          We would like the site to be available and correct all the time, but we do not guarantee
          it. It is provided as it is. It may be unavailable for maintenance, or because something
          it depends on — hosting, our schedule service — is having a bad day. We may change,
          suspend or withdraw any part of it without notice.
        </p>

        <p>
          If an enquiry form is not working, please email{' '}
          <A href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</A> or message us on Instagram. We
          would rather hear from you twice than not at all.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="links" heading="9. Links to other sites">
        <p>
          This site links out to Instagram, WhatsApp, Google Maps and the studio that built it, and
          embeds an enquiry form hosted by Airtable. We do not control those services and are not
          responsible for their content, availability or practices. Once you leave our site, their
          terms and privacy policies apply.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="liability" heading="10. Liability">
        <p>
          To the fullest extent the law allows, we are not liable for indirect or consequential loss
          arising from your use of this site — including lost profit, lost opportunity, or loss
          caused by the site being unavailable, by information on it being out of date, or by an
          enquiry failing to reach us.
        </p>

        <p>
          Where we are liable for something in connection with this site, our total liability is
          limited to the amount you have paid us in the twelve months before the claim, or R1 000 if
          you have paid us nothing.
        </p>

        <Callout>
          <strong>What this does not touch.</strong> Nothing above limits our liability for death or
          personal injury caused by our negligence, for fraud or fraudulent misrepresentation, for
          harm caused by unsafe or defective goods under section 61 of the Consumer Protection Act,
          or for anything else the law does not permit us to limit. If you are a consumer under the
          Consumer Protection Act, your statutory rights are unaffected by anything on this page.
        </Callout>

        <p>
          You agree to cover us for loss we suffer as a direct result of you breaking these terms —
          for example by attacking the site, or by submitting unlawful content through a form.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="privacy" heading="11. Privacy">
        <p>
          How we handle personal information is set out in our{' '}
          <A href="/privacy-policy">Privacy Policy</A>, and what we store in your browser — nothing —
          in our <A href="/cookie-policy">Cookie Policy</A>. Both form part of these terms.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="law" heading="12. Governing law and disputes">
        <p>
          These terms are governed by the law of the Republic of South Africa, and you agree to the
          jurisdiction of the South African courts, without prejudice to any right you have under the
          Consumer Protection Act to refer a dispute elsewhere.
        </p>

        <p>
          Please raise any complaint with us first at{' '}
          <A href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</A>. If we cannot resolve it, a
          consumer may refer the matter to the National Consumer Commission or an accredited
          consumer-goods ombud, and a data-protection complaint may go to the Information Regulator —
          contact details are in our{' '}
          <A href="/privacy-policy#complaints">Privacy Policy</A>.
        </p>

        <p>
          If any part of these terms turns out to be unenforceable, the rest carries on. Our not
          enforcing something immediately does not mean we have given it up.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="changes" heading="13. Changes to these terms">
        <p>
          We may update these terms as the site and the business change. The version on this page is
          the one that applies, and the date at the top tells you when it took effect. Changes are
          not retrospective: a booking already confirmed is governed by the terms in place when it
          was confirmed.
        </p>

        <p className="!mt-8 text-[14px] text-[#7A3B5E]/70">
          Questions about any of this? Email{' '}
          <A href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</A> — a real person reads it.
        </p>
      </Section>
    </LegalLayout>
  )
}
