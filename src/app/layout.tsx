import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import './globals.css';

// Open Sans chosen deliberately — it's the most readable sans-serif
// at small sizes for dense legal/financial content, better than Inter
// for long-form reading which this app requires
const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '800'],
  variable: '--font-open-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mietrecht Assistant — Renter Rights in Germany 2025',
  description:
    'Know your rights as a tenant in Germany. Check if your rent is legal, understand the Mietpreisbremse, dispute deposit deductions, and generate formal letters to your landlord. Free, in English and German.',
  keywords: [
    'mietrecht',
    'tenant rights germany',
    'mietpreisbremse',
    'renter rights germany',
    'kaution germany',
    'nebenkosten',
    'german tenant law',
    'mieterrechte',
    'mieterhöhung',
  ],
  openGraph: {
    title: 'Mietrecht Assistant — Renter Rights in Germany',
    description:
      'Check if your rent is legal, understand your rights, and write formal letters to your landlord.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning on both html and body prevents false hydration
    // errors caused by browser extensions (Grammarly, QuillBot, etc.) that
    // inject their own attributes into the DOM before React hydrates
    <html lang="en" className={openSans.variable} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}