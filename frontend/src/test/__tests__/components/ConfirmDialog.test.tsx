import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmDialog from "@/ui/components/ui/ConfirmDialog";

describe("ConfirmDialog", () => {
  it("renders nothing when closed", () => {
    render(<ConfirmDialog open={false} title="Test" message="Message" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.queryByText("Test")).not.toBeInTheDocument();
  });

  it("renders when open", () => {
    render(<ConfirmDialog open={true} title="Delete?" message="Are you sure?" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByText("Delete?")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm clicked", () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog open={true} title="Test" message="Msg" onConfirm={onConfirm} onCancel={() => {}} />);
    fireEvent.click(screen.getByText("Confirm"));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when cancel clicked", () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog open={true} title="Test" message="Msg" onConfirm={() => {}} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("shows danger variant styling", () => {
    render(<ConfirmDialog open={true} title="Delete?" message="Sure?" variant="danger" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByText("Delete?")).toBeInTheDocument();
  });

  it("disables buttons when loading", () => {
    render(<ConfirmDialog open={true} title="Test" message="Msg" onConfirm={() => {}} onCancel={() => {}} isLoading={true} />);
    expect(screen.getByText("Processing...")).toBeDisabled();
  });
});
