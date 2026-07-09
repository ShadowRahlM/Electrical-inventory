import { render, screen } from "@testing-library/react";
import PageHeader from "@/ui/components/ui/PageHeader";

describe("PageHeader", () => {
  it("renders title", () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<PageHeader title="Title" description="Description text" />);
    expect(screen.getByText("Description text")).toBeInTheDocument();
  });

  it("renders actions when provided", () => {
    render(<PageHeader title="Title" actions={<button>Action</button>} />);
    expect(screen.getByText("Action")).toBeInTheDocument();
  });
});
