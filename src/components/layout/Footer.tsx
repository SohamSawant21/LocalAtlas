import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-surface-container-highest dark:bg-surface-container-highest w-full mt-stack-lg py-stack-lg border-t border-surface-container-highest">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-desktop max-w-container-max mx-auto md:px-margin-desktop px-margin-mobile">
        <div className="md:col-span-2">
          <Link
            href="/"
            className="text-headline-md font-headline-md font-bold text-primary dark:text-primary-fixed block mb-4"
          >
            LocalAtlas
          </Link>
          <p className="font-body-md text-body-md text-on-surface dark:text-on-surface mb-4">
            © {new Date().getFullYear()} LocalAtlas. Crafted for the Konkan Coast.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-label-md text-label-md text-on-surface-variant mb-2">Platform</span>
          <Link
            href="/about"
            className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-all duration-200 hover:opacity-80"
          >
            About
          </Link>
          <Link
            href="/guidelines"
            className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-all duration-200 hover:opacity-80"
          >
            Guidelines
          </Link>
          <Link
            href="/contribute"
            className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-all duration-200 hover:opacity-80"
          >
            Become a Local Guide
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-label-md text-label-md text-on-surface-variant mb-2">Social</span>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-all duration-200 hover:opacity-80"
          >
            Instagram
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer"
            className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-all duration-200 hover:opacity-80"
          >
            YouTube
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-all duration-200 hover:opacity-80"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
