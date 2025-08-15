import Image from 'next/image'
import { cn } from '@/utils'
import { PayPalStackedButton } from '@/components/paypal-button'

const paragraphSx = 'mb-4 indent-8 text-left'
const listSx = cn(
  'mb-1 ml-12 space-y-2 -indent-6', //layout
  "[&>li]:before:mr-2 [&>li]:before:content-['—']", // dash-bullets
  '[&>li]:after:content-[";"] [&>li]:last-of-type:after:content-["."]', // colons and full stop
)

export default function Donate() {
  return (
    <>
      <h2 className="mt-6">Donate</h2>
      <p className={cn(paragraphSx, 'mt-6 mb-8')}>
        Your generosity helps us safeguard and share the legacy of historical weather instruments
        for future generations. Every donation — large or small — plays a vital role in conserving
        our collection, supporting research, and making this heritage accessible to the public.
      </p>
      <p className={paragraphSx}>You can support the Foundation through the following channels:</p>
      <ul className={listSx}>
        <li>Bitcoin (BTC) — wallet address and QR code below</li>
        <li>
          Ethereum Network — this includes ETH, USDT, USDC, and any other ERC-20 tokens (wallet
          address and QR code below)
        </li>
        <li>PayPal — secure online donations via PayPal or credit card</li>
        <li>
          Additional giving options will be available soon, including direct bank transfers and
          other convenient methods
        </li>
      </ul>

      <div className="mt-20 flex flex-col items-center justify-evenly gap-6 sm:flex-row sm:items-start">
        <div className="flex h-full w-[240px] flex-col items-center gap-4">
          <Image
            src="shared/bitcoin_qr-code_black.png"
            width={240}
            height={240}
            className="hidden rounded-sm shadow-lg dark:block"
            alt="Bitcoin"
          />
          <Image
            src="shared/bitcoin_qr-code_white.png"
            width={240}
            height={240}
            className="block rounded-sm shadow-lg dark:hidden"
            alt="Bitcoin"
          />
          <p className="text-center text-xs">bc1q6g0etsc0pu2s2zjk8t3rdej9624stxzq0hlm5f</p>
        </div>
        <div className="flex h-full w-[240px] flex-col items-center gap-4">
          <Image
            src="shared/eth_qr-code_black.png"
            width={240}
            height={240}
            className="hidden rounded-sm shadow-lg dark:block"
            alt="Ethereum"
          />
          <Image
            src="shared/eth_qr-code_white.png"
            width={240}
            height={240}
            className="block rounded-sm shadow-lg dark:hidden"
            alt="Ethereum"
          />
          {/* TODO: add copy button */}
          <p className="text-center text-xs">0x29B67cDAd027266Ed497b66a0c708e750d4436FA</p>
        </div>
      </div>
      <PayPalStackedButton className="mt-20" />
    </>
  )
}
