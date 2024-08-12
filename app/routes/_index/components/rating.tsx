type RatingProps = {
  star: number
  size?: number
  color?: string
  withLabel?: boolean
}

export const Rating = ({
  star,
  size = 24,
  color = '#f9ce20',
  withLabel = false,
}: RatingProps) => {
  const arr = [1, 2, 3, 4, 5]

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-block cursor-auto select-none items-center">
        <div
          className="flex overflow-hidden whitespace-nowrap text-[#e6e6e6]"
          style={{
            fontSize: `${size}px`,
          }}
        >
          {arr.map((num: number) => {
            return (
              <span key={`star-${num}`} className="p-0.5">
                ☆
              </span>
            )
          })}
        </div>
        <div
          className="absolute left-0 top-0 flex overflow-hidden whitespace-nowrap"
          style={{
            color: color,
            fontSize: `${size}px`,
            width: `${star * 2 * 10}%`,
          }}
        >
          {arr.map((num: number) => {
            return (
              <span key={`star-active-${num}`} className="p-0.5">
                ★
              </span>
            )
          })}
        </div>
      </div>

      {withLabel ? (
        <span className="font-bold" style={{ fontSize: `${size * 0.65}px` }}>
          {star}
        </span>
      ) : null}
    </div>
  )
}
