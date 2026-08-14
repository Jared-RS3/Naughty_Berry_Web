import { CookieSettingsLink } from './CookieBanner'
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
 * /privacy-policy — the site's POPIA notice.
 *
 * ── What this document is describing ────────────────────────────────────────
 * Written against what the site actually does today, not a template:
 *
 *   • The quote builder (/quote) posts to /api/enquiry, which validates and
 *     writes a row into the Airtable **Leads** table. The columns it writes are
 *     the allowlist in netlify/functions/enquiry.mts — that list is the real
 *     answer to "what do you store", so the table below mirrors it.
 *   • The Events section embeds an Airtable-hosted form in an iframe. That one
 *     submits straight to Airtable and never touches our function, so Airtable
 *     is the first party for anything typed into it.
 *   • usePopupSchedule now reads the pop-up schedule from our own /api/schedule
 *     function, NOT from api.airtable.com in the visitor's browser. That used to
 *     disclose the visitor's IP to Airtable on every page load; it no longer
 *     does. If anyone ever points that hook back at Airtable directly, this
 *     page and the Cookie Policy both become wrong in the same commit.
 *   • Google Fonts is loaded from index.html — another IP disclosure, to Google.
 *   • The footer newsletter form is not wired to anything. Saying so is the only
 *     honest option; see the note in Footer.tsx.
 *   • Google Analytics 4 runs — but only after the visitor consents. See
 *     src/lib/analytics.ts: gtag.js is not added to the document at all until
 *     consent is granted, and withdrawing it disables the library and deletes
 *     its cookies. Section 8 and /cookie-policy carry the detail; the two must
 *     agree with each other and with the code.
 *   • The only thing written to localStorage is the visitor's own consent
 *     decision (src/lib/consent.ts). Beyond that and GA4's cookies, nothing is
 *     stored on the device. Verified — if that changes, this page and
 *     /cookie-policy both need updating in the same commit.
 *
 * ── Keeping it true ─────────────────────────────────────────────────────────
 * A privacy notice that has drifted from the code is worse than none, because
 * it is a written record of a promise you are no longer keeping. Anything that
 * adds a field, an analytics script, an embed or a third-party call belongs
 * here in the same commit.
 */

