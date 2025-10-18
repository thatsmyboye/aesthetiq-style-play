import { ReactNode } from 'react';
import AppBar from './AppBar';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen w-full bg-background">
      <AppBar />
      <main className="pt-16 pb-22 min-h-screen">{children}</main>
      <BottomNav />
    </div>
  );
};

export default Layout;
