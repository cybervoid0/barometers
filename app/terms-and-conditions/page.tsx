import { cn } from '@/utils'

export const dynamic = 'force-static'

const paragraphStyles = ''
const sectionStyle = 'mb-6'
const headerStyle = 'mb-3 leading-tight'

export default function TermsAndConditions() {
  return (
    <article>
      <section className={cn('pt-6', sectionStyle)}>
        <h2 className="mb-4 leading-tight">Terms & Conditions for Website Use</h2>

        <p className={paragraphStyles}>
          Welcome to Barometers Realm! Please carefully read these Terms & Conditions
          (&quot;Terms&quot;) before accessing or using the website https://barometers.info (the
          &quot;Web Site&quot;). By accessing or using the Web Site, you agree to comply with and be
          bound by these Terms, without modification. If you do not accept any part of these Terms,
          you should not use the Web Site.
        </p>
        <p className={paragraphStyles}>
          The administration of Barometers Realm (the &quot;Administration&quot;) reserves the right
          to revise or modify these Terms at any time by updating this page. You agree to be bound
          by any such revisions and are encouraged to periodically review the Terms for any updates.
        </p>
      </section>

      <section className={sectionStyle}>
        <h3 className={headerStyle}>1. Acceptance of the Agreement</h3>

        <p className={paragraphStyles}>
          By using the Web Site, you acknowledge that you have read, understood, and agree to abide
          by all the Terms, Conditions, and Notices outlined in this document or otherwise posted on
          the Web Site (collectively referred to as the &quot;Agreement&quot;). If you do not accept
          these Terms, you are prohibited from using the Web Site.
        </p>
        <p className={paragraphStyles}>
          Additionally, the content on this Web Site is suitable for all ages, and there are no age
          restrictions for accessing or using the Materials provided here.
        </p>
      </section>

      <section className={sectionStyle}>
        <h3 className={headerStyle}>2. Intellectual Property and Use of Materials</h3>

        <p className={paragraphStyles}>
          All content on the Web Site, including but not limited to text, graphics, images, audio,
          video, data, coding, scripts, computer programs, and other materials (collectively the
          &quot;Materials&quot;), is protected under copyright laws of the Netherlands and other
          applicable jurisdictions. The Materials are either owned or licensed by the
          Administration.
        </p>
        <p className={paragraphStyles}>
          You are granted a limited, personal, non-commercial license to view and download a single
          copy of the Materials solely for personal use. This limited license does not allow you to:
        </p>
        <ul className="mb-4 list-inside list-disc space-y-2">
          <li>Sell, distribute, modify, or create derivative works based on the Materials.</li>
          <li>
            Publicly display, perform, or distribute any portion of the Materials for commercial
            purposes.
          </li>
          <li>
            Reproduce, republish, or post the Materials on any other web site, publication, or
            platform without express written permission from the Administration.
          </li>
        </ul>
        <p className={paragraphStyles}>
          Unauthorized use of the Materials may result in a violation of copyright, trademark, or
          other applicable laws. Should you breach any of the Terms, your permission to access and
          use the Web Site and Materials will be automatically terminated. Upon termination, you
          must immediately destroy any copies of the Materials you may have obtained.
        </p>
      </section>

      <section className={sectionStyle}>
        <h3 className={headerStyle}>3. Modification of Terms</h3>

        <p className={paragraphStyles}>
          The Administration reserves the right to modify, revise, or update these Terms at its sole
          discretion, and such changes shall take effect immediately upon posting on this page.
          Continued use of the Web Site constitutes your agreement to any changes in the Terms. It
          is your responsibility to review this page periodically.
        </p>
      </section>
      <section className={sectionStyle}>
        <h3 className={headerStyle}>4. Prohibited Activities</h3>
        <p className={paragraphStyles}>
          In addition to unauthorized use of the Materials, you agree not to:
        </p>
        <ul className="mb-4 list-inside list-disc space-y-2">
          <li>Use the Web Site for any unlawful purpose.</li>
          <li>
            Attempt to access, modify, or interfere with the Web Site&apos;s functionality or
            security systems.
          </li>
          <li>
            Engage in any activity that could disrupt the performance or compromise the security of
            the Web Site or its users.
          </li>
        </ul>
      </section>

      <section className={sectionStyle}>
        <h3 className={headerStyle}>5. Liability Disclaimer</h3>

        <p className={paragraphStyles}>
          The Web Site and its Materials are provided &quot;as is&quot; without warranties of any
          kind. Barometers Realm does not guarantee the accuracy, completeness, or timeliness of the
          information provided on the Web Site. The Administration is not liable for any damages
          resulting from your use or inability to use the Web Site or its content.
        </p>
      </section>
      <section className={sectionStyle}>
        <h3 className={headerStyle}>6. Governing Law</h3>

        <p className={paragraphStyles}>
          These Terms and your use of the Web Site shall be governed by and construed in accordance
          with the laws of the Netherlands. Any legal actions or disputes arising out of or related
          to these Terms shall be brought exclusively in the courts of the Netherlands.
        </p>
        <p className={paragraphStyles}>
          By using the Web Site, you agree to these Terms and Conditions. If you have any questions
          or concerns, feel free to contact the Administration of Barometers Realm for
          clarification.
        </p>
      </section>
    </article>
  )
}
