## Packages
use-debounce | Required for debouncing market search input
recharts | Data visualization for portfolio composition
framer-motion | Page transitions and rich micro-interactions
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging tailwind classes

## Notes
- The application uses a strictly dark-themed premium financial aesthetic.
- Relies on `@shared/routes` and `@shared/schema` for API contracts.
- Market search API expects `?q={query}` and Quote expects `?symbol={symbol}`.
- Dashboard analytics refetches upon asset mutations.
