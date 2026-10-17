export const metadata = {
  title: "Autentikasi | CHORAL.ID",
  description: "Portal autentikasi sistem inventaris CHORAL.ID",
};

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-surface-canvas flex flex-col justify-center items-center">
      {children}
    </div>
  );
}
