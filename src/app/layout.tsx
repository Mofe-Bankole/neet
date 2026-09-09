import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { HeroUIProviderWrapper } from '@/components/HeroUIProvider'

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: ".neet — Your identity on Nimiq",
  description: "Claim your human-readable identity on Nimiq. Build portable reputation through real wallet activity, payments, and endorsements.",
  openGraph: {
    title: ".neet — Your identity on Nimiq",
    description: "Claim your human-readable identity on Nimiq. Build portable reputation through real wallet activity, payments, and endorsements.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <HeroUIProviderWrapper>{children}</HeroUIProviderWrapper>
      </body>
    </html>
  );
}