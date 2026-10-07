import {useState} from 'react';
import {Link, useNavigate} from 'react-router';
import {Icon} from '~/components/ui/Icon';
import {Modal} from '~/components/ui/Modal';
import {withWidth} from '~/components/home/parts';
import {SizeChart} from '~/components/pdp/SizeChart';
const COLOUR_NAMES = ['color', 'colour'];
/**
 * PDP · Colour Swatches + Size Selector (+ Size Guide popup).
 *
 * Driven by Hydrogen's getProductOptions(), so combined listings (each colour
 * a separate product) and unavailable combinations are handled for free.
 * Option values that would change product render as real links for SEO;
 * the rest update the URL search params without a navigation.
 */
export function ProductOptions({options, sizeChartUrl, sizeChartKind}) {
  return (
    <div className="space-y-5">
      {options.map((option) => {
        if (
          option.optionValues.length === 1 &&
          !COLOUR_NAMES.includes(option.name.toLowerCase())
        )
          return null;
        const isColour = COLOUR_NAMES.includes(option.name.toLowerCase());
        const selected = option.optionValues.find((v) => v.selected);
        return (
          <fieldset key={option.name}>
            <legend className="mb-2 flex w-full items-center justify-between text-sm">
              <span>
                <span className="font-semibold">{option.name}:</span>{' '}
                <span className="text-muted">{selected?.name}</span>
              </span>
              {!isColour && /size/i.test(option.name) && (
                <SizeGuide
                  chartUrl={sizeChartUrl}
                  kind={sizeChartKind}
                  selectedSize={selected?.name}
                />
              )}
            </legend>
            <div className="flex flex-wrap gap-2">
              {option.optionValues.map((value) =>
                isColour ? (
                  <ColourSwatch key={value.name} value={value} />
                ) : (
                  <SizePill key={value.name} value={value} />
                ),
              )}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
function useSelect(value) {
  const navigate = useNavigate();
  return () => {
    if (value.selected) return;
    void navigate(`?${value.variantUriQuery}`, {
      replace: true,
      preventScrollReset: true,
    });
  };
}
function SizePill({value}) {
  const select = useSelect(value);
  const cls = `min-w-12 rounded border px-3 py-2 text-sm transition ${value.selected ? 'border-ink bg-ink text-white' : 'border-line hover:border-ink'} ${value.available ? '' : 'text-muted line-through decoration-muted'}`;
  if (value.isDifferentProduct) {
    return (
      <Link
        to={`/products/${value.handle}?${value.variantUriQuery}`}
        replace
        preventScrollReset
        className={cls}
      >
        {value.name}
      </Link>
    );
  }
  return (
    <button
      type="button"
      disabled={!value.exists}
      onClick={select}
      aria-pressed={value.selected}
      aria-label={`${value.name}${value.available ? '' : ' (out of stock)'}`}
      className={cls}
    >
      {value.name}
    </button>
  );
}
function ColourSwatch({value}) {
  const select = useSelect(value);
  const color = value.swatch?.color;
  const image =
    value.swatch?.image?.previewImage?.url ??
    value.firstSelectableVariant?.image?.url;
  const inner = (
    <span
      className={`block h-10 w-10 overflow-hidden rounded-full border-2 ${value.selected ? 'border-ink' : 'border-line'} ${value.available ? '' : 'opacity-40'}`}
      style={{backgroundColor: color ?? undefined}}
    >
      {!color && image && (
        <img
          src={withWidth(image, 80)}
          alt=""
          className="h-full w-full object-cover"
        />
      )}
      {!color && !image && (
        <span className="flex h-full w-full items-center justify-center text-[10px]">
          {value.name.slice(0, 3)}
        </span>
      )}
    </span>
  );
  if (value.isDifferentProduct) {
    return (
      <Link
        to={`/products/${value.handle}?${value.variantUriQuery}`}
        replace
        preventScrollReset
        aria-label={value.name}
        title={value.name}
      >
        {inner}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={select}
      aria-label={value.name}
      title={value.name}
      aria-pressed={value.selected}
    >
      {inner}
    </button>
  );
}
/**
 * Size Guide popup. Shows the product's `custom.size_chart` image when
 * present, otherwise the standard chart for its category (SizeChart.jsx).
 */
function SizeGuide({chartUrl, kind, selectedSize}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-brand underline"
      >
        Size Guide
      </button>
      <Modal open={open} onClose={() => setOpen(false)} label="Size guide">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Size Guide</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close size guide"
          >
            <Icon name="close" />
          </button>
        </div>
        {chartUrl ? (
          <img src={chartUrl} alt="Size chart" className="w-full" />
        ) : (
          <SizeChart kind={kind} selectedSize={selectedSize} />
        )}
      </Modal>
    </>
  );
}
