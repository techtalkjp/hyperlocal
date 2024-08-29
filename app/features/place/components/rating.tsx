import { cn } from '~/libs/utils'

interface RatingProps extends React.HTMLAttributes<HTMLDivElement> {
  star?: number
  size?: number
  color?: string
  withLabel?: boolean
}

export const Rating = ({
  star,
  size = 24,
  withLabel = false,
  className,
  ...rest
}: RatingProps) => {
  const arr = [1, 2, 3, 4, 5]

  return (
    <div className={cn('flex items-center gap-2', className)} {...rest}>
      <div className="relative inline-block cursor-auto select-none items-center">
        <div
          className="flex overflow-hidden whitespace-nowrap text-[#e6e6e6]"
          style={{
            fontSize: `${size}px`,
          }}
        >
          {arr.map((num: number) => {
            return (
              <span key={`star-${num}`} className="p-[0.1]">
                ☆
              </span>
            )
          })}
        </div>
        {star && (
          <div
            className="absolute left-0 top-0 flex overflow-hidden whitespace-nowrap text-yellow-400"
            style={{
              fontSize: `${size}px`,
              width: `${star * 2 * 10}%`,
            }}
          >
            {arr.map((num: number) => {
              return (
                <span key={`star-active-${num}`} className="p-[0.1]">
                  ★
                </span>
              )
            })}
          </div>
        )}
      </div>

      {withLabel && star ? (
        <span className="text-sm font-bold text-yellow-500">
          {star.toFixed(1)}
        </span>
      ) : null}
    </div>
  )
}
