import { render, screen, fireEvent } from "@testing-library/react";
import DataTable from "@/ui/components/ui/DataTable";

describe("DataTable", () => {
  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "age", label: "Age" },
  ];

  const data = [
    { name: "Alice", age: 30 },
    { name: "Bob", age: 25 },
  ];

  it("renders column headers", () => {
    render(<DataTable columns={columns} data={data} keyExtractor={(item: any) => item.name} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
  });

  it("renders data rows", () => {
    render(<DataTable columns={columns} data={data} keyExtractor={(item: any) => item.name} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("renders loading skeleton when isLoading", () => {
    const { container } = render(
      <DataTable columns={columns} data={[]} keyExtractor={(item: any) => item.name} isLoading={true} />,
    );
    expect(container.querySelectorAll(".animate-pulse").length).toBe(5 * columns.length);
  });

  it("returns null when data is empty and not loading", () => {
    const { container } = render(
      <DataTable columns={columns} data={[]} keyExtractor={(item: any) => item.name} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("calls onRowClick when row clicked", () => {
    const onRowClick = vi.fn();
    render(
      <DataTable columns={columns} data={data} keyExtractor={(item: any) => item.name} onRowClick={onRowClick} />,
    );
    fireEvent.click(screen.getByText("Alice"));
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  it("shows sort icon on sortable columns", () => {
    render(<DataTable columns={columns} data={data} keyExtractor={(item: any) => item.name} />);
    const nameHeader = screen.getByText("Name").closest("th");
    expect(nameHeader?.className).toContain("cursor-pointer");
  });
});
