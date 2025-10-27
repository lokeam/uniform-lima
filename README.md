**Uplabelr** is a showcase of custom media tools for (image/video/text) to help label data accurately and efficiently along with techniques for handling large, multi-file uploads.


## Screenshots

<img width="668" alt="Screenshot 2025-10-27 at 4 44 55 AM" src="https://github.com/user-attachments/assets/a35153cd-c067-4f75-a55e-7f18800227c1" />

<img width="668" alt="Screenshot 2025-10-27 at 4 45 31 AM" src="https://github.com/user-attachments/assets/c737af04-b3ca-47c2-89d6-02aa0d3cb5bd" />

<img width="668" alt="Uplabelr_manual" src="https://github.com/user-attachments/assets/2ea3ca8e-85ee-4f65-8d11-abfe33b1d871" />

## Technical Highlights
<details>
  <summary>🛠️ Tech Stack & Tooling</summary>

  **Frontend/Backend**
  - Next.js 15 (App Router)
  - React 19 + TypeScript 5
  - TailwindCSS 4 (inline @theme)

  - Fumadocs UI (MDX-powered docs)
  - Radix UI primitives for accessible components

</details>

<details>
  <summary>⚙️ Demo Features Include:</summary>

  **Chunked + Batch Uploads**
  * 5MB chunks via FileReader API for large files (no timeouts)
  * Sequential/parallel processing with granular progress tracking
  * Client-side file splitting to avoid server memory constraints
  * Multi-file drag-and-drop with validation
  
  **DOM Parsing & Selection Mapping**
  - TreeWalker API traverses rendered DOM, filters tooltip nodes while preserving labeled spans
  - Word-index mapping that splits source text and counts words before selection to determine precise start/end indices
  - Normalization layer that handles trailing punctuation and whitespace variations
  - Range preservation using cloneRange() to maintain selection state across async operations
  - Conflict detection with mismatch validation between expected and actual selected text

  **Caching & Persistence**:
  - SessionStorage auto-saves labels on every change (zero data loss on refresh)
  - Export to JSON/CSV/JSONL for NLP training pipelines
</details>


## Getting Started


```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
