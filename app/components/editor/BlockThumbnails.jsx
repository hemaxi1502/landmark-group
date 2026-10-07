/**
 * Pictorial thumbnails for the page-builder block library: a small coloured
 * illustration of what each block looks like on the site, so non-technical
 * editors can tell blocks apart at a glance. Pure SVG, no images to load.
 */

const ORANGE = '#FAA619';
const INK = '#1F2328';
const MUTED = '#9AA0A6';
const LINE = '#D9DCE0';
const FONT = 'Figtree, ui-sans-serif, system-ui, sans-serif';

const PASTELS = [
  '#FFE3C2',
  '#DCEBFF',
  '#E7F6E7',
  '#FDE2EC',
  '#EFE5FF',
  '#FFF3B8',
];
const SHIRTS = [
  '#F28C38',
  '#3B82F6',
  '#22A35A',
  '#E0457B',
  '#8B5CF6',
  '#D9A400',
];

/** Simple T-shirt icon centred at (cx, cy), about 2*s wide. */
function Shirt({cx, cy, s = 7, fill}) {
  const d = `M${cx - s} ${cy - s * 0.55} L${cx - s * 0.45} ${cy - s} L${cx - s * 0.18} ${cy - s} Q${cx} ${cy - s * 0.7} ${cx + s * 0.18} ${cy - s} L${cx + s * 0.45} ${cy - s} L${cx + s} ${cy - s * 0.55} L${cx + s * 0.72} ${cy - s * 0.12} L${cx + s * 0.5} ${cy - s * 0.3} L${cx + s * 0.5} ${cy + s} L${cx - s * 0.5} ${cy + s} L${cx - s * 0.5} ${cy - s * 0.3} L${cx - s * 0.72} ${cy - s * 0.12} Z`;
  return <path d={d} fill={fill} />;
}

/** Product card: tinted photo area with a shirt, name line and orange price. */
function ProductCard({x, y, w, h, i, price = true}) {
  const photoH = h * 0.66;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={photoH}
        rx="2"
        fill={PASTELS[i % 6]}
      />
      <Shirt
        cx={x + w / 2}
        cy={y + photoH / 2}
        s={Math.min(w, photoH) * 0.28}
        fill={SHIRTS[i % 6]}
      />
      <rect
        x={x}
        y={y + photoH + 3}
        width={w * 0.8}
        height="2.5"
        rx="1"
        fill={LINE}
      />
      {price && (
        <rect
          x={x}
          y={y + photoH + 7.5}
          width={w * 0.45}
          height="3"
          rx="1"
          fill={ORANGE}
        />
      )}
    </g>
  );
}

function Heading({x = 10, y = 9, w = 46, color = INK}) {
  return <rect x={x} y={y} width={w} height="4" rx="2" fill={color} />;
}

