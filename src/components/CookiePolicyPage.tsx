import LegalLayout, {
  A,
  BUSINESS,
  Bullet,
  Bullets,
  Callout,
  DataTable,
  Section,
  SubHeading,
  type TocEntry,
} from './LegalLayout'

/**
 * /cookie-policy
 *
 * Unusually for this kind of page, the honest answer is "we don't use any", and
 * that is worth a page of its own rather than a footnote — a visitor who has
 * been trained by every other site to hunt for the opt-out deserves to find the
 * page and be told there is nothing to opt out of.
 *
 * That claim is only true as long as it stays true. It was verified against the
 * source: nothing in src/ touches document.cookie, localStorage or
 * sessionStorage, and index.html loads no analytics or advertising script. The
 * only third-party cookie surface on the whole site is the Airtable form iframe
 * in Events.tsx. Adding any analytics, embed, chat widget or A/B tool means
 * rewriting this page in the same commit — and, if the new thing is
 * non-essential, adding a consent banner — POPIA s11 needs a lawful ground for
 * placing one, and for a tracking cookie that ground can only be consent.
 */

const TOC: TocEntry[] = [
  { id: 'summary', label: 'The short version' },
  { id: 'what-cookies-are', label: 'What cookies are' },
  { id: 'what-we-use', label: 'What this site uses' },
  { id: 'third-party', label: 'The one third-party frame' },
  { id: 'no-banner', label: 'Why there is no consent banner' },
  { id: 'control', label: 'How to control cookies yourself' },
  { id: 'changes', label: 'Changes to this policy' },
]

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      path="/cookie-policy"
      eyebrow="Cookies"
      title={
        <>
          Cookie
          <br />
          Policy
        </>
      }
      documentTitle="Cookie Policy – Naughty Berry | Cape Town"
      intro={
        <>
          Most cookie policies are long because the site has a lot to declare. Ours is short because{' '}
          {BUSINESS.site} does not set cookies, does not store anything in your browser, and does not
          track you. This page explains exactly what that means and where the single exception lies.
        </>
      }
      toc={TOC}
    >
      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="summary" heading="1. The short version">
        <Callout>
          <strong>This website sets no cookies of its own.</strong> It writes nothing to your
          browser’s local storage or session storage. It runs no analytics, no advertising pixels,
          no session recording, no heatmaps and no fingerprinting. We do not know who you are when
          you visit, and we are not trying to find out.
        </Callout>

        <p>
          The only thing on the whole site that can place a cookie is the enquiry form embedded in
          our Events section, which is hosted by Airtable and runs inside a frame on our page. See{' '}
          <A href="#third-party">section 4</A>.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="what-cookies-are" heading="2. What cookies are">
        <p>
          A cookie is a small text file a website asks your browser to keep and hand back on your
          next visit. Related technologies — local storage, session storage, pixels, device
          fingerprinting — do much the same job by other means, and this policy treats them all the
          same way.
        </p>

        <p>They are usually put to one of a few uses:</p>

        <Bullets>
          <Bullet>
            <strong>Strictly necessary</strong> — keeping you logged in, holding a shopping basket,
            protecting a form against abuse. A site cannot function without these.
          </Bullet>
          <Bullet>
            <strong>Preferences</strong> — remembering a language, a region, a dark mode.
          </Bullet>
          <Bullet>
            <strong>Analytics</strong> — counting visitors and measuring which pages get read.
          </Bullet>
          <Bullet>
            <strong>Marketing and advertising</strong> — following you between sites to target ads.
            These are the ones consent rules exist for.
          </Bullet>
        </Bullets>

        <p>
          We use none of these four categories, including the strictly necessary ones. There is no
          login on this site, no basket, and nothing that needs to be remembered between pages.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="what-we-use" heading="3. What this site uses">
        <DataTable
          columns={['Technology', 'Do we use it?', 'Notes']}
          rows={[
            ['First-party cookies', 'No', 'The site sets none at all.'],
            [
              'Local storage / session storage',
              'No',
              'Nothing about your visit is written to your browser.',
            ],
            [
              'Analytics (Google Analytics, Plausible, etc.)',
              'No',
              'We do not measure traffic on this site.',
            ],
            [
              'Advertising or retargeting pixels',
              'No',
              'No Meta pixel, no Google Ads tag, no TikTok pixel, nothing.',
            ],
            [
              'Session recording or heatmaps',
              'No',
              'We do not record what you click, scroll or type.',
            ],
            [
              'Social media embeds and share widgets',
              'No',
              'Our Instagram and WhatsApp links are ordinary links. Nothing loads from those companies unless you click through.',
            ],
            [
              'Third-party frame (Airtable enquiry form)',
              'Yes — one',
              'May set its own necessary cookies inside the frame. See below.',
            ],
          ]}
        />

        <SubHeading>Things that are not cookies, but are worth telling you about</SubHeading>

        <p>
          Two parts of the site make a request to another company’s servers while a page loads. That
          discloses your IP address to them — a normal consequence of loading anything from the web,
          and not something a cookie banner would address, but you should know about it:
        </p>

        <Bullets>
          <Bullet>
            <strong>Google Fonts.</strong> Your browser downloads our two typefaces from Google’s
            font servers. Google receives your IP address and browser details. No cookie is set and
            nothing about your visit to us is sent.
          </Bullet>
          <Bullet>
            <strong>Airtable.</strong> Our pop-up schedule is read live from Airtable by your
            browser, so the dates and locations on the page are never stale. Airtable receives your
            IP address and browser details as part of that request.
          </Bullet>
        </Bullets>

        <p>
          Both are covered in more detail in our{' '}
          <A href="/privacy-policy#sharing">Privacy Policy</A>.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="third-party" heading="4. The one third-party frame">
        <p>
          The Events section of our home page embeds an enquiry form hosted by Airtable. That frame
          is Airtable’s own page displayed inside ours. If it loads, Airtable may set cookies that
          are necessary to make the form work and to protect it from abuse.
        </p>

        <Bullets>
          <Bullet>Those cookies belong to Airtable, not to us. We cannot read them.</Bullet>
          <Bullet>
            Anything you type into that form goes directly to Airtable, governed by Airtable’s
            privacy policy alongside ours.
          </Bullet>
          <Bullet>
            You can avoid it entirely: use our <A href="/quote">quote builder</A> instead, or just
            email <A href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</A>. Blocking third-party
            cookies in your browser will also stop it, though the form may then not work.
          </Bullet>
        </Bullets>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="no-banner" heading="5. Why there is no consent banner">
        <p>
          Under POPIA, placing a non-essential cookie on your device is processing that needs a
          lawful ground, and in practice the only honest one is your consent — freely given,
          specific and informed. That is what a cookie banner is for.
        </p>

        <p>
          We do not place any, so there is nothing to ask you about. A banner here would be
          theatre: a click you have to make for no benefit to you. If we ever add analytics or
          anything else non-essential, we will ask for your consent properly before it loads, with a
          real choice to decline and a way to change your mind — and we will update this page first.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="control" heading="6. How to control cookies yourself">
        <p>
          Nothing here needs blocking, but you are entitled to control what any site does, and your
          browser is the place to do it. Every major browser lets you see stored cookies, delete
          them, block third-party cookies, or refuse them entirely:
        </p>

        <Bullets>
          <Bullet>
            <strong>Chrome</strong> — Settings → Privacy and security → Third-party cookies
          </Bullet>
          <Bullet>
            <strong>Safari</strong> — Settings → Privacy (macOS: Safari → Settings → Privacy)
          </Bullet>
          <Bullet>
            <strong>Firefox</strong> — Settings → Privacy &amp; Security → Cookies and Site Data
          </Bullet>
          <Bullet>
            <strong>Edge</strong> — Settings → Cookies and site permissions
          </Bullet>
        </Bullets>

        <p>
          Blocking cookies site-wide can break other websites, and on ours the only visible effect
          would be the embedded Airtable form. Private or incognito browsing clears everything when
          you close the window, which achieves much the same thing without changing your settings.
        </p>
      </Section>

      {/* ─────────────────────────────────────────────────────────────── */}
      <Section id="changes" heading="7. Changes to this policy">
        <p>
          If we add anything that stores data in your browser or tracks your visit, this page
          changes before it goes live, not after — and if what we add is not strictly necessary, we
          will ask your permission first.
        </p>

        <p className="!mt-8 text-[14px] text-[#7A3B5E]/70">
          Questions? Email <A href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</A>. See also our{' '}
          <A href="/privacy-policy">Privacy Policy</A> and{' '}
          <A href="/terms">Terms of Use</A>.
        </p>
      </Section>
    </LegalLayout>
  )
}
