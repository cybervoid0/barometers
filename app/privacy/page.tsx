import dayjs from 'dayjs'
import Link from 'next/link'
import { Separator } from '@/components/ui'
import { email, FrontRoutes, foundation } from '@/constants'
import { cn } from '@/utils'

const { fullName, shortName, tradeName, postAddress } = foundation
const documentVersion = '1.0'
const versionDate = dayjs.utc(new Date(2025, 5, 9))

export default function PrivacyPolicy() {
  return (
    <article>
      <section className="my-10">
        <h2 className="mb-3">Privacy Policy</h2>
        <p>
          <span className="text-muted-foreground">Version:</span>{' '}
          <span className="ml-2 font-mono">{versionDate.format('MMMM D, YYYY')}</span>
          <span> / valid until replaced</span>
        </p>
      </section>
      <Separator />

      <section className="my-10 [&_p]:mb-4 [&_p]:indent-8">
        <h3 className="mb-8">Who We Are</h3>
        <p>
          We are The Art of Weather Instruments Foundation (AWIF), a private non-profit foundation
          registered in the Netherlands as Stichting Art of Weather Instruments. Our mission is the
          preservation, study, and promotion of historical meteorological instruments as objects of
          decorative and applied art and as an integral part of Europe’s cultural and scientific
          heritage.
        </p>
        <p>
          We act in accordance with the General Data Protection Regulation (EU) 2016/679 (GDPR) and
          Dutch law.
        </p>
      </section>
      <ol
        className={cn(
          'list-decimal marker:text-xl marker:xs:text-2xl marker:font-semibold', // markers
          'list-inside space-y-8 [&>li>h3]:inline [&>li>h3+*]:mt-6', // list content
          '[&_p]:mb-4 [&_p]:indent-8', // paragraphs
        )}
      >
        <li>
          <h3>Scope of this Policy</h3>
          <p>
            This Policy explains when, what, and why AWIF processes personal data in the course of
            its non-profit activities: working with donors, sponsors, friends, and members of the
            foundation; receiving donations; handling messages and corrections regarding website
            content; recruiting staff and volunteers; and maintaining our website.
          </p>
          <p>
            This Policy applies to individuals in the EU/EEA and to other jurisdictions to the
            extent GDPR is applicable.
          </p>
        </li>
        <li>
          <h3>Whose Data We Process</h3>
          <p>Categories of data subjects:</p>
          <ul className="ml-8 mb-4 list-disc list-inside [&>li]:marker:text-base">
            <li>
              Donors, sponsors, friends, and members of the foundation (including contact persons of
              sponsoring legal entities);
            </li>
            <li>Website visitors (including users submitting corrections or contact forms);</li>
            <li>Applicants (job or volunteer candidates);</li>
            <li>Correspondents (anyone communicating with AWIF by e-mail, post, or otherwise).</li>
          </ul>
          <p>
            We do not target children under 16. If we learn we have collected data of a child
            without proper consent (e.g. parental consent where required), we will delete such data.
          </p>
        </li>
        <li>
          <h3>How We Collect Data</h3>
          <p>We may collect personal data:</p>
          <ul className="ml-8 mb-4 list-disc list-inside [&>li]:marker:text-base">
            <li>
              Directly from you, when you visit our website; submit a correction via the online
              form; become a donor, sponsor, friend, or member; apply for a job or volunteer
              position; correspond with us; or participate in a foundation event;
            </li>
            <li>
              Automatically, through technical information collected when you visit our website (see
              Cookie Policy for details barometers.info/cookie);
            </li>
            <li>We never purchase databases or combine your data with third-party data brokers.</li>
          </ul>
        </li>
        <li>
          <h3>What Data We Collect</h3>
          <p>
            We only collect personal data when you provide it to us or when it is necessary for the
            operation of the website. This may include:
          </p>
          <ul className="ml-8 mb-4 list-disc list-inside [&>li]:marker:text-base">
            <li>
              Identification and contact details: name, optionally age, postal address, e-mail,
              telephone number;
            </li>
            <li>
              Financial data: donation amount and transaction details. We do not store credit card
              details — they are transmitted in encrypted form directly to the payment provider. We
              only retain the fact and metadata of the payment (amount/date/purpose);
            </li>
            <li>
              Employment or volunteering applications: CV, cover letter, references, and — only
              where legally required or with your explicit consent — special categories of data
              (gender, ethnic origin, sexual orientation, disability, criminal record);
            </li>
            <li>
              Website interaction data: content of forms (e.g. correction messages), timestamps, IP
              address, and user-agent, used strictly for security and operational logging.
            </li>
          </ul>
          <p>
            We follow the principle of data minimisation and collect only what is necessary for each
            purpose.
          </p>
        </li>
        <li>
          <h3>How We Use Data</h3>
          <p>We use personal data only for the following purposes:</p>
          <ul className="ml-8 mb-4 list-disc list-inside [&>li]:marker:text-base">
            <li>Processing and administering donations, sponsorships, and memberships;</li>
            <li>Sending thank-you letters to donors and sponsors;</li>
            <li>Managing "friends of the foundation" and membership administration;</li>
            <li>Handling job or volunteer applications;</li>
            <li>Improving the accuracy of information on our website;</li>
            <li>Ensuring security and preventing abuse;</li>
            <li>Meeting legal and accounting obligations.</li>
          </ul>
          <p>
            We do not use your data for marketing purposes and do not share it with third parties
            for advertising.
          </p>
        </li>
        <li>
          <h3>Data Retention</h3>
          <ul className="ml-8 mb-4 list-disc list-inside [&>li]:marker:text-base">
            <li>
              Data of donors, sponsors, friends, and members are kept for 5 years after the
              relationship ends, unless longer retention is required by law (e.g.
              financial/accounting records in the Netherlands may need to be kept for 7 years).
            </li>
            <li>
              Data of applicants and volunteers are kept for up to 1 year after the conclusion of
              the recruitment process.
            </li>
            <li>
              Messages and corrections submitted via the website are kept for up to 1 year after
              processing.
            </li>
            <li>
              Technical logs and cookies are stored only as long as necessary for website operation,
              and no longer than 1 year.
            </li>
          </ul>
          <p>After the retention period, data is deleted or anonymised.</p>
        </li>
        <li>
          <h3>Cookies and Similar Technologies</h3>
          <p>
            Our website may use strictly necessary cookies and limited functional/analytical tools.
            Full details are described in our separate Cookie Policy barometers.info/cookie.
          </p>
          <p>
            Our site includes an Instagram button that links to an external platform. When using it,
            your data is processed by Instagram (Meta) under their privacy policy, which we do not
            control.
          </p>
        </li>
        <li>
          <h3>Sharing of Data</h3>
          <p>
            We do not sell your personal data and do not share it with third parties for their
            marketing purposes.
          </p>
          <p>Data may only be disclosed:</p>
          <ul className="ml-8 mb-4 list-disc list-inside [&>li]:marker:text-base">
            <li>When required by law or competent authorities;</li>
            <li>
              To processors acting on our behalf and under contract (e.g. payment providers, hosting
              and security providers, email or cloud storage services). We require all processors to
              comply with GDPR and maintain appropriate security.
            </li>
          </ul>
          <p>
            International transfers outside the EEA are not planned. If they become necessary, we
            will use appropriate legal safeguards (such as EU Standard Contractual Clauses) and
            inform you.
          </p>
        </li>
        <li>
          <h3>Security and Organizational Measures</h3>
          <p>We apply technical and organisational measures to protect personal data, including:</p>
          <ul className="ml-8 mb-4 list-disc list-inside [&>li]:marker:text-base">
            <li>
              Logical access control with minimum necessary rights, passwords, and two-factor
              authentication where possible;
            </li>
            <li>Encrypted storage of digital files (Proton Drive);</li>
            <li>Secure communication channels between board members;</li>
            <li>TLS encryption for network connections;</li>
            <li>Data storage limited to the EU;</li>
            <li>Secure shredding of paper documents after digitisation.</li>
          </ul>
          <p>
            We also perform basic risk assessments, maintain a record of processing activities where
            required, conclude data processing agreements with processors, and apply the principle
            of privacy by design & by default in new processes.
          </p>
          <p>
            In case of a personal data breach creating risks to individuals, we will notify the
            Dutch Data Protection Authority (Autoriteit Persoonsgegevens, AP) and, where necessary,
            the affected individuals, without undue delay.
          </p>
        </li>
        <li>
          <h3>Your Rights</h3>
          <p>You have the right to:</p>
          <ul className="ml-8 mb-4 list-disc list-inside [&>li]:marker:text-base">
            <li>Request access to your data;</li>
            <li>Rectify or erase your data;</li>
            <li>Restrict processing;</li>
            <li>Object to the use of your data;</li>
            <li>Withdraw consent (if processing is based on consent).</li>
          </ul>
          <p>
            To exercise your rights, contact us at post@barometers.info. We may request additional
            information to confirm your identity where necessary for security.
          </p>
          <p>
            You also have the right to file a complaint with the Autoriteit Persoonsgegevens (AP) in
            the Netherlands.
          </p>
        </li>
        <li>
          <h3>Social Media, External Links and Third Parties</h3>
          <p>
            Our website contains links to external resources (such as Instagram). We do not control
            how these providers process personal data. We recommend reviewing their privacy policies
            before using their services.
          </p>
        </li>
        <li>
          <h3>Updates to this Policy</h3>
          <p>
            We may update this Policy from time to time. The current version is always available at
            barometers.info/foundation. The date of the last update is indicated at the top of this
            document.
          </p>
        </li>
        <li>
          <h3>Document Control and Terminology</h3>
          <p>
            Document version: {documentVersion} ({versionDate.format('MM.DD.YYYY')}).
          </p>
          <p>
            Terms are used in the sense defined by GDPR and Dutch practice (e.g. "personal data,"
            "processing," "controller," "processor," "EEA," "special categories of data,"
            "international transfer").
          </p>
          <p>
            We follow public guidelines issued by Dutch supervisory authorities regarding privacy
            statements and accountability.
          </p>
        </li>
        <li>
          <h3>Contact Information</h3>
          <p>
            <strong>Controller:</strong> {fullName} (trade name: {tradeName} — {shortName})
          </p>
          <p>
            <strong>Address:</strong> {postAddress}
          </p>

          <p>
            <strong>Email:</strong> <a href={`mailto:${email}`}>{email}</a>
          </p>
          <p>
            <strong>Website:</strong>{' '}
            <Link href={FrontRoutes.Foundation}>barometers.info/foundation</Link>
          </p>
        </li>
      </ol>
    </article>
  )
}
