import './globals.css';

export const metadata = {
  title: 'Paalan — peace of mind about your parents',
  description:
    "Paalan helps NRIs stop guessing whether their aging parent's bills are handled. Proof-backed, second-party-confirmed care records."
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0e7a5f'
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
