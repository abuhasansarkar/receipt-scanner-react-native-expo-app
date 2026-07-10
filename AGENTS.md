# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

## Summary

### Objective
Integrate OpenRouter AI for AI-powered receipt OCR, using free models that support images and PDFs, store results locally (Zustand) and in Supabase (PostgreSQL via Prisma schema).

### Important Details
- OpenRouter free router (`openrouter/free`) auto-selects a free model supporting the needed features (image understanding, PDF parsing)
- Image receipts: sent as `type: "image_url"` with base64 JPEG data
- PDF receipts: sent as `type: "file"` with `file_data` data URL; allowed only when using `openrouter/free` (not individual free models)
- `EXPO_PUBLIC_OPENROUTER_API_KEY` env var (falls back to existing `OPENROUTER` key); already present in `.env` as `OPENROUTER=sk-or-v1-...`
- App is offline-first — OpenRouter and Supabase are optional; when no API key is set, falls back to mock OCR
- `expo-auth-session` was downgraded from v57.0.2 -> v7.0.11 to fix `ExpoCryptoAES` missing native module (nested `expo-crypto@57` removed); `expo-secure-store` also downgraded v57->v15.0.8
- SDK 54 / Expo Router v6 / NativeWind v4 / Zustand v5 / Prisma 7.8.0

### Completed
- Fixed `ExpoCryptoAES` native module crash — ran `npx expo install expo-auth-session` (v57.0.2->v7.0.11), `npx expo install expo-crypto` (v15.0.9), `npx expo install expo-secure-store` (v57->v15.0.8)
- Created `lib/openrouter.ts`: typed client with `scanReceiptImage()` and `scanReceiptPDF()`; system prompt instructs LLM to output strict JSON receipt schema; `parseScanResult()` extracts JSON from model response; uses `openrouter/free` as the model
- Created `prisma/schema.prisma`: models `User`, `Receipt`, `ScanLog`, `SyncLog` matching app data shape; PostgreSQL provider for Supabase compatibility
- Installed `prisma` v7.8.0 as devDependency
- Wired OpenRouter into `features/scanner/service.ts` — `extractReceiptData()` and `extractReceiptDataFromPDF()` call OpenRouter when `EXPO_PUBLIC_OPENROUTER_API_KEY` is set, fall back to mock when absent
- Updated `features/scanner/hooks.ts` — added `processPDF()` and `pickPDF()` using `expo-document-picker` for PDF file selection
- Updated `app/(tabs)/scan.tsx` — added PDF import button (document icon) alongside gallery and capture buttons
- Updated `.env` — replaced `OPENROUTER` with `EXPO_PUBLIC_OPENROUTER_API_KEY`
- Updated `lib/supabase.ts` — centralized `syncReceiptsUp()` and `syncReceiptsDown()` functions
- Updated `features/receipts/service.ts` — uses centralized supabase sync instead of inline logic
- Installed `expo-document-picker` for PDF file picking
- TypeScript compiles cleanly (`npx tsc --noEmit` passes)

### Open Issues
- (none)
