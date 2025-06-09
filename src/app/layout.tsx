import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Film } from 'lucide-react'; // App icon

export const metadata: Metadata = {
  title: 'AniAffinity',
  description: 'Get AI-powered anime suggestions based on your favorites!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="flex flex-col min-h-screen">
          <header className="py-6 bg-card border-b border-border shadow-sm">
            <div className="container mx-auto flex items-center gap-2">
              <Film className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-headline font-semibold text-primary">AniAffinity</h1>
            </div>
          </header>
          <main className="flex-grow container mx-auto py-8 px-4">
            {children}
          </main>
          <footer className="py-6 text-center text-muted-foreground text-sm border-t border-border">
            <p>&copy; {new Date().getFullYear()} AniAffinity. All rights reserved.</p>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
