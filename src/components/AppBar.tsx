const AppBar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-nav-background border-b border-nav-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-center">
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          AesthetIQ
        </h1>
      </div>
    </header>
  );
};

export default AppBar;
