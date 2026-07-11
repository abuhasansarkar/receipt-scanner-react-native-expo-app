# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

## Summary

### Objective
Integrate Google Gemini AI for AI-powered receipt OCR using the free `gemini-2.0-flash` model that supports images and PDFs; store results locally (Zustand) and optionally in Supabase (PostgreSQL via Prisma schema).

### Important Details
- Uses Google Gemini 2.0 Flash (`gemini-2.0-flash`) via REST API — supports both images (base64 JPEG) and PDFs (base64) as `inlineData`
- Image receipts: sent as `inlineData` with `mimeType: "image/jpeg"`
- PDF receipts: sent as `inlineData` with `mimeType: "application/pdf"`
- `EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY` env var (falls back to `GOOGLE_GEMINI_API_KEY`); already present in `.env`
- App is offline-first — Gemini and Supabase are optional; when no API key is set, falls back to mock OCR
- `expo-auth-session` was downgraded from v57.0.2 -> v7.0.11 to fix `ExpoCryptoAES` missing native module (nested `expo-crypto@57` removed); `expo-secure-store` also downgraded v57->v15.0.8
- SDK 54 / Expo Router v6 / NativeWind v4 / Zustand v5 / Prisma 7.8.0

### Completed
- Fixed `ExpoCryptoAES` native module crash — ran `npx expo install expo-auth-session` (v57.0.2->v7.0.11), `npx expo install expo-crypto` (v15.0.9), `npx expo install expo-secure-store` (v57->v15.0.8)
- Created `lib/gemini.ts`: typed client with `scanReceiptImage()` and `scanReceiptPDF()`; system prompt instructs LLM to output strict JSON receipt schema; `parseScanResult()` extracts JSON from model response; uses `gemini-2.0-flash` model
- Created `prisma/schema.prisma`: models `User`, `Receipt`, `ScanLog`, `SyncLog` matching app data shape; PostgreSQL provider for Supabase compatibility
- Installed `prisma` v7.8.0 as devDependency
- Wired Gemini into `features/scanner/service.ts` — `extractReceiptData()` and `extractReceiptDataFromPDF()` call Gemini when `EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY` is set, fall back to mock when absent
- Updated `features/scanner/hooks.ts` — added `processPDF()` and `pickPDF()` using `expo-document-picker` for PDF file selection
- Updated `app/(tabs)/scan.tsx` — added PDF import button (document icon) alongside gallery and capture buttons
- Updated `.env` — added `EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY`, removed OpenRouter
- Updated `lib/supabase.ts` — centralized `syncReceiptsUp()` and `syncReceiptsDown()` functions
- Updated `features/receipts/service.ts` — uses centralized supabase sync instead of inline logic
- Installed `expo-document-picker` for PDF file picking
- TypeScript compiles cleanly (`npx tsc --noEmit` passes)

### Open Issues
- (none)
