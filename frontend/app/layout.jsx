// Root layout
import "./globals.css";

export const metadata = {
  title: "TechBrain Workspace",
  description: "Secure workspace for project and task management.",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2310b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.1 5.7L20 10.8l-5.9 2.1L12 19l-2.1-6.1L4 10.8l5.9-2.1L12 3z" /></svg>',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
