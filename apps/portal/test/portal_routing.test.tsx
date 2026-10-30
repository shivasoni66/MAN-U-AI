import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";

describe("Root Portal Application", () => {
  it("renders the workspace portal selection screen", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Select Workspace Portal/i)).toBeDefined();
    expect(screen.getByText(/Plant Administration Console/i)).toBeDefined();
    expect(screen.getByText(/Admin Login/i)).toBeDefined();
    expect(screen.getByText(/Manager & Operator/i)).toBeDefined();
  });
});
