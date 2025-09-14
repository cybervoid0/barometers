import type { FC } from 'react'
import ReactMarkdown, { type Components, type Options } from 'react-markdown'
import remarkGfm from 'remark-gfm'

const defaultComponents: Components = {
  p: props => <p className="mb-4 indent-4" {...props} />,
  ul: props => <ul className="mb-4" {...props} />,
  li: props => <li className="ml-8 list-disc" {...props} />,
  a: props => (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground hover:text-foreground/60 hover:decoration-foreground/50 underline transition-colors duration-400 ease-out"
      {...props}
    />
  ),
}

interface MDProps extends Options {
  className?: string
}

export const MD: FC<MDProps> = ({ children, className, ...props }) => (
  <div className={className}>
    <ReactMarkdown {...props} components={defaultComponents} remarkPlugins={[remarkGfm]}>
      {children}
    </ReactMarkdown>
  </div>
)
