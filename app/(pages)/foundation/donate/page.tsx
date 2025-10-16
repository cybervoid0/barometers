import { CheckConsent, Image, PayPalStackedButton } from '@/components/elements'
import { CopyButton } from '@/components/ui'
import { foundation } from '@/constants'
import { cn } from '@/utils'

const { bitcoinAddress, ethereumAddress } = foundation
const paragraphSx = 'mb-4 indent-8 text-left'
const listSx = cn(
  'mb-1 ml-12 space-y-2 -indent-6', //layout
  "[&>li]:before:mr-2 [&>li]:before:content-['•']", // dash-bullets
)
const contactTxSx = 'text-sm text-muted-foreground'
const tabHeaderSx = 'text-center'

export default function Donate() {
  return (
    <article>
      <h2 className="mt-6">Donate</h2>
      <p className={cn(paragraphSx, 'mt-6 mb-8')}>
        Your generosity helps us safeguard and share the legacy of historical weather instruments
        for future generations. Every donation — large or small — plays a vital role in conserving
        our collection, supporting research, and making this heritage accessible to the public.
      </p>
      <p className={paragraphSx}>You can support the Foundation through the following channels:</p>
      <ul className={listSx}>
        <li>€ IBAN — NL88 REVO 5564 9490 48</li>
        <li>Bitcoin (BTC) — wallet address and QR code below</li>
        <li>
          Ethereum Network — this includes ETH, USDT, USDC, and any other ERC-20 tokens (wallet
          address and QR code below)
        </li>
        <li>PayPal — secure online donations via PayPal or credit card</li>
      </ul>

      <div className="mt-20 flex flex-col items-center justify-evenly gap-6 md:flex-row md:items-start">
        <div className="flex h-full w-[240px] flex-col items-center gap-4">
          <Image
            src="/shared/bitcoin_qr-code_black.png"
            width={240}
            height={240}
            className="hidden rounded-sm shadow-lg dark:block"
            alt="Bitcoin"
          />
          <Image
            src="/shared/bitcoin_qr-code_white.png"
            width={240}
            height={240}
            className="block rounded-sm shadow-lg dark:hidden"
            alt="Bitcoin"
          />
          <CopyButton
            text={bitcoinAddress}
            tooltipMsg="Copy Bitcoin address"
            successMsg="Bitcoin address copied"
          >
            <p className="bg-input px-1 font-mono">{bitcoinAddress}</p>
          </CopyButton>
        </div>
        <div className="flex h-full w-[240px] flex-col items-center gap-4">
          <Image
            src="/shared/eth_qr-code_black.png"
            width={240}
            height={240}
            className="hidden rounded-sm shadow-lg dark:block"
            alt="Ethereum"
          />
          <Image
            src="/shared/eth_qr-code_white.png"
            width={240}
            height={240}
            className="block rounded-sm shadow-lg dark:hidden"
            alt="Ethereum"
          />

          <CopyButton
            text={ethereumAddress}
            successMsg="Ethereum address copied"
            tooltipMsg="Copy Ethereum address"
          >
            <p className="bg-input px-1 font-mono">{ethereumAddress}</p>
          </CopyButton>
        </div>
      </div>
      <CheckConsent service="payPal" category="functional" placeholder>
        <PayPalStackedButton className="mt-20" />
      </CheckConsent>
      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid grid-cols-1">
          <div className={tabHeaderSx}>€ EURO</div>
          <p className={contactTxSx}>NL88 REVO 5564 9490 48</p>
          <p className={contactTxSx}>Beneficiary — Leonid Shirokov</p>
          <p className={contactTxSx}>BIC/SWIFT — REVONL22</p>
          <p className={contactTxSx}>
            Revolut Bank UAB Barbara Strozzilaan 201, 1083 HN, Amsterdam, Netherlands
          </p>
          <p className={contactTxSx}>BIC of the correspondent bank — CHASDEFX</p>
        </div>
        <div className="grid grid-cols-1">
          <div className={tabHeaderSx}>$ USD</div>
          <p className={contactTxSx}>NL89 REVO 4933 5459 60</p>
          <p className={contactTxSx}>Beneficiary — Leonid Shirokov</p>
          <p className={contactTxSx}>BIC/SWIFT — REVONL22</p>
          <p className={contactTxSx}>
            Revolut Bank UAB Barbara Strozzilaan 201, 1083 HN, Amsterdam, Netherlands
          </p>
          <p className={contactTxSx}>BIC of the correspondent bank — CHASGB2L</p>
        </div>
      </div>
    </article>
  )
}
