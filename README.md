# Flowbox - Premium Next.js Landing Page

Flowbox is an Awwwards-level, responsive, and modern landing page built using Next.js (App Router), TypeScript, and Tailwind CSS. It is engineered with premium aesthetics, smooth scroll animations, and interactive bento widgets.

## ✨ Key Features

- **3D Curved Portrait Gallery:** An interactive, hardware-accelerated portrait grid that dynamically rotates and scales based on page scroll, creating an immersive depth effect.
- **Asymmetric Bento Grid:** A responsive grid showcasing product benefits with custom built-in widgets (Live Task Checklist, Team Calendar sync, and custom graphic masks).
- **Responsive Navigation & Footer:** A sticky header with a clean glassmorphism backdrop blur effect, sentence-case styling, and interactive Lucide icons.
- **Social Impact Testimonials:** High-fidelity layouts presenting client feedback, metric key performance indicators (KPIs), and animated active member groups.
- **Optimized Fonts:** Powered by Google Fonts (Playfair Display for serif headings and Plus Jakarta Sans for body copy) utilizing `next/font` for zero layout shifts.

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4)
- **Animation:** Framer Motion
- **Icons:** Lucide React

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js (v18+) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ChetanSingh14/clothing.git
   cd clothing
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```text
src/
├── app/
│   ├── globals.css      # Core styles & Tailwind configuration
│   ├── layout.tsx       # Typography, global font imports & page setup
│   └── page.tsx         # Page layout assembly
└── components/
    ├── Header.tsx       # Sticky navigation
    ├── Hero.tsx         # Headline & 3D perspective gallery
    ├── BentoGrid.tsx    # Asymmetric feature grid & custom mockups
    ├── Testimonials.tsx # Metric statistics & customer review sliders
    └── Footer.tsx       # Minimalist social links
```
