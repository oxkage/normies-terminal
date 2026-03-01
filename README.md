# 📟 Normies Terminal (NORMIE_OS)

A retro-style web terminal interface to visualize and share Normie NFT data. 

Built with a focus on efficiency and social sharing, Normies Terminal allows you to fetch on-chain data and convert it into high-fidelity ASCII/Braille art ready for the "Normie" community.

## 🚀 Features

- **On-Chain Data Fetching:** Instantly retrieve pixel data and metadata for any Normie Token ID.
- **Advanced Braille Encoding:** A custom compression engine that maps a 40x40 grid into a 20x10 Braille character block (200 chars total), perfectly fitting within Twitter's 280-character limit.
- **Dual Display Modes:**
  - **BLOCKS:** High-fidelity large grid optimized for Discord and Desktop environments.
  - **BRAILLE:** Ultra-compressed art optimized for mobile sharing on X (Twitter) and Telegram.
- **Noir Mode:** Toggle between light and high-contrast dark terminal aesthetics.
- **One-Click Sharing:** Integrated "Post to X" functionality and clipboard support.

## 🛠️ Tech Stack

- **Framework:** [React](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Deployment:** [Vercel](https://vercel.com/)

## ⌨️ Development

To run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/oxkage/normies-terminal.git
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```

## 📜 Metadata Architecture

The terminal decrypts and logs metadata traits in real-time, providing a technical breakdown of the Token ID's attributes alongside its visual representation.

---
Built with 🌸 by [Kage-kun](https://x.com/oxkagee)
