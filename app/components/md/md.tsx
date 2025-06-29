import { FC, HTMLAttributes } from 'react'
import ReactMarkdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

const defaultComponents: Components = {
  p: props => <p className="mb-4 indent-4" {...props} />,
  ul: props => <ul className="mb-4" {...props} />,
  li: props => <li className="ml-8 list-disc" {...props} />,
  a: props => (
    <a
      target="_blank"
      rel="noopener noreferrer"
      referrerPolicy="no-referrer"
      className="duration-400 underline transition-colors ease-out hover:text-amber-800"
      {...props}
    />
  ),
}

export const MD: FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...props
}) => (
  <div {...props}>
    <ReactMarkdown components={defaultComponents} remarkPlugins={[remarkGfm]}>
      {children?.toString()}
    </ReactMarkdown>
  </div>
)
