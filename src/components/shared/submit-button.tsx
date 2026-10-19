"use client";

import {useFormStatus} from "react-dom";
import type {ButtonHTMLAttributes, ReactNode} from "react";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  children: ReactNode;
  pendingLabel?: string;
};

/** State comes from React/Next form submission, never from a document-wide listener. */
export function SubmitButton({children,pendingLabel="Aguardando...",disabled,...props}:Props) {
  const {pending} = useFormStatus();
  return <button {...props} type="submit" disabled={disabled||pending} aria-busy={pending}>
    {pending ? pendingLabel : children}
  </button>;
}
