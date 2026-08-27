export const metadata = {
  title: "فروشنده هوشمند",
  description: "چت‌بات هوشمند فروشنده",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
