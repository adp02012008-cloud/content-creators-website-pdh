import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'PDH NIJA',
  description: 'Posts, stories, events, reels and short films'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="page-shell">{children}</main>

        <a href="/dashboard" className="floating-link">
          <div className="floating-btn">+</div>
        </a>
      </body>
    </html>
  );
}