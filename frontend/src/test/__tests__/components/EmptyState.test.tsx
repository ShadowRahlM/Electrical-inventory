import { render, screen } from "@testing-library/react";
import EmptyState from "@/ui/components/ui/EmptyState";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="No items" description="No items found" />);
    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  it("renders action", () => {
    render(<EmptyState title="Empty" action={<button>Add Item</button>} />);
    expect(screen.getByText("Add Item")).toBeInTheDocument();
  });
});
