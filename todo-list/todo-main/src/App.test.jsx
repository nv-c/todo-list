import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";

describe("Planner app", () => {
  it("adds a task and filters tasks with search", async () => {
    render(<App />);

    expect(await screen.findByText(/Product launch prep/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Team sync" },
    });
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: "2026-10-15" },
    });
    fireEvent.change(screen.getByLabelText(/time/i), {
      target: { value: "14:30" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Finalize launch checklist and owners." },
    });

    fireEvent.click(screen.getByRole("button", { name: /save task/i }));

    expect(await screen.findByText(/Team sync/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/search tasks/i), {
      target: { value: "design" },
    });

    await waitFor(() => {
      expect(screen.getByText(/Design sprint review/i)).toBeInTheDocument();
      expect(screen.queryByText(/Product launch prep/i)).not.toBeInTheDocument();
    });
  });

  it("edits and deletes a task", async () => {
    render(<App />);

    expect(await screen.findByText(/Product launch prep/i)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Product launch prep updated" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText(/Product launch prep updated/i)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);

    await waitFor(() => {
      expect(screen.queryByText(/Product launch prep updated/i)).not.toBeInTheDocument();
    });
  });
});