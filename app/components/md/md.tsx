import { FC } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import sx from './styles.module.scss'

export const MD: FC<{ children: string }> = ({ children }) => (
  <ReactMarkdown className={sx.paragraph} remarkPlugins={[remarkGfm]}>
    {children}
  </ReactMarkdown>
)
