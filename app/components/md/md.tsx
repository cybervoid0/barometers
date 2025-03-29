import { FC } from 'react'
import ReactMarkdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

const defaultComponents: Components = {
  p: props => <p className="mb-4 indent-4" {...props} />,
  ul: props => <ul className="mb-4" {...props} />,
  li: props => <li className="ml-8 list-disc" {...props} />,
  a: props => (
    <a
      className="underline transition-colors duration-400 ease-out hover:text-amber-800"
      {...props}
    />
  ),
}

export const MD: FC<Parameters<typeof ReactMarkdown>[0]> = ({ children, className, ...props }) => (
  <ReactMarkdown
    {...props}
    components={defaultComponents}
    className={className}
    remarkPlugins={[remarkGfm]}
  >
    {children}
  </ReactMarkdown>
)
