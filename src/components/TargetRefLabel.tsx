/**
 * TargetRefLabel – custom label renderer for ReferenceLine in horizontal BarChart.
 *
 * Place badge strictly to the LEFT or RIGHT of the reference line via `side` prop.
 *  - side='right' (default): badge starts at x + 4 (clear of bar labels that end left of line)
 *  - side='left' : badge ends at x - 4 (clear of bar labels that start right of line)
 *
 * For Recharts vertical ReferenceLine (x prop), the viewBox passed to the label is:
 *   x      = pixel x-coordinate of the reference line
 *   y      = top of the plot area
 *   width  = distance from the line to the right edge of the plot area
 *   height = height of the plot area
 */
export function TargetRefLabel(props: {
  viewBox?: { x: number; y: number; width: number; height: number };
  value: string;
  side?: 'left' | 'right';
}) {
  const { viewBox, value, side = 'right' } = props;
  if (!viewBox || !value) return null;

  const { x, y } = viewBox;

  const charWidth = 6.2;
  const paddingX = 7;
  const boxHeight = 18;
  const textWidth = value.length * charWidth;
  const boxWidth = textWidth + paddingX * 2;

  const boxX = side === 'left' ? x - boxWidth - 4 : x + 4;
  const boxY = y + 2;

  return (
    <g>
      <rect
        x={boxX}
        y={boxY}
        width={boxWidth}
        height={boxHeight}
        rx={4}
        ry={4}
        fill="rgba(255,255,255,0.96)"
        stroke="#94A3B8"
        strokeWidth={0.8}
      />
      <text
        x={boxX + paddingX}
        y={boxY + boxHeight / 2 + 0.5}
        textAnchor="start"
        dominantBaseline="middle"
        fontSize={10}
        fontWeight={700}
        fill="#374151"
        style={{ userSelect: 'none' }}
      >
        {value}
      </text>
    </g>
  );
}
