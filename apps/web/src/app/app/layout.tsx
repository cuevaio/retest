import { auth } from "@/auth";
import { Header } from "@/components/header";
import { SignIn } from "@/components/auth-buttons";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = async ({ children }: LayoutProps) => {
  let session = await auth();
  if (!session?.user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center">
        <p className="mb-6 text-lg">Sign in to continue</p>
        <SignIn />
      </div>
    );
  }
  return (
    <div className="h-screen w-screen flex flex-col">
      <Header />
      <div className="grow container">{children}</div>
    </div>
  );
};

export default Layout;
