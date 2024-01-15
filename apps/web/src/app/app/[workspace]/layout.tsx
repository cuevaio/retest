import { NavButtons } from "./nav-buttons";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-full w-full">
      <aside className="w-72 p-4 border-r">
        <NavButtons />
      </aside>
      <div className="p-4 grow">{children}</div>
    </div>
  );
};

export default Layout;
