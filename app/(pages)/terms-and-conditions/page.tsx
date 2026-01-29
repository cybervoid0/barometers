import Link from 'next/link'
import { appURL, email, foundation, Route } from '@/constants'

const paragraphStyles = 'mb-4 indent-8'
const sectionStyle = 'mb-10 mt-10'
const headerStyle = 'mb-3 leading-tight'
const nestedList = 'ml-8 mb-4 list-inside list-disc space-y-1'
const linkStyle = 'mx-1.5 text-muted-foreground hover:text-foreground'

export default function TermsAndConditions() {
  return (
    <article>
      <section className={sectionStyle}>
        <h2 className="mb-4 leading-tight">Terms and Conditions of Website Use</h2>

        <p className={paragraphStyles}>
          Welcome to the website of {foundation.tradeName}! Please read these Terms and Conditions
          (&quot;Terms&quot;) carefully before accessing or using the website
          <Link className={linkStyle} href={Route.Home}>
            {appURL}
          </Link>
          (the &quot;Site&quot;). By accessing or using the Site, you agree to comply with and be
          bound by these Terms without modification. If you do not accept any part of these Terms,
          you must not use the Site.
        </p>
        <p className={paragraphStyles}>
          The administration of {foundation.tradeName} (the &quot;Administration&quot;) reserves the
          right to revise or amend these Terms at any time by updating this page. You agree to be
          bound by such revisions, and by continuing to use the Site after changes have been posted,
          you confirm your acceptance of the updated Terms. You are encouraged to review this page
          periodically.
        </p>
      </section>

      <section className={sectionStyle}>
        <h3 className={headerStyle}>1. Who we are and how to contact us</h3>

        <p className={paragraphStyles}>
          We are
          <span className="italic text-muted-foreground ml-1">
            {foundation.tradeName} ({foundation.shortName})
          </span>
          , a private non-profit foundation registered in the Netherlands as
          <span className="italic text-muted-foreground ml-1">{foundation.fullName}</span>. <br />
          Address: <span className="text-muted-foreground">{foundation.postAddress}</span>. <br />
          Chamber of Commerce registration number:
          <span className="ml-1.5 text-muted-foreground font-mono text-sm">{foundation.regNo}</span>
          . <br />
          Contact:
          <a className={linkStyle} href={`mailto:${email}`}>
            {email}
          </a>{' '}
          or by mail at the above address.
        </p>
      </section>

      <section className={sectionStyle}>
        <h3 className={headerStyle}>2. Acceptance of the Agreement</h3>

        <p className={paragraphStyles}>
          By using the Site, you acknowledge that you have read, understood, and agree to abide by
          all Terms, conditions, and notices outlined in this document or otherwise posted on the
          Site (collectively the &quot;Agreement&quot;). If you do not accept these Terms, you are
          prohibited from using the Site.
        </p>
        <p className={paragraphStyles}>
          The Site is intended for a general audience and does not contain age-restricted content.
          The Administration does not knowingly collect personal data from children under 16 years
          of age. If you are under 16, you may use the Site and provide personal data only with the
          consent of your parent or legal guardian.
        </p>
      </section>

      <section className={sectionStyle}>
        <h3 className={headerStyle}>3. Intellectual property and use of materials</h3>

        <p className={paragraphStyles}>
          All content on the Site, including but not limited to text, graphics, images, audio,
          video, data, code, scripts, computer programs, and other materials (collectively the
          &quot;Materials&quot;), is protected under copyright laws of the Netherlands and other
          applicable jurisdictions. The Materials are owned or licensed by the Administration.
        </p>
        <p className={paragraphStyles}>
          You are granted a limited, personal, non-commercial license to view and download a single
          copy of the Materials solely for personal use. This limited license does not permit you
          to:
        </p>
        <ul className={nestedList}>
          <li>sell, distribute, modify, or create derivative works based on the Materials;</li>
          <li>
            publicly display, perform, or distribute any portion of the Materials for commercial
            purposes;
          </li>
          <li>
            reproduce, republish, or post the Materials on any other website, publication, or
            platform without prior written permission from the Administration.
          </li>
        </ul>
        <p className={paragraphStyles}>
          Quoting from the Materials is permitted to the extent allowed under copyright law,
          provided that the source is clearly cited with a link to barometers.info.
        </p>

        <h4 className="mb-2 mt-4 font-semibold">User-submitted materials</h4>
        <p className={paragraphStyles}>
          If you submit materials (such as text or images) to the Foundation, you confirm that you
          hold the necessary rights and that no third-party rights are infringed. You grant the
          Foundation a non-exclusive, royalty-free, worldwide license to store, reproduce, and
          publish such materials on the Site and related channels. You are fully responsible for the
          content you provide.
        </p>

        <h4 className="mb-2 mt-4 font-semibold">Notice-and-takedown procedure</h4>
        <p className={paragraphStyles}>
          If you believe that materials on the Site infringe your rights, please send a notice to
          post@barometers.info specifying:
        </p>
        <ul className={nestedList}>
          <li>your contact details;</li>
          <li>the exact URL of the infringing material;</li>
          <li>a description of the alleged infringement;</li>
          <li>
            your statement of good faith and accuracy of the claim. We will review the request and,
            if necessary, promptly restrict access to the materials.
          </li>
        </ul>
      </section>

      <section className={sectionStyle}>
        <h3 className={headerStyle}>4. Modification of Terms</h3>

        <p className={paragraphStyles}>
          The Administration reserves the right to amend, revise, or update these Terms at its sole
          discretion. Such changes shall take effect immediately upon posting on this page.
          Continued use of the Site constitutes your agreement to the updated Terms.
        </p>
      </section>

      <section className={sectionStyle}>
        <h3 className={headerStyle}>5. Prohibited activities</h3>

        <p className={paragraphStyles}>You agree not to:</p>
        <ul className={nestedList}>
          <li>use the Site for unlawful purposes;</li>
          <li>
            attempt to access, alter, or interfere with the Site&apos;s functionality or security
            systems;
          </li>
          <li>use automated tools (bots, scraping, spam);</li>
          <li>upload or distribute malicious code;</li>
          <li>
            engage in activities that may disrupt the Site&apos;s operation or compromise its
            security or that of its users.
          </li>
        </ul>
      </section>

      <section className={sectionStyle}>
        <h3 className={headerStyle}>6. Disclaimer of liability</h3>

        <p className={paragraphStyles}>
          The Site and its Materials are provided &quot;as is&quot; without warranties of any kind.
          The Art of Weather Instruments Foundation does not guarantee the accuracy, completeness,
          or timeliness of the information provided.
        </p>
        <p className={paragraphStyles}>The Administration is not liable for:</p>
        <ul className={nestedList}>
          <li>damages arising from the use of, or inability to use, the Site or its content;</li>
          <li>the content of external websites linked from the Site;</li>
          <li>any losses caused by circumstances beyond our reasonable control (force majeure).</li>
        </ul>
        <p className={paragraphStyles}>
          The Materials on the Site are intended solely for informational and educational purposes
          and do not constitute professional advice (legal, technical, or otherwise).
        </p>
      </section>

      <section className={sectionStyle}>
        <h3 className={headerStyle}>7. Cookies</h3>

        <p className={paragraphStyles}>
          The Site may use cookies. For non-essential cookies, we request your prior consent, which
          may be withdrawn at any time. Refusal of such cookies does not restrict access to the
          Site. Further details are provided in the Cookie Policy barometers.info/cookie.
        </p>
      </section>

      <section className={sectionStyle}>
        <h3 className={headerStyle}>8. Privacy</h3>

        <p className={paragraphStyles}>
          The Foundation ensures the protection of personal data in accordance with applicable law.
          Details are described in the Privacy Statement available at barometers.info/privacy.
          Questions and comments may be sent to post@barometers.info.
        </p>
      </section>

      <section className={sectionStyle}>
        <h3 className={headerStyle}>9. Miscellaneous provisions</h3>

        <p className={paragraphStyles}>
          We may modify the content of the Site, suspend, or terminate access to the Site, in whole
          or in part, without prior notice. We do not guarantee uninterrupted availability.
        </p>
        <p className={paragraphStyles}>
          If any provision of these Terms is found to be invalid, the remaining provisions shall
          remain in effect.
        </p>
        <p className={paragraphStyles}>
          Our failure to exercise any right does not constitute a waiver of that right.
        </p>
        <p className={paragraphStyles}>
          You may not assign your rights or obligations under these Terms without our prior written
          consent. We may assign rights and obligations to affiliates or successors of the
          Foundation.
        </p>
      </section>

      <section className={sectionStyle}>
        <h3 className={headerStyle}>10. Governing law</h3>

        <p className={paragraphStyles}>
          These Terms and your use of the Site are governed by and construed in accordance with the
          laws of the Netherlands. All disputes shall be subject to the exclusive jurisdiction of
          the competent court in the district of the Foundation&apos;s registered office.
        </p>
      </section>
    </article>
  )
}
