import "./globals.css";

export const metadata = {
  title: "فروشنده هوشمند",
  description: "چت‌بات اختصاصی فروشنده هوشمند",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
