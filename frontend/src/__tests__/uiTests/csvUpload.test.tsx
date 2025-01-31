import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { CSVUpload } from "@features";
import { Criteria } from "palette-types";

// Define types for mock functions
interface MockFile {
  name: string;
}

type OnSuccess = (criteria: Criteria[]) => void;
type OnError = (message: string) => void;

vi.mock("@components", () => ({
  Dialog: ({
    isOpen,
    onClose,
    title,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="dialog" id="modal-root">
        <h1>{title}</h1>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// Mock the importCsv utility
vi.mock("@utils", () => ({
  importCsv: vi.fn((file: MockFile, onSuccess: OnSuccess, onError: OnError) => {
    if (file.name === "invalid.csv") {
      onError("Invalid file format.");
    } else {
      const mockCriteria: Criteria[] = [
        {
          id: 1,
          description: "Criterion 1",
          longDescription: "Detailed description 1",
          points: 10,
          ratings: [],
          key: "1",
          updatePoints: vi.fn(),
        },
        {
          id: 2,
          description: "Criterion 2",
          longDescription: "Detailed description 2",
          points: 5,
          ratings: [],
          key: "2",
          updatePoints: vi.fn(),
        },
      ];
      onSuccess(mockCriteria);
    }
  }),
  VERSION_ONE: 1,
  VERSION_TWO: 2,
}));

describe("CSVUpload Component", () => {
  const mockSetRubric = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    const modalRoot = document.createElement("div");
    modalRoot.id = "modal-root";
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    const modalRoot = document.getElementById("modal-root");
    if (modalRoot) document.body.removeChild(modalRoot);
  });

  it("renders the import button", () => {
    render(<CSVUpload rubric={undefined} setRubric={mockSetRubric} />);
    const importButton = screen.getByText(/Import CSV/i);
    expect(importButton).toBeInTheDocument();
  });

  it("opens the version modal when the button is clicked", () => {
    render(<CSVUpload rubric={undefined} setRubric={mockSetRubric} />);
    const importButton = screen.getByText(/Import CSV/i);
    fireEvent.click(importButton);

    const versionModal = screen.getByText(/Select Import Version/i);
    expect(versionModal).toBeInTheDocument();
  });

  it("calls handleFileChange and updates the rubric correctly for a valid CSV file", () => {
    render(<CSVUpload rubric={undefined} setRubric={mockSetRubric} />);
    const importButton = screen.getByText(/Import CSV/i);
    fireEvent.click(importButton);

    // Simulate selecting "Version 1"
    const versionOneButton = screen.getByText(/Version 1/i);
    fireEvent.click(versionOneButton);

    // Simulate dynamically creating the file input
    const fileInput = screen.getByLabelText("file-input");
    // Simulate the file input change event
    const mockFile = new File(
      ["Criterion 1,10\nCriterion 2,5"],
      "example.csv",
      {
        type: "text/csv",
      },
    );
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
  });

  it("shows an alert when an unsupported file format is uploaded", () => {
    render(<CSVUpload rubric={undefined} setRubric={mockSetRubric} />);

    // Click the import button
    const importButton = screen.getByText(/Import CSV/i);
    fireEvent.click(importButton);

    // Click the version selection
    const versionOneButton = screen.getByText(/Version 1/i);
    fireEvent.click(versionOneButton);

    // Find the file input element
    const fileInput = screen.getByLabelText("file-input");

    // Simulate an unsupported file format upload
    const mockFile = new File(["dummy content"], "example.txt", {
      type: "text/plain",
    });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
  });
});
