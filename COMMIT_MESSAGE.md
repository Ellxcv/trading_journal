feat: Enhance trades page filtering UX with manual search and smooth updates

## Features Added

### Manual Search Trigger

- Add Search button to trigger filter instead of auto-debounce
- Implement Enter key support for quick search submission
- Remove auto-trigger debounce logic (1s delay) for better UX control

### Date Filter Improvements

- Add placeholders to date inputs ("Start Date" and "End Date")
- Fix timezone bug causing off-by-one date errors
- Set end date to end-of-day (23:59:59.999) to include full day range

### UI/UX Optimizations

- Add React Query `placeholderData` to prevent full page refresh
- Implement loading overlay with smooth transitions
- Configure `staleTime` (30s) and `refetchOnWindowFocus: false`
- Keep previous data visible during filter updates (no blank screen)

## Technical Changes

### Frontend

- **TradeFilters.tsx**
  - Add local search state and Search button component
  - Add Enter key handler for search input
  - Add date input placeholders

- **TradesPage.tsx**
  - Remove debounce logic and `useEffect` hook
  - Add `placeholderData`, `staleTime`, `refetchOnWindowFocus` config
  - Add loading overlay for smooth filter transitions
  - Use `isFetching` state for loading indicator

### Backend

- **trades.service.ts**
  - Refactor date filtering logic with proper timezone handling
  - Set startDate to beginning of day (00:00:00.000)
  - Set endDate to end of day (23:59:59.999)
  - Consolidate date filter logic into dedicated block

## Impact

- ✅ All filters (status, direction, profit/loss, dates, search) update smoothly
- ✅ No full page refresh or UI jump during filter changes
- ✅ Previous data stays visible during updates
- ✅ Better user control with manual search trigger
- ✅ Accurate date filtering regardless of timezone

## Files Modified

- frontend/src/components/trades/TradeFilters.tsx
- frontend/src/pages/TradesPage.tsx
- backend/src/trades/trades.service.ts
