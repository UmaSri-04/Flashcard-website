import { render, screen } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: 1,
            question: "What is Full Stack Development?",
            answer: "Frontend and backend of a web application.",
          },
        ]),
    })
  );
});

test("renders study deck heading and first question", async () => {
  render(<App />);
  expect(await screen.findByText(/Lumina Cards/i)).toBeInTheDocument();
  expect(
    screen.getByText(/What is Full Stack Development\?/i)
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Manage" })).toBeInTheDocument();
});
