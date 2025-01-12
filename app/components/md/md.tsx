import { FC } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import clsx from 'clsx'
import sx from './styles.module.scss'

export const MD: FC<Parameters<typeof ReactMarkdown>[0]> = ({ children, className, ...props }) => (
  <ReactMarkdown {...props} className={clsx(className, sx.paragraph)} remarkPlugins={[remarkGfm]}>
    {children}
  </ReactMarkdown>
)
