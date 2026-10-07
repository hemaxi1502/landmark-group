import {useState} from 'react';

/**
 * Standard size charts shown in the PDP Size Guide when the product has no
 * `custom.size_chart` image. Body measurements in inches (converted to cm on
 * toggle). Brands vary, so the chart is labelled as a standard guide.
 *
 * Edit the numbers here; add a `custom.size_chart` image metafield to a
 * product to show its own chart instead.
 */
export const SIZE_CHARTS = {
  menTops: {
    title: 'Men · Topwear',
    columns: ['Size', 'Chest', 'Length', 'Shoulder'],
    unitCols: [1, 2, 3],
    rows: [
      ['S', 38, 27, 17],
      ['M', 40, 28, 17.5],
      ['L', 42, 29, 18],
      ['XL', 44, 30, 18.5],
      ['XXL', 46, 31, 19],
      ['3XL', 48, 32, 19.5],
    ],
  },
  womenTops: {
    title: 'Women · Topwear',
    columns: ['Size', 'Bust', 'Waist', 'Length'],
    unitCols: [1, 2, 3],
    rows: [
      ['XS', 32, 26, 24],
      ['S', 34, 28, 25],
      ['M', 36, 30, 25.5],
      ['L', 38, 32, 26],
      ['XL', 40, 34, 26.5],
      ['XXL', 42, 36, 27],
      ['3XL', 44, 38, 27.5],
    ],
  },
  bottoms: {
    title: 'Bottomwear',
    columns: ['Size', 'Also fits', 'Waist', 'Hip'],
    unitCols: [2, 3],
    rows: [
      ['28', 'S', 28, 36],
      ['30', 'S / M', 30, 38],
      ['32', 'M / L', 32, 40],
      ['34', 'L / XL', 34, 42],
      ['36', 'XL / XXL', 36, 44],
      ['38', 'XXL', 38, 46],
      ['40', '3XL', 40, 48],
    ],
  },
  footwear: {
    title: 'Footwear',
    columns: ['UK', 'EU', 'US (Men)', 'Foot length (cm)'],
    unitCols: [],
    rows: [
      ['3', 36, 4, 22.5],
      ['4', 37, 5, 23.2],
      ['5', 38, 6, 24],
      ['6', 39, 7, 24.8],
      ['7', 41, 8, 25.5],
      ['8', 42, 9, 26.3],
      ['9', 43, 10, 27],
      ['10', 44, 11, 27.9],
      ['11', 45, 12, 28.6],
    ],
  },
  kids: {
    title: 'Kids',
    columns: ['Age', 'Chest', 'Waist', 'Height (cm)'],
    unitCols: [1, 2],
    rows: [
      ['2-3Y', 21, 20.5, '92-98'],
      ['3-4Y', 22, 21, '98-104'],
      ['4-5Y', 23, 21.5, '104-110'],
      ['5-6Y', 24, 22, '110-116'],
      ['7-8Y', 25.5, 23, '122-128'],
      ['9-10Y', 27, 24, '134-140'],
      ['11-12Y', 28.5, 25, '146-152'],
      ['13-14Y', 30, 26, '158-164'],
    ],
  },
};

const FOOTWEAR =
  /shoe|sandal|flip.?flop|slipper|sneaker|heel|boot|loafer|footwear/i;
const BOTTOMS =
  /jeans|trouser|pant|legging|short|track|pyjama|jogger|skirt|churidar|palazzo/i;

/** Picks the chart from the product's title and collections. */
export function sizeChartKind({title = '', collections = []}) {
  const handles = collections.map((c) => c.handle).join(' ');
  if (FOOTWEAR.test(title) || /footwear|shoes/.test(handles)) return 'footwear';
  if (/\b(kids|boys|girls|baby|infant)\b/.test(handles.replace(/-/g, ' ')))
    return 'kids';
  if (BOTTOMS.test(title)) return 'bottoms';
  if (/\bwomen\b/.test(handles.replace(/-/g, ' '))) return 'womenTops';
  return 'menTops';
}

const toCm = (v) => (typeof v === 'number' ? Math.round(v * 2.54) : v);

export function SizeChart({kind, selectedSize}) {
  const [unit, setUnit] = useState('in');
  const chart = SIZE_CHARTS[kind] ?? SIZE_CHARTS.menTops;
  const hasUnits = chart.unitCols.length > 0;
  const selected = String(selectedSize ?? '').toLowerCase();

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">{chart.title}</p>
        {hasUnits && (
          <div
            className="inline-flex rounded-full border border-line p-0.5 text-xs"
            role="group"
            aria-label="Units"
          >
            {['in', 'cm'].map((u) => (
              <button
                key={u}
                type="button"
                aria-pressed={unit === u}
                onClick={() => setUnit(u)}
                className={`rounded-full px-3 py-1 font-semibold ${unit === u ? 'bg-ink text-white' : 'text-muted'}`}
              >
                {u === 'in' ? 'Inches' : 'cm'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] border-collapse text-center text-sm">
          <thead>
            <tr className="bg-surface">
              {chart.columns.map((c) => (
                <th
                  key={c}
                  className="border border-line px-3 py-2 font-semibold"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chart.rows.map((row) => {
              const isSelected =
                selected && String(row[0]).toLowerCase() === selected;
              return (
                <tr
                  key={row[0]}
                  className={isSelected ? 'bg-brand/10 font-semibold' : ''}
                  aria-current={isSelected ? 'true' : undefined}
                >
                  {row.map((cell, i) => (
                    <td key={i} className="border border-line px-3 py-2">
                      {unit === 'cm' && chart.unitCols.includes(i)
                        ? toCm(cell)
                        : cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded bg-surface p-3 text-xs text-muted">
        <p className="mb-1 font-semibold text-ink">How to measure</p>
        {kind === 'footwear' ? (
          <p>
            Stand on paper, mark the heel and longest toe, and measure the
            distance. Pick the size whose foot length is closest; between sizes,
            go up.
          </p>
        ) : (
          <ul className="list-disc space-y-0.5 pl-4">
            <li>
              Chest/Bust: around the fullest part, tape level under the arms.
            </li>
            <li>Waist: around your natural waistline.</li>
            <li>Hip: around the fullest part of the hips.</li>
          </ul>
        )}
        <p className="mt-2">
          Standard body measurements. Fit can vary by brand and style.
        </p>
      </div>
    </div>
  );
}
