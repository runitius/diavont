import { Cormorant_Garamond, Montserrat } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata = {
  title: 'DIAVONT — Fine Jewelry & Diamonds',
  description:
    'Diavont creates exceptional fine jewelry and diamond pieces, handcrafted with meticulous attention to detail since 1987.',
  keywords: 'luxury jewelry, diamonds, fine jewelry, engagement rings, bespoke jewelry',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable}`}>
      <body className="bg-obsidian text-cream font-montserrat antialiased">
        {children}
      </body>
    </html>
  );
}