const TOC: TocEntry[] = [
  { id: 'who-we-are', label: 'Who we are' },
  { id: 'what-we-collect', label: 'What we collect' },
  { id: 'why-we-use-it', label: 'Why we use it, and our legal grounds' },
  { id: 'newsletter', label: 'Newsletter sign-up' },
  { id: 'marketing', label: 'Marketing and opting out' },
  { id: 'sharing', label: 'Who else sees your information' },
  { id: 'cross-border', label: 'Where your information is stored' },
  { id: 'cookies', label: 'Cookies and tracking' },
  { id: 'retention', label: 'How long we keep it' },
  { id: 'security', label: 'How we protect it' },
  { id: 'your-rights', label: 'Your rights' },
  { id: 'children', label: 'Children' },
  { id: 'complaints', label: 'Complaints' },
  { id: 'changes', label: 'Changes to this policy' },
]

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      path="/privacy-policy"
      eyebrow="Privacy"
      title={
        <>
          Privacy
          <br />
          Policy
        </>
      }
      documentTitle="Privacy Policy – Naughty Berry | Cape Town"
      intro={
        <>
          This policy explains what personal information {BUSINESS.tradingName} collects when you
          use {BUSINESS.site}, why we collect it, who else gets to see it, and what you can ask us
          to do about it. It is written to meet South Africa’s Protection of Personal Information
          Act 4 of 2013 (POPIA).
        </>
      }
      toc={TOC}
    >
      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="who-we-are" heading="1. Who we are">
        <p>
          {BUSINESS.tradingName} is a Cape Town dessert business serving strawberries and chocolate
          at markets, pop-ups and private events. In POPIA terms we are the{' '}
          <strong>responsible party</strong> for the personal information described here — the
          people who decide why it is collected and what happens to it.
        </p>

        <DataTable
          columns={['Detail', 'Value']}
          rows={[
            ['Trading name', BUSINESS.tradingName],
            [
              'Registered name',
              <Detail value={"Naughty Berry (Pty) Ltd"} placeholder="registered company name" />,
            ],
            [
              'Registration number',
              <Detail value={"2023/205936/07"} placeholder="CIPC registration number" />,
            ],
            [
              'Address',
              <Detail value={"Kenwyn, Cape Town, 7580"} placeholder="business address" />,
            ],
            ['Email', <A href={`mailto:${"naughtyberryfinance@gmail.com"}`}>{BUSINESS.email}</A>],
            [
              'Telephone',
              BUSINESS.phone ? (
                BUSINESS.phone
              ) : (
                <Detail value={"079 328 1500"} placeholder="contact number" />
              ),
            ],
            ['Website', <A href={BUSINESS.siteUrl}>{BUSINESS.site}</A>],
            ['Instagram', <A href={BUSINESS.instagram}>{BUSINESS.instagramHandle}</A>],
          ]}
        />

        <SubHeading>Information Officer</SubHeading>

        <p>
          Our Information Officer, appointed under sections 55 and 56 of POPIA, is{' '}
          <Detail value={"Yaaseen Van Der Fort"} placeholder="name of Information Officer" />
          , contactable at{' '}
          {BUSINESS.informationOfficerEmail ? (
            <A href={`mailto:${BUSINESS.informationOfficerEmail}`}>
              {BUSINESS.informationOfficerEmail}
            </A>
          ) : (
            <A href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</A>
          )}
          . Any question, request or complaint about your personal information should go to them
          first — we would much rather fix something ourselves than have you take it to the
          Regulator.
        </p>

        <p>
          Our manual prepared under the Promotion of Access to Information Act 2 of 2000 (PAIA) is
          available on request from the same address.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="what-we-collect" heading="2. What we collect">
        <p>
          We collect only what an event enquiry needs. There is no account to create, no login, no
          profile, and we do not buy personal information from anyone or scrape it from anywhere.
        </p>

        <SubHeading>Information you give us</SubHeading>

        <p>
          Two forms on this site collect personal information: the{' '}
          <A href="/quote">quote builder</A>, and the enquiry form embedded in the Events section
          (that second one is hosted by Airtable and sits inside a frame on our page). Between them
          they ask for:
        </p>

        <DataTable
          columns={['Information', 'Why we need it', 'Required?']}
          rows={[
            ['Your name', 'So we know who we are replying to and how to address you', 'Yes'],
            [
              'Email address',
              'To send you a quote and to correspond about your event',
              'Email or phone',
            ],
            [
              'Phone number',
              'An alternative way to reach you, and the faster one close to an event date',
              'Email or phone',
            ],
            [
              'Event date',
              'To check whether we are available and to schedule the trailer',
              'Optional',
            ],
            [
              'Venue or location',
              'To work out travel, setup and whether the site suits our stand',
              'Optional',
            ],
            [
              'Occasion and event type',
              'Weddings, birthdays, corporate events and so on are quoted differently',
              'Yes',
            ],
            [
              'Estimated headcount',
              'To size the order for packages that are not a fixed box',
              'Yes',
            ],
            [
              'Your order',
              'Package chosen, cup mix, toppings and iced teas — this is what we price',
              'Yes',
            ],
            [
              'Notes and special requests',
              'Anything else you tell us, in your own words',
              'Optional',
            ],
          ]}
        />

        <Callout>
          <strong>Please don’t put sensitive details in the notes field.</strong> It is a free-text
          box and we read whatever is in it. POPIA treats information about health, religion, race,
          political or trade-union membership, biometrics and sex life as{' '}
          <em>special personal information</em> with extra protection. If an allergy, a dietary
          requirement or an access need is relevant to your event, tell us — we need it to serve you
          safely, and we will use it only for that. Beyond that, please leave it out.
        </Callout>

        <SubHeading>Information collected automatically</SubHeading>

        <Bullets>
          <Bullet>
            <strong>Your IP address.</strong> Our enquiry endpoint uses it, in memory and only for
            about a minute, to stop the same source flooding us with submissions. Our hosting
            provider records it in standard server logs. It is <em>not</em> saved alongside your
            enquiry.
          </Bullet>
          <Bullet>
            <strong>Anti-spam signals.</strong> When a form is submitted we check how long it took
            to fill in and whether a hidden field (invisible to you, irresistible to bots) was
            completed. Submissions that fail are dropped and never stored. Nothing about this is
            kept once the check is done.
          </Bullet>
          <Bullet>
            <strong>Ordinary request data.</strong> Our host logs the page requested, the time, the
            browser’s user-agent string and the referring page — the standard record any web server
            keeps in order to serve a page and stay secure.
          </Bullet>
          <Bullet>
            <strong>Analytics — but only if you agree to it.</strong> If you accept analytics
            cookies, Google Analytics 4 records which pages you read, when, what device and browser
            you used, where you arrived from, and an approximate location worked out from your IP
            address. It also gives your browser a random identifier so a return visit is recognised
            as a return visit, and counts a few interactions automatically — how far you scrolled,
            clicks that lead off our site, and the fact that a form was started or sent, never what
            was typed into it. If you decline, or never answer the banner, none of this happens —
            the script is never even loaded. Full detail in <A href="#cookies">section 8</A>.
          </Bullet>
          <Bullet>
            <strong>Your cookie choice.</strong> Whatever you answer is stored in your browser’s
            local storage, along with the date and the version of the policy you answered against,
            so that we can honour it without asking again on every page. It never leaves your
            device.
          </Bullet>
        </Bullets>

        <p>
          We run no advertising pixels, no session recording, no heatmaps and no fingerprinting, and
          Google Analytics is configured so that it cannot feed advertising or profiling either. We
          also use <strong>Google Search Console</strong> to see how the site performs in Google’s
          search results, which is a different thing again: it runs no code in your browser, sets no
          cookie, and reports only totals Google already holds from its own search logs. See{' '}
          <A href="#cookies">section 8</A>.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="why-we-use-it" heading="3. Why we use it, and our legal grounds">
        <p>
          Section 11 of POPIA requires a lawful ground for every use of personal information. Ours
          are:
        </p>

        <DataTable
          columns={['What we do with it', 'Our legal ground']}
          rows={[
            [
              'Read your enquiry, work out a price and reply to you',
              'Necessary to take steps at your request before entering into a contract, and to perform that contract (s11(1)(b))',
            ],
            [
              'Plan and deliver an event you have booked — staffing, stock, travel, setup',
              'Performance of our contract with you (s11(1)(b))',
            ],
            [
              'Protect the site and the enquiry form from spam, abuse and automated attacks',
              'Our legitimate interest in keeping the service working and our records clean (s11(1)(f))',
            ],
            [
              'Keep records of quotes, invoices and completed events',
              'Compliance with an obligation imposed by law — tax and accounting (s11(1)(c))',
            ],
            [
              'Send you marketing about new flavours, pop-up dates and products',
              'Your consent, which you may withdraw at any time (s11(1)(a) and s69)',
            ],
            [
              'Measure how the site is used, with Google Analytics — visits, popular pages, where people arrive from',
              'Your consent, and nothing else. Analytics does not load until you give it and stops the moment you withdraw it (s11(1)(a)). Withdrawing costs you nothing and changes nothing about the site.',
            ],
            [
              'Deal with a dispute, a complaint or a legal claim',
              'Our legitimate interest in establishing or defending a legal claim (s11(1)(f))',
            ],
          ]}
        />

        <p>
          We will not use your information for a new purpose that is incompatible with the one it
          was collected for without telling you first and, where the law requires it, asking your
          permission.
        </p>

        <p>
          <strong>No automated decision-making.</strong> The price the quote builder shows you is
          arithmetic, not a decision about you: it multiplies what you selected by our published
          rates. A person reads every enquiry and writes every quote. Nothing on this site profiles
          you, and nothing here makes an automated decision about you of the kind section 71 of
          POPIA restricts.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="newsletter" heading="4. Newsletter sign-up">
        <Callout>
          <strong>The newsletter form in our footer is not connected yet.</strong> If you type your
          email address into it and press Subscribe, the address is checked for typos and then
          cleared. It is not stored, not emailed to us, and not sent to any mailing-list provider.
          Nobody is subscribed to anything.
        </Callout>

        <p>
          We are being explicit about this because a form that looks like it works, but quietly does
          nothing, is unfair to you either way — you should not believe you have subscribed when you
          have not, and you should not believe we are holding your address when we are not.
        </p>

        <p>
          When we do switch it on, we will update this policy first and say here who runs the
          mailing list, what we store, and how long for. Sign-up will be opt-in, every message will
          carry a one-click unsubscribe, and we will not add anyone who has not asked.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="marketing" heading="5. Marketing and opting out">
        <p>
          Section 69 of POPIA and section 45 of the Electronic Communications and Transactions Act 25
          of 2002 both restrict unsolicited electronic marketing, and section 11 of the Consumer
          Protection Act 68 of 2008 gives you the right to refuse it. In practice:
        </p>

        <Bullets>
          <Bullet>
            If you send us an enquiry, we reply about <em>that</em> enquiry. That is correspondence,
            not marketing, and you cannot unsubscribe from us answering you.
          </Bullet>
          <Bullet>
            We will only send you promotional messages if you have asked for them, or if you are an
            existing customer and the message is about something similar to what we already did for
            you — and even then, only with a clear way out in every message.
          </Bullet>
          <Bullet>
            You can opt out at any time by replying to any message, using the unsubscribe link, or
            emailing <A href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</A>. It costs you nothing
            and we will not ask you to justify it.
          </Bullet>
          <Bullet>
            We never sell, rent, trade or otherwise hand your details to anyone else for their own
            marketing. Not for any price.
          </Bullet>
        </Bullets>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="sharing" heading="6. Who else sees your information">
        <p>
          We keep the list short on purpose. These are the only third parties involved in running
          this site, and each of them acts as an <strong>operator</strong> under POPIA — meaning
          they handle the information on our instructions and may not use it for their own ends.
        </p>

        <DataTable
          columns={['Who', 'What they receive', 'Where']}
          rows={[
            [
              'Airtable (Airtable Inc.)',
              'Every enquiry is stored in our Airtable base. The enquiry form embedded in our Events section is hosted by Airtable and submits directly to them. Our pop-up schedule also lives in Airtable, but your browser no longer fetches it directly — our own server does, so Airtable does not see your IP address unless you use that embedded form.',
              'United States',
            ],
            [
              'Netlify (Netlify, Inc.)',
              'Hosts the site and runs the function that receives quote-builder enquiries. Sees your IP address and standard request data, and handles enquiry content in transit.',
              'United States / global CDN',
            ],
            [
              'Google Fonts',
              'Your browser downloads our two typefaces from Google’s font servers, which discloses your IP address and user-agent to Google. No cookies are set by this and no font request carries anything you typed.',
              'United States / global CDN',
            ],
            [
              'Google Analytics (Google Ireland Limited / Google LLC)',
              'Only if you accept analytics cookies. Google then receives the pages you view, your device and browser details, where you arrived from, your IP address (used to derive an approximate location, and not stored in the reports we see) and a random identifier from the _ga cookie. It never receives your name, email address, phone number or anything else you type into a form — Google’s terms forbid it and our code refuses to send it. Google Signals and ad personalisation are switched off, so your visit cannot be turned into an advertising audience.',
              'United States / Ireland',
            ],
            [
              'Google Search Console',
              'Nothing about you is sent to it. It is a tool Google gives site owners to see their own site’s performance in Google Search, and the figures in it come from Google’s search logs, not from your visit here. We see counts and averages only — search terms that led to the site, how often a page appeared, how often it was clicked, and roughly where in the country. Never a name, a device or an individual visitor.',
              'United States',
            ],
            [
              'Our email provider',
              'When we reply to you, your enquiry and our correspondence sit in our mailbox like any other email.',
              'United States',
            ],
          ]}
        />

        <p>
          Beyond those, we may disclose personal information where we are legally obliged to — a
          court order, a lawful request from a regulator or law-enforcement authority, or to
          establish or defend a legal claim. We would tell you if that happened, unless we were
          legally barred from doing so.
        </p>

        <p>
          Links to Instagram, WhatsApp and Google Maps on this site are ordinary links. We embed no
          social media trackers, so those companies learn nothing about you unless you click through
          — at which point their own privacy policies apply, not ours.
        </p>

        <p>
          <strong>We do not sell your personal information.</strong>
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="cross-border" heading="7. Where your information is stored">
        <p>
          Airtable and Netlify are United States companies, so your enquiry is stored and processed
          outside South Africa. Section 72 of POPIA permits this, and we rely on these grounds:
        </p>

        <Bullets>
          <Bullet>
            <strong>s72(1)(a)</strong> — each provider is bound by an agreement with us that imposes
            data-protection obligations substantially similar to the ones POPIA imposes on us, so
            your information does not lose its protection by crossing a border.
          </Bullet>
          <Bullet>
            <strong>s72(1)(b)</strong> — the transfer is necessary to perform the contract, or to
            take steps you asked for before one exists. You cannot get a quote out of a system
            without the system holding the enquiry.
          </Bullet>
        </Bullets>

        <p>
          Google Analytics is the one transfer that rests on a different ground. Google LLC is a
          United States company, so accepting analytics cookies means your device sends information
          about your visit outside South Africa.{' '}
          <strong>Section 72(1)(c) permits that because you consented to it</strong> — and if you
          decline, or withdraw later, nothing is transferred at all. What that consent covers is set
          out in <A href="#cookies">section 8</A>.
        </p>

        <p>
          You may ask us for details of these safeguards at{' '}
          <A href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</A>.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="cookies" heading="8. Cookies and tracking">
        <Callout>
          <strong>One optional tracker, and it is off until you say otherwise.</strong> We use
          Google Analytics 4 to count visits and see which pages get read. Its script is not loaded
          when the page opens — it is added only after you accept, so declining the banner or
          ignoring it means no analytics cookie is set and nothing about your visit reaches Google
          Analytics.{' '}
          <CookieSettingsLink
            asProse
            className="font-semibold text-[#E8176D] underline decoration-[#E8176D]/30 underline-offset-[3px] transition-colors hover:text-[#C01057]"
          />{' '}
          reopens the choice at any time, from any page.
        </Callout>

        <SubHeading>Google Analytics 4</SubHeading>

        <p>
          If you accept, Google Analytics places its{' '}
          <code className="rounded bg-[#E8176D]/8 px-1 text-[13px]">_ga</code> and{' '}
          <code className="rounded bg-[#E8176D]/8 px-1 text-[13px]">_ga_&lt;ID&gt;</code> cookies on
          your device, lasting up to two years. They hold a randomly generated identifier for your
          browser — not a name, not an email address, nothing that says who you are. Google then
          receives which pages you viewed and when, your device, browser and language, the site or
          search that sent you, and your IP address, which it uses to derive an approximate location
          and does not store in the reports we see. Google Analytics also counts a few interactions
          on its own — scroll depth, clicks that lead off our site, and whether a form was started
          or submitted. That last one is a count of the event, never the contents of the form.
        </p>

        <p>
          <strong>We never send Google your personal information.</strong> Google’s terms forbid it,
          and our code enforces it: nothing typed into the quote builder — name, email address,
          phone number, venue, notes — goes anywhere near analytics, and any value that looks like
          an email address or a phone number is stripped before an event or page address is
          recorded. We have also switched off Google Signals and ad personalisation, so your visit
          cannot be added to an advertising audience, used to retarget you, or combined with the
          browsing history Google holds about you elsewhere.
        </p>

        <p>
          Google processes this as our operator, and how it handles the data is set out in{' '}
          <A href="https://policies.google.com/privacy">Google’s Privacy Policy</A> and in{' '}
          <A href="https://policies.google.com/technologies/partner-sites">
            How Google uses information from sites or apps that use our services
          </A>
          . You can also opt out of Google Analytics across every site you visit with{' '}
          <A href="https://tools.google.com/dlpage/gaoptout">Google’s browser add-on</A>.
        </p>

        <p>
          Withdrawing is immediate and costs you nothing: we stop the script, tell it to store
          nothing further, and delete the cookies it set. The site behaves exactly the same either
          way — nothing is withheld or degraded because you said no.
        </p>

        <SubHeading>Everything else</SubHeading>

        <p>
          Beyond that, this site sets no cookies of its own. The only thing written to your
          browser’s storage is the record of the cookie choice you made, which never leaves your
          device.
        </p>

        <p>
          The Airtable-hosted enquiry form embedded in our Events section is the one place a cookie
          we do not control can appear. That frame is Airtable’s own page running inside ours, and
          Airtable may set cookies there that are necessary to make the form work. Those cookies are
          Airtable’s, governed by Airtable’s privacy policy, and they are only set if the frame
          loads.
        </p>

        <p>
          <strong>Google Search Console.</strong> We use it to understand how {BUSINESS.site} shows
          up in Google Search, and it is worth being precise about what it is, because it is easily
          confused with the analytics above. It is not Google Analytics. Nothing is added to this
          site for it — no script, no pixel, no cookie, nothing that runs while you are here. It
          reports on searches Google already handled on its own site, so what we see is which search
          terms brought people to us and how many clicked, as totals. Because it places nothing on
          your device and receives nothing about your visit, there is nothing here for you to
          consent to or opt out of.
        </p>

        <p>
          Our full <A href="/cookie-policy">Cookie Policy</A> sets all of this out in detail,
          including how to block or clear cookies in your browser.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="retention" heading="9. How long we keep it">
        <p>
          POPIA section 14 says we may not keep records identifying you for longer than we need
          them. Our schedule:
        </p>

        <DataTable
          columns={['Record', 'How long we keep it']}
          rows={[
            [
              'Enquiries that never became a booking',
              '24 months from your last contact with us, then deleted. We keep them that long because event planning runs on long lead times and people often come back a season later.',
            ],
            [
              'Records of events we catered',
              '5 years after the end of the tax year the event falls in, so that our invoices and supporting records meet the retention requirement in section 29 of the Tax Administration Act 28 of 2011.',
            ],
            [
              'Correspondence with you',
              'Kept alongside the enquiry or booking it belongs to, on the same clock.',
            ],
            [
              'Server and security logs',
              'Retained briefly by our hosting provider under its own standard retention, then rotated out. The in-memory rate-limit record lasts about one minute.',
            ],
            [
              'Analytics data (only if you accepted it)',
              'Google deletes event-level data after the retention period set in our Google Analytics account — Google offers 2 or 14 months — leaving only aggregated totals. The _ga cookies on your device last up to 2 years, or until you withdraw consent, at which point we delete them immediately.',
            ],
            [
              'Your cookie choice',
              'Stored in your browser until you change it, clear your browser storage, or we materially change what we use cookies for — at which point the old answer expires and we ask again.',
            ],
            [
              'Records involved in a dispute or legal claim',
              'Until the matter is fully resolved and any period for appeal or prescription has run out.',
            ],
          ]}
        />

        <p>
          You can ask us to delete your information sooner — see <A href="#your-rights">section 11</A>
          . Where we are legally required to keep a record, we will tell you that, keep only what the
          law requires, and delete the rest.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="security" heading="10. How we protect it">
        <p>
          Section 19 of POPIA requires appropriate, reasonable technical and organisational
          measures. What we actually do:
        </p>

        <Bullets>
          <Bullet>
            The entire site is served over HTTPS with strict transport security, so nothing you
            submit travels in the clear.
          </Bullet>
          <Bullet>
            Quote-builder enquiries are written to Airtable by a server-side function. The
            credential that can write to our records lives on the server and is never sent to your
            browser.
          </Bullet>
          <Bullet>
            That function accepts only a fixed list of fields. Even a crafted submission cannot
            reach any other part of our records.
          </Bullet>
          <Bullet>
            Everything submitted is length-limited and stripped of hidden and control characters
            before it is stored, and neutralised so that a record exported to a spreadsheet cannot
            execute anything on a colleague’s computer.
          </Bullet>
          <Bullet>
            Rate limiting at the network edge and in the function itself, plus the anti-spam checks
            described above.
          </Bullet>
          <Bullet>
            A strict content-security policy that blocks scripts, frames and connections we have not
            explicitly allowed.
          </Bullet>
          <Bullet>
            Access to our Airtable base is limited to the people who need it to run events, each
            with their own account.
          </Bullet>
        </Bullets>

        <p>
          No system is perfectly secure, and we will not pretend otherwise. If a security compromise
          affects your personal information, POPIA section 22 requires us to notify the Information
          Regulator and you as soon as reasonably possible after discovering it, and we will — with
          what happened, what was affected, and what you can do about it.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="your-rights" heading="11. Your rights">
        <p>You have the right to:</p>

        <Bullets>
          <Bullet>
            <strong>Know what we hold.</strong> Ask us to confirm, free of charge, whether we hold
            personal information about you, and to be given a copy of it (s23). A fee may apply to
            the copy itself, as prescribed under PAIA — we will tell you before any cost is
            incurred.
          </Bullet>
          <Bullet>
            <strong>Correct or complete it.</strong> Ask us to fix anything inaccurate, misleading,
            out of date or incomplete (s24).
          </Bullet>
          <Bullet>
            <strong>Have it deleted.</strong> Ask us to destroy or delete information we are no
            longer entitled to keep (s24).
          </Bullet>
          <Bullet>
            <strong>Object.</strong> Object at any time, on reasonable grounds, to our processing of
            your information — and object to direct marketing at any time, for no reason at all
            (s11(3) and s69).
          </Bullet>
          <Bullet>
            <strong>Withdraw consent.</strong> Where we rely on your consent, withdraw it at any
            time. That does not undo processing that already happened lawfully. For analytics you do
            not need to email anyone —{' '}
            <CookieSettingsLink
              asProse
              className="font-semibold text-[#E8176D] underline decoration-[#E8176D]/30 underline-offset-[3px] transition-colors hover:text-[#C01057]"
            />{' '}
            in the footer of any page switches it off on the spot.
          </Bullet>
          <Bullet>
            <strong>Complain.</strong> To us, and to the Information Regulator — see{' '}
            <A href="#complaints">section 13</A>.
          </Bullet>
        </Bullets>

        <SubHeading>How to exercise them</SubHeading>

        <p>
          Email <A href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</A> and tell us what you want
          done. Requests for access or correction may be made on the forms prescribed under the
          POPIA regulations (Form 2 and Form 3), available from the Information Regulator’s website
          — but a plain email is enough for us to act on.
        </p>

        <p>
          We may need to confirm it is really you before we hand over or change anything; we will
          ask for the least we can get away with. We aim to respond within{' '}
          <strong>30 days</strong>. If a request is complex we may need longer, and we will tell you
          why before that deadline passes. Exercising any of these rights costs you nothing and we
          will never treat you differently for it.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="children" heading="12. Children">
        <p>
          This site is meant for adults booking desserts, and we do not knowingly collect personal
          information from anyone under 18. Sections 34 and 35 of POPIA prohibit processing a
          child’s personal information without the consent of a competent person — a parent or
          guardian.
        </p>

        <p>
          If you are under 18, please ask a parent or guardian to send the enquiry. If you believe a
          child has given us personal information, email{' '}
          <A href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</A> and we will delete it.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="complaints" heading="13. Complaints">
        <p>
          Please come to us first at <A href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</A> — most
          things are a misunderstanding we can sort out in a day. If you are not satisfied with how
          we have handled it, you can complain to South Africa’s data-protection regulator:
        </p>

        <DataTable
          columns={['The Information Regulator (South Africa)', '']}
          rows={[
            ['Address', 'Woodmead North Office Park, 54 Maxwell Drive, Woodmead, Johannesburg, 2191'],
            ['Telephone', '010 023 5200 (toll-free 0800 017 160)'],
            [
              'POPIA complaints',
              <A href="mailto:POPIAComplaints@inforegulator.org.za">
                POPIAComplaints@inforegulator.org.za
              </A>,
            ],
            [
              'General enquiries',
              <A href="mailto:enquiries@inforegulator.org.za">enquiries@inforegulator.org.za</A>,
            ],
            [
              'Complaints portal',
              <A href="https://eservices.inforegulator.org.za/">
                eservices.inforegulator.org.za
              </A>,
            ],
            ['Website', <A href="https://inforegulator.org.za/">inforegulator.org.za</A>],
          ]}
        />

        <p>
          Enquiries reach us from outside South Africa too. Wherever you are contacting us from,
          POPIA is the law we apply to your information, and the rights in{' '}
          <A href="#your-rights">section 11</A> are yours on the same terms.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="changes" heading="14. Changes to this policy">
        <p>
          We update this policy whenever what we do with personal information changes — a new form, a
          new provider, a new purpose. The date at the top is always the date the current version
          took effect.
        </p>

        <p>
          If a change materially affects your rights or how we use information you have already given
          us, we will do more than change the date: we will tell you directly where we have a way to
          reach you, and where the law requires your consent, we will ask for it rather than assume
          it.
        </p>

        <p className="!mt-8 text-[14px] text-[#7A3B5E]/70">
          Questions about any of this? Email{' '}
          <A href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</A> — a real person reads it.
        </p>
      </Section>
    </LegalLayout>
  )
}
