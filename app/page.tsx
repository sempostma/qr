import { Metadata } from 'next'
import QRCodeGenerator from './qr-code-generator'

export const metadata: Metadata = {
  title: 'QR Code Generator | Create Custom QR Codes Instantly',
  description: 'Generate custom QR codes quickly and easily with our free online QR code generator. Perfect for websites, business cards, and more. Customize colors, embed logos, and add UTM parameters for tracking.',
  openGraph: {
    title: 'QR Code Generator | Create Custom QR Codes Instantly',
    description: 'Generate custom QR codes quickly and easily with our free online QR code generator. Perfect for websites, business cards, and more. Customize colors, embed logos, and add UTM parameters for tracking.',
    // images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'QR Code Generator' }],
  },
}

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <main className="container max-w-screen-lg mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">QR Code Generator</h1>
        <p className="mb-6 text-lg">
          Create custom QR codes for your business, personal projects, or marketing campaigns. Our easy-to-use generator allows you to customize colors, embed logos, and add UTM parameters for tracking. Perfect for websites, business cards, product packaging, and more.
        </p>
        <QRCodeGenerator />
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Why Use Our QR Code Generator?</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Easy to use interface</li>
            <li>Customizable colors and designs</li>
            <li>Option to embed logos or images</li>
            <li>Advanced features like UTM parameter generation</li>
            <li>High-quality, scannable QR codes</li>
            <li>Free to use</li>
          </ul>
        </section>

        {/* <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="https://nextjs.org/icons/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div> */}
      </main>
      {/* <footer className="container mx-auto p-20 row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer> */}
    </div>
  );
}
