import { CSSProperties } from 'react'
import { alpha, Text, Tooltip } from '@mantine/core'

interface LetterCircleProps {
  letter: string
  size?: number
  color?: CSSProperties['color']
  bgColor?: CSSProperties['color']
  style?: CSSProperties
  className?: string
}

function LetterCircle({
  letter,
  size = 40,
  color = 'black',
  bgColor = '#dddddd',
  style,
  className,
}: LetterCircleProps) {
  return (
    <svg
      style={style}
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="24"
        y="17"
        width="50"
        height="50"
        fill={bgColor}
        stroke={alpha(color, 0.5)}
        strokeWidth="3"
        rx="4px"
        ry="4px"
      />
      <text
        x="49"
        y="52"
        textAnchor="middle"
        fontSize="30"
        fontWeight="600"
        fill={alpha(color, 0.5)}
      >
        {letter}
      </text>
    </svg>
  )
}

const categoryLetters: Record<string, { letter: string }> = {
  bourdon: {
    letter: 'Bo',
  },
  miscellaneous: {
    letter: 'Mi',
  },
  mercury: {
    letter: 'Me',
  },
  aneroid: {
    letter: 'An',
  },
  recorders: {
    letter: 'Re',
  },
  pocket: {
    letter: 'Po',
  },
}

interface CategoryLetterProps extends Omit<LetterCircleProps, 'letter'> {
  category: string
}
export function CategoryIcon({ category, ...props }: CategoryLetterProps) {
  const cat = categoryLetters[category]
  return (
    <Tooltip
      label={
        <Text size="xs" tt="capitalize">
          {category}
        </Text>
      }
    >
      <LetterCircle letter={cat.letter ?? '?'} color="var(--mantine-color-gray-6)" {...props} />
    </Tooltip>
  )
}
