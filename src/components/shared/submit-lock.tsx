"use client";

import { useEffect } from "react";

/** Prevents repeated form submits while a server action is in flight. */
export function SubmitLock() {
  useEffect(() => {
    function handleSubmit(event: Event) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (form.dataset.submitting === "true") {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      form.dataset.submitting = "true";
      const buttons = Array.from(form.querySelectorAll<HTMLButtonElement>('button[type="submit"], button:not([type])'));
      // Delay disabling until the browser / React has collected the form values.
      queueMicrotask(() => {
        for (const button of buttons) {
          button.disabled = true;
          button.setAttribute("aria-busy", "true");
          if (!button.dataset.originalText) button.dataset.originalText = button.textContent ?? "";
          button.textContent = "Salvando...";
        }
      });
      // Recovery for validation/server errors that keep the user on the same page.
      const restore = () => {
        form.dataset.submitting = "false";
        buttons.forEach((button) => {
          button.disabled = false;
          button.removeAttribute("aria-busy");
          if (button.dataset.originalText !== undefined) {
            button.textContent = button.dataset.originalText;
            delete button.dataset.originalText;
          }
        });
      };
      window.setTimeout(restore, 20000);
    }
    document.addEventListener("submit", handleSubmit, true);
    return () => document.removeEventListener("submit", handleSubmit, true);
  }, []);
  return null;
}