function Arrow({cx, cy, dir}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="5.5" fill="#fff" stroke={LINE} />
      <path
        d={
          dir < 0
            ? `M${cx + 1.2} ${cy - 2.5} L${cx - 1.6} ${cy} L${cx + 1.2} ${cy + 2.5}`
            : `M${cx - 1.2} ${cy - 2.5} L${cx + 1.6} ${cy} L${cx - 1.2} ${cy + 2.5}`
        }
        fill="none"
        stroke={INK}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

/* Category icons for the tiles thumbnail */
const ICONS = [
  // dress
  (cx, cy, c) => (
    <path d={`M${cx - 2.5} ${cy - 9} h5 l1 4 l5 13 h-17 l5 -13 z`} fill={c} />
  ),
  // shirt
  (cx, cy, c) => <Shirt cx={cx} cy={cy} s={7.5} fill={c} />,
  // shoe
  (cx, cy, c) => (
    <path
      d={`M${cx - 9} ${cy + 3} v-7 h5 q1 4 6 5 l7 1.5 q2 .5 2 2.5 v1 h-20 z`}
      fill={c}
    />
  ),
  // bag
  (cx, cy, c) => (
    <g>
      <path
        d={`M${cx - 4} ${cy - 3} q0 -6 4 -6 q4 0 4 6`}
        fill="none"
        stroke={c}
        strokeWidth="1.6"
      />
      <rect x={cx - 8} y={cy - 3} width="16" height="12" rx="2" fill={c} />
    </g>
  ),
  // lipstick
  (cx, cy, c) => (
    <g>
      <rect x={cx - 4} y={cy} width="8" height="9" rx="1" fill={INK} />
      <path d={`M${cx - 3} ${cy} v-6 l6 -4 v10 z`} fill={c} />
    </g>
  ),
];

const THUMBS = {
  banner: (
    <>
      <defs>
        <linearGradient id="tb-banner" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFB547" />
          <stop offset="1" stopColor="#F0567A" />
        </linearGradient>
      </defs>
      <rect x="6" y="8" width="148" height="80" rx="4" fill="url(#tb-banner)" />
      <circle cx="128" cy="30" r="16" fill="#fff" opacity="0.18" />
      <circle cx="140" cy="70" r="22" fill="#fff" opacity="0.12" />
      <text
        x="18"
        y="38"
        fontFamily={FONT}
        fontWeight="800"
        fontSize="19"
        fill="#fff"
      >
        SALE
      </text>
      <text
        x="18"
        y="50"
        fontFamily={FONT}
        fontWeight="600"
        fontSize="7.5"
        fill="#fff"
      >
        UP TO 50% OFF
      </text>
      <rect x="18" y="58" width="38" height="11" rx="5.5" fill="#fff" />
      <text
        x="37"
        y="65.6"
        textAnchor="middle"
        fontFamily={FONT}
        fontWeight="700"
        fontSize="5.5"
        fill={INK}
      >
        SHOP NOW
      </text>
      <circle cx="122" cy="48" r="12" fill="#fff" opacity="0.95" />
      <path d="M118.5 42.5 L128 48 L118.5 53.5 Z" fill="#F0567A" />
    </>
  ),

  product_carousel: (
    <>
      <Heading />
      {[0, 1, 2, 3].map((i) => (
        <ProductCard key={i} x={12 + i * 38} y={20} w={33} h={62} i={i} />
      ))}
      <Arrow cx={10} cy={40} dir={-1} />
      <Arrow cx={150} cy={40} dir={1} />
    </>
  ),

  product_grid: (
    <>
      <Heading />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <ProductCard
          key={i}
          x={10 + (i % 4) * 36}
          y={18 + Math.floor(i / 4) * 34}
          w={31}
          h={30}
          i={i + 1}
        />
      ))}
      <rect
        x="62"
        y="85"
        width="36"
        height="8"
        rx="1.5"
        fill="none"
        stroke={INK}
      />
      <text
        x="80"
        y="90.8"
        textAnchor="middle"
        fontFamily={FONT}
        fontWeight="700"
        fontSize="5"
        fill={INK}
      >
        VIEW ALL
      </text>
    </>
  ),

  category_tiles: (
    <>
      <Heading />
      {[0, 1, 2, 3, 4].map((i) => {
        const x = 9 + i * 29;
        return (
          <g key={i}>
            <rect
              x={x}
              y="20"
              width="25"
              height="50"
              rx="3"
              fill={PASTELS[i]}
            />
            {ICONS[i](x + 12.5, 45, SHIRTS[i])}
            <rect x={x + 3} y="75" width="19" height="3" rx="1.5" fill={INK} />
          </g>
        );
      })}
    </>
  ),

  brand_tiles: (
    <>
      <Heading />
      {[
        ['Aa', '#1F2328', 'serif'],
        ['K', '#E0457B', FONT],
        ['b', '#3B82F6', 'serif'],
        ['CO', '#22A35A', FONT],
        ['M', '#8B5CF6', 'serif'],
        ['F', '#F28C38', FONT],
      ].map(([t, c, f], i) => {
        const x = 10 + (i % 3) * 48;
        const y = 19 + Math.floor(i / 3) * 37;
        return (
          <g key={t}>
            <rect
              x={x}
              y={y}
              width="44"
              height="26"
              rx="3"
              fill="#F6F7F8"
              stroke={LINE}
            />
            <circle cx={x + 22} cy={y + 13} r="9" fill={c} />
            <text
              x={x + 22}
              y={y + 16.2}
              textAnchor="middle"
              fontFamily={f}
              fontWeight="800"
              fontSize="9"
              fill="#fff"
            >
              {t}
            </text>
            <rect
              x={x + 12}
              y={y + 29}
              width="20"
              height="2.5"
              rx="1"
              fill={MUTED}
            />
          </g>
        );
      })}
    </>
  ),

  price_bands: (
    <>
      <Heading />
      {['499', '999', '1,999', '2,999'].map((p, i) => {
        const x = 8 + i * 37;
        return (
          <g key={p}>
            <rect
              x={x}
              y="24"
              width="33"
              height="56"
              rx="3"
              fill={i === 1 ? ORANGE : '#FFF1D6'}
            />
            <text
              x={x + 16.5}
              y="44"
              textAnchor="middle"
              fontFamily={FONT}
              fontWeight="700"
              fontSize="5.5"
              fill={i === 1 ? '#fff' : '#8A5A00'}
            >
              UNDER
            </text>
            <text
              x={x + 16.5}
              y="58"
              textAnchor="middle"
              fontFamily={FONT}
              fontWeight="800"
              fontSize={p.length > 3 ? 8.5 : 10}
              fill={i === 1 ? '#fff' : INK}
            >
              ₹{p}
            </text>
          </g>
        );
      })}
    </>
  ),

  text: (
    <>
      <text
        x="80"
        y="30"
        textAnchor="middle"
        fontFamily={FONT}
        fontWeight="800"
        fontSize="13"
        fill={INK}
      >
        Aa
      </text>
      <rect x="40" y="38" width="80" height="5" rx="2.5" fill={INK} />
      <rect x="28" y="49" width="104" height="3" rx="1.5" fill={MUTED} />
      <rect x="36" y="56" width="88" height="3" rx="1.5" fill={MUTED} />
      <rect x="48" y="63" width="64" height="3" rx="1.5" fill={MUTED} />
      <rect x="58" y="72" width="44" height="12" rx="1.5" fill={INK} />
      <text
        x="80"
        y="80"
        textAnchor="middle"
        fontFamily={FONT}
        fontWeight="700"
        fontSize="5.5"
        fill="#fff"
      >
        SHOP NOW
      </text>
    </>
  ),

  home_section: (
    <>
      <rect
        x="8"
        y="8"
        width="144"
        height="80"
        rx="4"
        fill="#fff"
        stroke={LINE}
      />
      <rect x="8" y="8" width="144" height="10" rx="4" fill="#F1F2F4" />
      {[16, 22, 28].map((cx, i) => (
        <circle
          key={cx}
          cx={cx}
          cy="13"
          r="2"
          fill={['#F0567A', '#FFB547', '#22A35A'][i]}
        />
      ))}
      <rect x="40" y="10.5" width="80" height="5" rx="2.5" fill="#fff" />
      <defs>
        <linearGradient id="tb-home" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFE3C2" />
          <stop offset="1" stopColor="#FDE2EC" />
        </linearGradient>
      </defs>
      <rect x="14" y="24" width="132" height="30" rx="2" fill="url(#tb-home)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <circle
            cx={27 + i * 26.5}
            cy="68"
            r="8"
            fill={PASTELS[(i + 1) % 6]}
          />
          <Shirt
            cx={27 + i * 26.5}
            cy={68}
            s={4.5}
            fill={SHIRTS[(i + 1) % 6]}
          />
        </g>
      ))}
      <rect x="90" y="27" width="54" height="13" rx="6.5" fill={INK} />
      <path d="M96 34.5 l4 -3.5 l4 3.5 v3.5 h-8 z" fill="#fff" />
      <text
        x="124"
        y="35.6"
        textAnchor="middle"
        fontFamily={FONT}
        fontWeight="700"
        fontSize="5"
        fill="#fff"
      >
        HOMEPAGE
      </text>
    </>
  ),

  department: (
    <>
      <rect x="8" y="8" width="144" height="34" rx="3" fill="#F6F7F8" />
      <rect x="14" y="16" width="30" height="6" rx="2" fill={INK} />
      <rect x="14" y="26" width="38" height="3" rx="1.5" fill={MUTED} />
      <rect x="14" y="32" width="22" height="6" rx="1" fill={INK} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x={88 + i * 21}
            y="11"
            width="19"
            height="28"
            rx="2"
            fill={PASTELS[i]}
          />
          <Shirt cx={97.5 + i * 21} cy={25} s={6} fill={SHIRTS[i]} />
        </g>
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <circle
            cx={19 + i * 24.5}
            cy="54"
            r="7"
            fill={PASTELS[(i + 2) % 6]}
          />
          <rect
            x={13 + i * 24.5}
            y="63.5"
            width="12"
            height="2"
            rx="1"
            fill={MUTED}
          />
        </g>
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <ProductCard
          key={i}
          x={9 + i * 29}
          y={70}
          w={25}
          h={22}
          i={i + 3}
          price={false}
        />
      ))}
      <rect x="118" y="4" width="36" height="12" rx="6" fill={ORANGE} />
      <text
        x="136"
        y="12.2"
        textAnchor="middle"
        fontFamily={FONT}
        fontWeight="800"
        fontSize="6"
        fill="#fff"
      >
        ✦ AUTO
      </text>
    </>
  ),
};

/** Illustration of a block's layout. Decorative: the block name is beside it. */
export function BlockThumbnail({kind, className = ''}) {
  const art = THUMBS[kind];
  return (
    <span
      aria-hidden="true"
      className={`block shrink-0 overflow-hidden rounded-md border border-line bg-white ${className}`}
    >
      {art && (
        <svg viewBox="0 0 160 96" className="h-full w-full" role="presentation">
          {art}
        </svg>
      )}
    </span>
  );
}
