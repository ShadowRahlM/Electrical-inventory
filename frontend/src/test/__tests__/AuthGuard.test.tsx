import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/domain/hooks/use-auth";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("AuthGuard", () => {
  it("renders children when wrapped in provider", () => {
    render(
      <Wrapper>
        <div>Protected Content</div>
      </Wrapper>,
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
