import { type PropsWithChildren } from 'react'

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <section className="my-10">
        <h2 id="foundation-header">The Art of Weather Instruments Foundation</h2>
        <p
          aria-label="Subheader"
          aria-labelledby="foundation-header"
          className="text-muted-foreground xs:text-base text-sm"
        >
          Preserving the Beauty and Function of Historical Weather Instruments
        </p>
      </section>
      {children}
    </>
  )
}
