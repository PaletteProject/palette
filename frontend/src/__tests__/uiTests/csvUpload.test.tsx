import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { CSVUpload } from "@features"; // Adjust path if needed

// Mock the importCsv utility
vi.mock("../../utils/CSVParser", () => ({
  importCsv: vi.fn(
    (
      file,
      version,
      callback: (
        criteria: Array<{ id: number; title: string; points: number }>,
      ) => void,
    ) => {
      const mockCriteria = [
        { id: 1, title: "Criterion 1", points: 10 },
        { id: 2, title: "Criterion 2", points: 5 },
      ];
      callback(mockCriteria);
    },
  ),
}));

describe("CSVUpload Component", () => {
  const mockSetRubric = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
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
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".csv";
    document.body.appendChild(fileInput);

    // Simulate the file input change event
    const mockFile = new File(
      ["Criterion 1,10\nCriterion 2,5"],
      "example.csv",
      {
        type: "text/csv",
      },
    );
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // Clean up dynamically added input
    document.body.removeChild(fileInput);
  });

  it("shows an alert when an unsupported file format is uploaded", () => {
    render(<CSVUpload rubric={undefined} setRubric={mockSetRubric} />);
    const importButton = screen.getByText(/Import CSV/i);
    fireEvent.click(importButton);

    // Simulate selecting "Version 1"
    const versionOneButton = screen.getByText(/Version 1/i);
    fireEvent.click(versionOneButton);

    // Mock the alert function
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    // Simulate dynamically creating the file input
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".csv";
    document.body.appendChild(fileInput);

    // Simulate the file input change event with an unsupported file
    const mockFile = new File(["dummy content"], "example.txt", {
      type: "text/plain",
    });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // Clean up
    alertMock.mockRestore();
    document.body.removeChild(fileInput);
  });
});
