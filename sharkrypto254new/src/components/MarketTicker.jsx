
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './MarketTicker.css';

const CURRENCIES = [
  'USD',
  'KES',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'JPY',
  'INR',
  'ZAR',
];

const COINS = [
  { id: 'bitcoin', symbol: 'BTC' },
  { id: 'ethereum', symbol: 'ETH' },
  { id: 'binancecoin', symbol: 'BNB' },
  { id: 'solana', symbol: 'SOL' },
  { id: 'ripple', symbol: 'XRP' },
  { id: 'cardano', symbol: 'ADA' },
  { id: 'dogecoin', symbol: 'DOGE' },
  { id: 'litecoin', symbol: 'LTC' },
];

const REFRESH_INTERVAL = 60 * 1000;

function formatPrice(value, currency) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
}

function formatChange(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function CoinItem({ coin, data, currency }) {
  const price = data?.[currency.toLowerCase()];
  const change = data?.[`${currency.toLowerCase()}_24h_change`];
  const formattedChange = formatChange(change);

  return (
    <div className="ticker-coin">
      <span className="coin-symbol">{coin.symbol}</span>

      <span className="coin-price">
        {formatPrice(price, currency)}
      </span>

      {formattedChange !== null && (
        <span
          className={`coin-change ${
            change >= 0 ? 'positive' : 'negative'
          }`}
        >
          {formattedChange}
        </span>
      )}
    </div>
  );
}

export default function MarketTicker() {
  const [currency, setCurrency] = useState('USD');
  const [menuOpen, setMenuOpen] = useState(false);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const selectorRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrices() {
      try {
        setError('');

        if (Object.keys(prices).length === 0) {
          setLoading(true);
        }

        const ids = COINS.map((coin) => coin.id).join(',');
        const currencies = CURRENCIES.map((item) =>
          item.toLowerCase()
        ).join(',');

        const url =
          `https://api.coingecko.com/api/v3/simple/price` +
          `?ids=${ids}` +
          `&vs_currencies=${currencies}` +
          `&include_24hr_change=true`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Price service returned HTTP ${response.status}`
          );
        }

        const result = await response.json();

        if (!cancelled) {
          setPrices(result);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load market prices.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPrices();

    const interval = setInterval(fetchPrices, REFRESH_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const hasPrices = COINS.some(
    (coin) =>
      typeof prices[coin.id]?.[currency.toLowerCase()] === 'number'
  );

  return (
    <section className="market-ticker" aria-label="Cryptocurrency prices">
      <div className="ticker-container">

        <div className="ticker-currency-area">
          <div className="currency-selector" ref={selectorRef}>
            <span className="selected-currency">{currency}</span>

            <button
              type="button"
              className="currency-toggle"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Choose display currency"
              aria-expanded={menuOpen}
            >
              <ChevronDown size={13} />
            </button>

            {menuOpen && (
              <div className="currency-dropdown">
                {CURRENCIES.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={`currency-option ${
                      currency === item ? 'selected' : ''
                    }`}
                    onClick={() => {
                      setCurrency(item);
                      setMenuOpen(false);
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="ticker-viewport">
          {loading && !hasPrices ? (
            <div className="ticker-message">
              Loading market prices...
            </div>
          ) : error && !hasPrices ? (
            <div className="ticker-message ticker-error">
              Market prices are currently unavailable.
            </div>
          ) : hasPrices ? (
            <div className="ticker-track">
              {[0, 1].map((group) => (
                <div
                  className="ticker-group"
                  key={group}
                  aria-hidden={group === 1}
                >
                  {COINS.map((coin) => (
                    <CoinItem
                      key={coin.id}
                      coin={coin}
                      data={prices[coin.id]}
                      currency={currency}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="ticker-message">
              No market prices available.
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
