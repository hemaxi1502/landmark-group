import { Suspense, useState, useEffect } from 'react';
import { Await, NavLink, useAsyncValue } from 'react-router';
import { useAnalytics, useOptimisticCart } from '@shopify/hydrogen';
import { useAside } from '~/components/Aside';
import { AnnouncementBar } from '~/components/AnnouncementBar';
import { SearchSuggestPanel, useSearchSuggest, useGoToSearch } from '~/components/search/SearchSuggest';
import { DesktopMegaMenu, MobileSubmenuList } from '~/components/MegaMenu';

const POPULAR_SEARCHES = [
  "Melange Kurta Set Women", "watch", "tops for women",
  "dresses for women", "kurta sets for women", "Melange kurtas",
  "CODE Tops for Women", "Shirts for men", "melange",
  "CODE Dresses for Women"
];

/**
 * @param {HeaderProps}
 */
export function Header({ header, isLoggedIn, cart, publicStoreDomain }) {
  const { shop, menu, topBar } = header;
  const [isScrolled, setIsScrolled] = useState(false);

  const announcements =
    header?.announcementBarMetaobjects?.nodes?.length > 0
      ? header.announcementBarMetaobjects.nodes
      : header?.announcementBarMetaobject
        ? [header.announcementBarMetaobject]
        : [];

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 100) {
            setIsScrolled(true);
          } else if (window.scrollY < 40) {
            setIsScrolled(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <TopBar topBar={topBar} />
      <div className="bg-white sticky top-0 border-b border-gray-200 z-50 w-full transition-all duration-300">
        <MainHeader cart={cart} isScrolled={isScrolled} metaobject={header.mainHeaderMetaobject} />
        <div className="page-width hidden lg:block pt-2">
          <HeaderMenu
            menu={menu}
            viewport="desktop"
            primaryDomainUrl={header.shop.primaryDomain.url}
            publicStoreDomain={publicStoreDomain}
            isScrolled={isScrolled}
          />
        </div>
      </div>
      <MobileSubHeader />
      <AnnouncementBar announcements={announcements} />
    </>
  );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */

// Helper to extract text from simple string or rich text JSON
function getFieldValue(fields, keys) {
  if (!fields) return '';
  for (const key of keys) {
    const field = fields.find((f) => f.key.toLowerCase() === key.toLowerCase());
    if (field?.value) return field.value;
  }
  return '';
}


const TopBar = ({ topBar }) => {
  const leftSideField = topBar?.fields?.find(f => f.key === 'top_bar_link_left_side');
  const rightSideField = topBar?.fields?.find(f => f.key === 'top_bar_link_right_side');

  const parseRichText = (str) => {
    if (!str) return '';
    try {
      const parsed = JSON.parse(str);
      // Basic extraction of text from Shopify Rich Text JSON
      if (parsed.children) {
        return parsed.children.map(p => {
          if (p.children) {
            return p.children.map(c => {
              if (c.type === 'link') {
                const url = c.url || '#';
                const text = c.children?.map(cc => cc.value).join('') || '';
                return `<a href="${url}" class="underline hover:text-black">${text}</a>`;
              }
              return c.value || '';
            }).join('');
          }
          return '';
        }).join('<br/>');
      }
      return str;
    } catch {
      return str;
    }
  };

  const parseLink = (node) => {
    const fields = node.fields || [];
    return {
      text: getFieldValue(fields, ['text']) || '',
      url: getFieldValue(fields, ['url']) || '#',
      iconUrl: fields.find(f => f.key === 'icon')?.reference?.image?.url || '',
      hoverText: parseRichText(getFieldValue(fields, ['hover_text']))
    };
  };

  let leftSideLinks = leftSideField?.references?.nodes?.map(parseLink) || [];
  let rightSideLinks = rightSideField?.references?.nodes?.map(parseLink) || [];

  const defaultLeft = [
    {
      text: 'Free Shipping',
      iconUrl: 'https://media-uk-india-banners.landmarkshops.in/LS-Fest/LS-new/LS-Shipping-icon-D-26JUNE23.png',
      hoverText: 'On All Orders'
    },
    {
      text: 'Click & Collect',
      iconUrl: 'https://media-uk-india-banners.landmarkshops.in/LS-Fest/LS-new/LS-CNC-icon-D-26JUNE23.png',
      hoverText: 'Order Online And Collect at a Store Of Your Choice For Free. <a href="#" class="underline hover:text-black">Learn more</a>'
    },
    {
      text: 'Return To Store',
      iconUrl: 'https://media-uk-india-banners.landmarkshops.in/LS-Fest/LS-new/LS-RTS-icon-D-26JUNE23.png',
      hoverText: 'Return to your nearest Store.'
    }
  ];

  const defaultRight = [
    { text: 'Delivering To', iconUrl: 'svg_delivering' },
    { text: 'Download Our Apps', url: '#' },
    { text: 'Store Locator', url: '#' },
    { text: 'Help', url: '#' }
  ];

  if (leftSideLinks.length === 0) {
    leftSideLinks = defaultLeft;
  }
  
  if (rightSideLinks.length === 0) {
    rightSideLinks = defaultRight;
  }

  return (
    <div className="bg-black hidden lg:block py-[9px]">
      <div className="page-width flex justify-between items-center">
        <div className="flex items-center gap-9">
          {leftSideLinks.map((link, index) => (
            <div key={`left-${index}`} className="relative group flex items-center">
              <div className="flex items-center cursor-pointer">
                {link.iconUrl ? (
                  <img src={link.iconUrl} alt={link.text} className="w-[20px] h-[20px]" />
                ) : (
                  defaultLeft[index]?.iconUrl ? (
                    <img src={defaultLeft[index].iconUrl} alt={link.text} className="w-[20px] h-[20px]" />
                  ) : null
                )}
                <span className="text-[14px] font-medium text-[#FFFFFF] ml-[8px]">{link.text}</span>
              </div>
              {link.hoverText && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-[14px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100]">
                  <div className="bg-white shadow-[0_2px_15px_rgba(0,0,0,0.15)] rounded-[2px] relative w-max max-w-[220px] min-w-[160px] px-4 py-3">
                    <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-white"></div>
                    <p 
                      className="text-[12px] text-[#292D35] font-normal leading-[1.4]"
                      dangerouslySetInnerHTML={{ __html: link.hoverText }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {rightSideLinks.map((link, index) => (
            <div key={`right-${index}`} className="flex items-center">
              {index > 0 && <span className="text-[#FFFFFF] opacity-50 mr-4">|</span>}
              <div className="flex items-center cursor-pointer group">
                {link.iconUrl === 'svg_delivering' || (!link.iconUrl && defaultRight[index]?.iconUrl === 'svg_delivering') ? (
                  <svg viewBox="649 374.5 18 19" className="w-[18px] h-[19px]">
                    <path d="M658 374.5C661.314 374.5 664 377.087 664 380.277C664 381.832 662.576 384.297 661.116 386.417C664.551 386.932 667 388.272 667 389.846C667 391.864 662.97 393.5 658 393.5C653.03 393.5 649 391.864 649 389.846C649 388.272 651.449 386.932 654.883 386.417C653.423 384.297 652 381.831 652 380.277C652 377.087 654.686 374.5 658 374.5ZM655.846 387.762C654.346 387.919 653.03 388.237 652.016 388.648C651.271 388.951 650.755 389.278 650.45 389.571C650.318 389.699 650.252 389.791 650.221 389.846C650.252 389.9 650.318 389.993 650.45 390.12C650.755 390.413 651.271 390.741 652.016 391.043C653.492 391.642 655.608 392.038 658 392.038C660.392 392.038 662.508 391.642 663.984 391.043C664.729 390.741 665.245 390.413 665.55 390.12C665.682 389.993 665.748 389.9 665.779 389.846C665.748 389.791 665.682 389.699 665.55 389.571C665.245 389.278 664.729 388.951 663.984 388.648C662.97 388.237 661.654 387.92 660.153 387.763C659.617 388.488 659.122 389.124 658.741 389.599C658.29 390.161 658 390.5 658 390.5C658 390.5 657.71 390.161 657.259 389.599C656.878 389.123 656.382 388.487 655.846 387.762ZM658 375.566C655.438 375.566 653.2 377.594 653.2 380.277C653.2 380.836 653.481 381.699 654.031 382.782C654.564 383.831 655.284 384.966 656.021 386.024C656.735 387.052 657.452 387.99 658 388.683C658.548 387.99 659.265 387.052 659.979 386.024C660.716 384.966 661.436 383.831 661.969 382.782C662.519 381.699 662.8 380.836 662.8 380.277C662.8 377.594 660.562 375.566 658 375.566ZM658 378.1C659.104 378.1 660 378.995 660 380.1C660 381.204 659.105 382.1 658 382.1C656.895 382.1 656 381.204 656 380.1C656 378.995 656.896 378.1 658 378.1ZM658 379.1C657.448 379.1 657 379.547 657 380.1C657 380.652 657.448 381.1 658 381.1C658.552 381.1 659 380.652 659 380.1C659 379.547 658.552 379.1 658 379.1Z" fill="#FFFFFF"/>
                  </svg>
                ) : link.iconUrl ? (
                  <img src={link.iconUrl} alt={link.text} className="w-[18px] h-[19px] object-contain" />
                ) : null}
                <a href={link.url} className={`text-[12px] font-bold text-[#FFFFFF] ${link.iconUrl || defaultRight[index]?.iconUrl === 'svg_delivering' ? 'ml-[4px]' : ''} hover:underline`}>
                  {link.text}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MainHeader = ({ cart, isScrolled, metaobject }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const suggest = useSearchSuggest();
  const goToSearch = useGoToSearch();

  // Extract metaobject fields
  const fields = metaobject?.fields || [];
  const getRefUrl = (key) => fields.find(f => f.key === key)?.reference?.image?.url;

  const logoUrl = getRefUrl('logo') || "https://assets-cloud.landmarkshops.in/website_images/static-pages/brand_exp/brand2images/logos/prod/lifestyle-logo-136x46.svg";
  const logoText = getFieldValue(fields, ['logo_text']) || "Lifestyle";
  
  const searchPlaceholder = getFieldValue(fields, ['search_placeholder']) || "What are you looking for?";
  
  // Popular searches comes from a reference to another metaobject containing "texts_with_link"
  const popularSearchesRef = fields.find(f => f.key === 'popular_searches')?.reference;
  let popularSearchesText = "Melange Kurta Set Women, watch, tops for women, dresses for women, kurta sets for women, Melange kurtas, CODE Tops for Women, Shirts for men, melange, CODE Dresses for Women";
  if (popularSearchesRef) {
    const textWithLinkField = getFieldValue(popularSearchesRef.fields, ['texts_with_link', 'texts_with_links']);
    if (textWithLinkField) {
      try {
        const parsed = JSON.parse(textWithLinkField);
        // Extract plain text from Rich text assuming it's separated by commas
        if (parsed.children && parsed.children[0]?.children?.[0]?.value) {
          popularSearchesText = parsed.children[0].children[0].value;
        } else {
          popularSearchesText = textWithLinkField;
        }
      } catch {
        popularSearchesText = textWithLinkField;
      }
    }
  }
  const popularSearches = popularSearchesText.split(',').map(s => s.trim()).filter(Boolean);

  const signInText = getFieldValue(fields, ['sign_in_text']) || "SIGN UP / SIGN IN";
  const signInLink = getFieldValue(fields, ['sign_in_link']) || "/account";

  const favoriteIconUrl = getRefUrl('favorite_icon');
  const favoriteText = getFieldValue(fields, ['favorite_text']) || "Favorites";
  const favoriteUrl = getFieldValue(fields, ['favorite_url']) || "/wishlist";

  const cartIconUrl = getRefUrl('cart_icon');
  const cartText = getFieldValue(fields, ['cart_text']) || "Basket";
  const cartUrl = getFieldValue(fields, ['cart_url']) || "/cart";

  const moreIconUrl = getRefUrl('more_icon');
  const moreText = getFieldValue(fields, ['more_text']) || "More";
  
  // Parse More Dropdown links from Rich Text
  const mainDropdownLinkTexts = getFieldValue(fields, ['main_dropdown_link_texts']);
  let moreLinks = [
    { text: "Download App", url: "#" },
    { text: "Online Gift Card", url: "#" },
    { text: "Store Locator", url: "#" },
    { text: "Lifestyle EDGE", url: "#" },
    { text: "Landmark Rewards SBI Credit card", url: "#" },
    { text: "Landmark Group Foundation", url: "#" },
    { text: "Gift Card Balance Check", url: "#" }
  ];
  if (mainDropdownLinkTexts) {
    try {
      const parsed = JSON.parse(mainDropdownLinkTexts);
      const links = [];
      parsed.children?.forEach(p => {
        p.children?.forEach(c => {
          if (c.type === 'link') {
            links.push({ text: c.children?.[0]?.value || '', url: c.url || '#' });
          } else if (c.type === 'text' && c.value.trim()) {
            // If it's just comma separated text in rich text
            c.value.split(',').forEach(text => {
              if (text.trim()) links.push({ text: text.trim(), url: '#' });
            });
          }
        });
      });
      if (links.length > 0) {
        moreLinks = links;
      }
    } catch {
      // If parsing fails, fall back to default
    }
  }

  return (
    <div className="bg-white lg:bg-[#F7F8F7]">
      {/* Top Row */}
      <div className="page-width !py-[12px] !px-[16px] lg:!py-0 lg:h-[72px] lg:!px-[1.5rem] flex justify-between items-center gap-4 lg:gap-8">
        
        <div className="flex items-center gap-4 lg:gap-6 flex-1 h-full">
          {/* Left Side: Logo */}
          <div className="flex items-center gap-3 lg:gap-4">
            <HeaderMenuMobileToggle />
            <NavLink to="/" prefetch="intent">
              <img src={logoUrl} alt={logoText} className="w-[85px] lg:w-[108px] h-auto lg:h-[40px] object-contain" />
            </NavLink>
          </div>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 w-full max-w-[470px] relative z-[110]">
            <div className={`flex flex-1 w-full h-[40px] items-center ${isSearchFocused ? 'bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] rounded-t-[2px]' : 'bg-[#ECEDEB] rounded-[1px]'} pr-3 pl-2 transition-colors`}>
              <svg viewBox="568 154 20 20" className="w-[18px] h-[18px] mr-4 shrink-0">
                <path d="M576.328 154C580.918 154 584.656 157.738 584.656 162.328C584.656 164.324 583.948 166.157 582.771 167.594L587.744 172.566C587.962 172.775 588.049 173.085 587.973 173.377C587.897 173.669 587.669 173.897 587.377 173.973C587.085 174.049 586.775 173.962 586.566 173.744L581.594 168.771C580.157 169.948 578.324 170.656 576.328 170.656C571.738 170.656 568 166.918 568 162.328C568 157.739 571.739 154 576.328 154ZM576.328 155.666C572.639 155.666 569.666 158.639 569.666 162.328C569.666 166.018 572.639 168.991 576.328 168.991C580.018 168.991 582.991 166.018 582.991 162.328C582.991 158.639 580.018 155.666 576.328 155.666Z" fill="#929391"/>
              </svg>
              <form
                role="search"
                className="w-full"
                onSubmit={(e) => {
                  e.preventDefault();
                  goToSearch(suggest.term);
                  e.currentTarget.querySelector('input')?.blur();
                }}
              >
                <input 
                  type="search" 
                  name="q"
                  aria-label="Search products"
                  autoComplete="off"
                  value={suggest.term}
                  onChange={(e) => suggest.setTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="bg-transparent border-none outline-none w-full text-[16px] text-[#292D35] placeholder-[#798086]"
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                />
              </form>
            </div>
            
            {isSearchFocused && (
              <div className="absolute top-full left-0 w-full max-h-[70vh] overflow-y-auto bg-white shadow-[0_4px_10px_rgba(0,0,0,0.05)] rounded-b-[2px] p-5 border-t border-gray-100">
                <SearchSuggestPanel
                  suggest={suggest}
                  popular={popularSearches}
                  onNavigate={() => setIsSearchFocused(false)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side CTAs */}
        <div className="flex items-center gap-4 lg:gap-8 h-full">
          <NavLink to={signInLink} prefetch="intent" className="hidden lg:block">
            <button className="bg-[#FAA619] text-[#FFFFFF] px-[16px] py-[9px] border border-[#faa619] font-medium text-[14px] rounded-[2px] hover:opacity-90 transition-opacity uppercase cursor-pointer">
              {signInText}
            </button>
          </NavLink>

          {/* Mobile Scrolled Search Icon */}
          {isScrolled && (
            <div className="lg:hidden flex flex-col items-center cursor-pointer hover:opacity-80">
              <svg viewBox="568 154 20 20" className="w-[22px] h-[22px]">
                <path d="M576.328 154C580.918 154 584.656 157.738 584.656 162.328C584.656 164.324 583.948 166.157 582.771 167.594L587.744 172.566C587.962 172.775 588.049 173.085 587.973 173.377C587.897 173.669 587.669 173.897 587.377 173.973C587.085 174.049 586.775 173.962 586.566 173.744L581.594 168.771C580.157 169.948 578.324 170.656 576.328 170.656C571.738 170.656 568 166.918 568 162.328C568 157.739 571.739 154 576.328 154ZM576.328 155.666C572.639 155.666 569.666 158.639 569.666 162.328C569.666 166.018 572.639 168.991 576.328 168.991C580.018 168.991 582.991 166.018 582.991 162.328C582.991 158.639 580.018 155.666 576.328 155.666Z" fill="#000000"/>
              </svg>
            </div>
          )}

          <div className="flex items-stretch gap-1 lg:gap-3 h-full relative">
            <a href={favoriteUrl} className="flex flex-col items-center justify-center cursor-pointer group hover:opacity-100 px-3 border-b-[3px] border-transparent hover:border-[#FAA619] transition-colors">
              {favoriteIconUrl ? (
                <img src={favoriteIconUrl} alt={favoriteText} className="w-[24px] h-[24px] group-hover:opacity-80" />
              ) : (
                <svg viewBox="603 154 22 20" className="w-[24px] h-[24px] group-hover:opacity-80">
                  <path fillRule="evenodd" clipRule="evenodd" d="M614 170.294L620.976 163.125C622.26 161.805 622.26 159.666 620.976 158.346C619.692 157.026 617.61 157.026 616.325 158.346L614.581 160.138C614.26 160.468 613.74 160.468 613.419 160.138L611.675 158.346C610.391 157.026 608.308 157.026 607.024 158.346C605.74 159.666 605.74 161.805 607.024 163.125L614 170.294ZM614 158.346L615.163 157.151C617.089 155.172 620.212 155.172 622.139 157.151C624.065 159.131 624.065 162.34 622.139 164.32L614.581 172.086C614.26 172.416 613.74 172.416 613.419 172.086L605.862 164.32C603.935 162.34 603.935 159.131 605.862 157.151C607.788 155.172 610.911 155.172 612.837 157.151L614 158.346Z" fill="#000000"/>
                </svg>
              )}
              <span className="hidden lg:block text-[10px] mt-1 font-semibold text-[#000000] group-hover:opacity-80">{favoriteText}</span>
            </a>

            <CartToggle cart={cart} customIconUrl={cartIconUrl} customText={cartText} customUrl={cartUrl} />

            <div className="hidden lg:flex flex-col items-center justify-center cursor-pointer group relative px-3 border-b-[3px] border-transparent hover:border-[#FAA619] transition-colors">
              {moreIconUrl ? (
                <img src={moreIconUrl} alt={moreText} className="w-[24px] h-[24px] group-hover:opacity-80" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#000000] group-hover:opacity-80">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                </svg>
              )}
              <span className="text-[10px] mt-1 font-semibold text-[#000000] group-hover:opacity-80">{moreText}</span>
              
              {/* More Dropdown */}
              <div className="absolute top-[100%] right-0 hidden group-hover:block w-max min-w-[240px] z-[120] pt-[2px]">
                <div className="bg-white border border-gray-100 shadow-[0_8px_16px_rgba(0,0,0,0.12)]">
                  <ul className="py-2 text-[13px] text-[#292D35] flex flex-col text-left">
                    {moreLinks.map((link, idx) => (
                      <li key={`more-${idx}`} className="px-5 py-2.5 hover:text-[#FAA619] hover:underline cursor-pointer transition-colors leading-[1.4]">
                        <a href={link.url} className="block w-full">{link.text}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileSubHeader = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const suggest = useSearchSuggest();
  const goToSearch = useGoToSearch();
  const closeSearch = () => {
    setIsSearchOpen(false);
    suggest.setTerm('');
  };

  return (
    <>
      <div className="lg:hidden bg-white">
        <div className="page-width !py-[12px] !px-[16px] lg:!px-[1.5rem] flex items-center justify-between border-t border-b border-gray-200 bg-[#FAFAFA]">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-[#000000]">
          <svg viewBox="649 374.5 18 19" className="w-[18px] h-[19px] shrink-0">
            <path d="M658 374.5C661.314 374.5 664 377.087 664 380.277C664 381.832 662.576 384.297 661.116 386.417C664.551 386.932 667 388.272 667 389.846C667 391.864 662.97 393.5 658 393.5C653.03 393.5 649 391.864 649 389.846C649 388.272 651.449 386.932 654.883 386.417C653.423 384.297 652 381.831 652 380.277C652 377.087 654.686 374.5 658 374.5ZM655.846 387.762C654.346 387.919 653.03 388.237 652.016 388.648C651.271 388.951 650.755 389.278 650.45 389.571C650.318 389.699 650.252 389.791 650.221 389.846C650.252 389.9 650.318 389.993 650.45 390.12C650.755 390.413 651.271 390.741 652.016 391.043C653.492 391.642 655.608 392.038 658 392.038C660.392 392.038 662.508 391.642 663.984 391.043C664.729 390.741 665.245 390.413 665.55 390.12C665.682 389.993 665.748 389.9 665.779 389.846C665.748 389.791 665.682 389.699 665.55 389.571C665.245 389.278 664.729 388.951 663.984 388.648C662.97 388.237 661.654 387.92 660.153 387.763C659.617 388.488 659.122 389.124 658.741 389.599C658.29 390.161 658 390.5 658 390.5C658 390.5 657.71 390.161 657.259 389.599C656.878 389.123 656.382 388.487 655.846 387.762ZM658 375.566C655.438 375.566 653.2 377.594 653.2 380.277C653.2 380.836 653.481 381.699 654.031 382.782C654.564 383.831 655.284 384.966 656.021 386.024C656.735 387.052 657.452 387.99 658 388.683C658.548 387.99 659.265 387.052 659.979 386.024C660.716 384.966 661.436 383.831 661.969 382.782C662.519 381.699 662.8 380.836 662.8 380.277C662.8 377.594 660.562 375.566 658 375.566ZM658 378.1C659.104 378.1 660 378.995 660 380.1C660 381.204 659.105 382.1 658 382.1C656.895 382.1 656 381.204 656 380.1C656 378.995 656.896 378.1 658 378.1ZM658 379.1C657.448 379.1 657 379.547 657 380.1C657 380.652 657.448 381.1 658 381.1C658.552 381.1 659 380.652 659 380.1C659 379.547 658.552 379.1 658 379.1Z" fill="#000000"/>
          </svg>
          <span>Enable location for a better experience</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500 shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
      <div className="page-width !py-[10px] !px-[16px] lg:!px-[1.5rem]">
        <div className="w-full h-[40px] relative flex items-center bg-[#ECEDEB] rounded-[2px] pr-3 pl-2">
          <svg viewBox="568 154 20 20" className="w-[18px] h-[18px] mr-3 shrink-0">
            <path d="M576.328 154C580.918 154 584.656 157.738 584.656 162.328C584.656 164.324 583.948 166.157 582.771 167.594L587.744 172.566C587.962 172.775 588.049 173.085 587.973 173.377C587.897 173.669 587.669 173.897 587.377 173.973C587.085 174.049 586.775 173.962 586.566 173.744L581.594 168.771C580.157 169.948 578.324 170.656 576.328 170.656C571.738 170.656 568 166.918 568 162.328C568 157.739 571.739 154 576.328 154ZM576.328 155.666C572.639 155.666 569.666 158.639 569.666 162.328C569.666 166.018 572.639 168.991 576.328 168.991C580.018 168.991 582.991 166.018 582.991 162.328C582.991 158.639 580.018 155.666 576.328 155.666Z" fill="#929391"/>
          </svg>
          <input 
            type="text" 
            placeholder="What are you looking for?" 
            className="bg-transparent border-none outline-none w-full text-[14px] text-[#292D35] placeholder-[#798086]" 
            onFocus={() => setIsSearchOpen(true)}
          />
          <svg viewBox="553 291 20 18" className="w-[20px] h-[18px] shrink-0 ml-2 cursor-pointer">
            <path d="M558 291H553V296" stroke="#000000" strokeWidth="1.2" fill="none"/>
            <path d="M568 291H573V296" stroke="#000000" strokeWidth="1.2" fill="none"/>
            <path d="M568 309H573V304" stroke="#000000" strokeWidth="1.2" fill="none"/>
            <path d="M558 309H553V304" stroke="#000000" strokeWidth="1.2" fill="none"/>
            <path d="M556.1 296H557.3V304H556.1V296Z" fill="#000000"/>
            <path d="M558.701 296H560.701V304H558.701V296Z" fill="#000000"/>
            <path d="M562.701 296H563.901V304H562.701V296Z" fill="#000000"/>
            <path d="M566.201 296H567.401V304H566.201V296Z" fill="#000000"/>
            <path d="M569.701 296H570.901V304H569.701V296Z" fill="#000000"/>
          </svg>
        </div>
      </div>
    </div>
      
      {isSearchOpen && (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col lg:hidden overflow-hidden">
          {/* Header */}
          <div className="flex items-center px-4 h-[60px] border-b border-gray-200 shrink-0 gap-3">
            <button onClick={closeSearch} aria-label="Close search" className="p-1 -ml-1 text-black">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <form
              role="search"
              className="flex-1 h-[40px] flex items-center bg-[#F4F4F4] rounded-[2px] px-3"
              onSubmit={(e) => {
                e.preventDefault();
                const q = suggest.term;
                closeSearch();
                goToSearch(q);
              }}
            >
              <input
                type="search"
                name="q"
                aria-label="Search products"
                autoComplete="off"
                enterKeyHint="search"
                value={suggest.term}
                onChange={(e) => suggest.setTerm(e.target.value)}
                placeholder="What are you looking for?"
                className="bg-transparent border-none outline-none w-full text-[14px] text-[#292D35]"
                ref={(el) => el?.focus()}
              />
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-white">
            {!suggest.term.trim() && (
              <>
            {/* Looking for a missing size */}
            <div className="bg-white rounded-[4px] p-4 mb-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-start mb-2 gap-4">
                <h3 className="text-[14px] font-bold text-[#000000] leading-[1.2]">Looking for a missing size in store?</h3>
                <button className="flex items-center gap-1.5 bg-[#FAA619] text-white px-2 py-1 rounded-[2px] text-[12px] font-bold shrink-0">
                  <svg viewBox="553 291 20 18" className="w-[16px] shrink-0 text-white" style={{ height: "auto" }}>
                    <path d="M558 291H553V296" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    <path d="M568 291H573V296" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    <path d="M568 309H573V304" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    <path d="M558 309H553V304" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    <path d="M556.1 296H557.3V304H556.1V296Z" fill="currentColor"/>
                    <path d="M558.701 296H560.701V304H558.701V296Z" fill="currentColor"/>
                    <path d="M562.701 296H563.901V304H562.701V296Z" fill="currentColor"/>
                    <path d="M566.201 296H567.401V304H566.201V296Z" fill="currentColor"/>
                    <path d="M569.701 296H570.901V304H569.701V296Z" fill="currentColor"/>
                  </svg>
                  Scan
                </button>
              </div>
              <p className="text-[12px] text-[#798086] leading-relaxed">
                Are you in a lifestyle store and unable to find your size in a product? Use our scan feature to scan the barcode of the product and get your desired size delivered to your doorstep
              </p>
            </div>

            {/* AI Banner */}
            <div className="bg-[#EBF3FE] flex items-center justify-between p-3 rounded-[4px] mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#146EE5] rounded-full flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-[#000000]">Get help from our AI assistant</h4>
                  <p className="text-[11px] text-[#4A5568] mt-0.5">AI-driven search for seamless shopping.</p>
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#4A5568]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>

              </>
            )}
            <SearchSuggestPanel suggest={suggest} popular={POPULAR_SEARCHES} onNavigate={closeSearch} />
          </div>
        </div>
      )}
    </>
  );
};

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
  isScrolled,
}) {
  const className = `header-menu-${viewport}`;
  const { close } = useAside();
  const [activeTabId, setActiveTabId] = useState(null);

  if (viewport === 'mobile') {
    const activeItem = (menu || FALLBACK_HEADER_MENU).items.find(i => i.id === activeTabId) || (menu || FALLBACK_HEADER_MENU).items[0];

    return (
      <nav className="flex flex-col w-full bg-white h-full pb-6" role="navigation">
        <div className="flex overflow-x-auto no-scrollbar w-full">
          {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
            const match = item.title.match(/^(.*?)\s*[\[(](https?:\/\/[^\s\])]+)/);
            const titleText = match ? match[1].trim() : item.title;
            const isActive = activeTabId === item.id || (!activeTabId && item.id === (menu || FALLBACK_HEADER_MENU).items[0]?.id);
            return (
              <button
                key={item.id}
                onClick={() => setActiveTabId(item.id)}
                className={`whitespace-nowrap px-4 py-3 text-[14px] font-semibold transition-colors border-b-[3px] ${isActive ? 'text-[#FAA619] border-[#FAA619]' : 'text-[#798086] border-white'}`}
              >
                {titleText}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeItem?.items?.length > 0 ? (
            <MobileSubmenuList
              key={activeItem.id}
              items={activeItem.items}
              opts={{ primaryDomainUrl, publicStoreDomain }}
              onNavigate={close}
            />
          ) : (
             <div className="flex flex-col">
               <NavLink
                  to={activeItem?.url || '/'}
                  className="px-4 py-4 text-[14px] font-semibold text-[#000000] border-b border-gray-100 flex justify-between items-center hover:bg-gray-50"
                  onClick={close}
                >
                  {activeItem?.title.match(/^(.*?)\s*[\[(]/) ? activeItem?.title.match(/^(.*?)\s*[\[(]/)[1].trim() : activeItem?.title}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
              </NavLink>
            </div>
          )}

          <div className="mt-2 flex flex-col">
             <NavLink to="/account" className="mx-4 my-2 text-center bg-white border border-gray-200 text-[#FAA619] py-[10px] rounded-[2px] font-semibold text-[14px]" onClick={close}>
               Sign Up / Sign In
             </NavLink>
             <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-2 cursor-pointer hover:bg-gray-50">
               <span className="text-[14px]">Missing Size In Store</span>
               <span className="bg-[#292D35] text-white text-[10px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">NEW</span>
             </div>
             <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-2 cursor-pointer hover:bg-gray-50">
               <span className="text-[14px]">In Store</span>
               <span className="bg-[#292D35] text-white text-[10px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">NEW</span>
             </div>
             <NavLink to="/help" className="px-4 py-4 border-b border-gray-100 text-[14px] hover:bg-gray-50" onClick={close}>Help</NavLink>
             <NavLink to="/apps" className="px-4 py-4 border-b border-gray-100 text-[14px] hover:bg-gray-50" onClick={close}>Download our Apps</NavLink>
             <NavLink to="/store-locator" className="px-4 py-4 border-b border-gray-100 text-[14px] hover:bg-gray-50" onClick={close}>Store Locator</NavLink>
             <NavLink to="/feedback" className="px-4 py-4 border-b border-gray-100 text-[14px] hover:bg-gray-50" onClick={close}>Feedback</NavLink>
             <NavLink to="/legal" className="px-4 py-4 border-b border-gray-100 text-[14px] hover:bg-gray-50" onClick={close}>Legal</NavLink>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <DesktopMegaMenu
      menu={menu || FALLBACK_HEADER_MENU}
      primaryDomainUrl={primaryDomainUrl}
      publicStoreDomain={publicStoreDomain}
      isScrolled={isScrolled}
    />
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({ isLoggedIn, cart }) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const { open } = useAside();
  return (
    <button
      type="button"
      aria-label="Open menu"
      className="lg:hidden flex flex-col justify-center items-center gap-[4px] w-6 h-6 mr-1"
      onClick={() => open('mobile')}
    >
      <span className="w-5 h-[2px] bg-black block rounded-sm"></span>
      <span className="w-5 h-[2px] bg-black block rounded-sm"></span>
      <span className="w-5 h-[2px] bg-black block rounded-sm"></span>
    </button>
  );
}

function SearchToggle() {
  const { open } = useAside();
  return (
    <button className="reset" onClick={() => open('search')}>
      Search
    </button>
  );
}

/**
 * @param {{count: number}}
 */
function CartBadge({ count, customIconUrl, customText, customUrl }) {
  const { open } = useAside();
  const { publish, shop, cart, prevCart } = useAnalytics();

  return (
    <a
      href={customUrl || "/cart"}
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
      className="flex flex-col items-center justify-center cursor-pointer relative group h-full px-3 lg:px-4 border-b-[3px] border-transparent hover:border-[#FAA619] transition-colors"
    >
      <div className="relative group-hover:opacity-80">
        {customIconUrl ? (
          <img src={customIconUrl} alt={customText || "Basket"} className="w-[24px] h-[24px]" />
        ) : (
          <svg viewBox="640 154 20 19" className="w-[24px] h-[24px]">
            <path fillRule="evenodd" clipRule="evenodd" d="M655.143 160.25H656.227C657.081 160.25 657.804 160.86 657.925 161.681L659.149 170.014C659.283 170.926 658.632 171.77 657.694 171.9C657.614 171.911 657.533 171.917 657.452 171.917H642.548C641.601 171.917 640.833 171.17 640.833 170.25C640.833 170.171 640.839 170.092 640.85 170.014L642.075 161.681C642.196 160.86 642.919 160.25 643.772 160.25H644.857C644.857 157.489 647.159 155.25 650 155.25C652.84 155.25 655.143 157.489 655.143 160.25ZM646.571 160.25H653.428C653.428 158.409 651.893 156.917 650 156.917C648.106 156.917 646.571 158.409 646.571 160.25ZM642.548 170.25L643.772 161.917H656.227L657.452 170.25H642.548Z" fill="#000000"/>
          </svg>
        )}
        {count > 0 && (
          <div className="absolute top-0 right-0 bg-[#FAA619] text-[#FFFFFF] rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold -mt-1 lg:-mr-1 -mr-2">{count}</div>
        )}
      </div>
      <span className="text-[10px] mt-1 font-semibold text-[#000000] hidden lg:block group-hover:opacity-80">{customText || "Basket"}</span>
    </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({ cart, customIconUrl, customText, customUrl }) {
  return (
    <Suspense fallback={<CartBadge count={0} customIconUrl={customIconUrl} customText={customText} customUrl={customUrl} />}>
      <Await resolve={cart}>
        <CartBanner customIconUrl={customIconUrl} customText={customText} customUrl={customUrl} />
      </Await>
    </Suspense>
  );
}

function CartBanner({ customIconUrl, customText, customUrl }) {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} customIconUrl={customIconUrl} customText={customText} customUrl={customUrl} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({ isActive, isPending }) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
