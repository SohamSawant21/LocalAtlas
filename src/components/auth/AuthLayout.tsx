import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  image: string;
  title: string;
  description: string;
}

export function AuthLayout({ children, image, title, description }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 overflow-hidden">
         {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={image} 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-70 transition-transform duration-1000 hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-16 left-16 right-16 text-white">
          <Link href="/" className="inline-block mb-8 text-3xl font-bold flex items-center gap-2">
            <span className="bg-primary text-primary-foreground p-1.5 rounded-lg text-2xl shadow-lg">LA</span> 
            <span className="drop-shadow-lg">LocalAtlas</span>
          </Link>
          <h2 className="text-5xl font-extrabold mb-6 leading-tight drop-shadow-xl">{title}</h2>
          <p className="text-xl text-zinc-200 font-medium drop-shadow-md">{description}</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 xl:px-32 relative">
        <div className="absolute top-8 left-8 lg:hidden">
          <Link href="/" className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span className="bg-primary text-primary-foreground p-1.5 rounded-md">LA</span> LocalAtlas
          </Link>
        </div>
        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
