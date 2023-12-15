interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex">
      <aside className="flex-0 w-64 px-6 z-10 hidden md:block">options</aside>
      <div className="p-4 border-l bg-background border-border grow min-h-[160vh]">
        {children}
      </div>
    </div>
  );
};

export default Layout;
