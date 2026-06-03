import './globals.css';

export const metadata = {
  title: 'Paalan',
  description:
    'Verified bill coordination for families caring for parents back home.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen w-full flex-col">{children}</body>
    </html>
  );
}
