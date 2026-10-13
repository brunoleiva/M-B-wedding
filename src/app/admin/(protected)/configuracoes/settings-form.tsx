"use client";

import { useState, type FormEvent } from "react";
import { saveWeddingSettings } from "./actions";
import { weddingSettingsKeys, weddingSettingsLabels, weddingSettingsSchema, type WeddingSettingsValues } from "@/validation/wedding-settings";

type FieldKey = (typeof weddingSettingsKeys)[number];
type Props = { initial: WeddingSettingsValues; imagePath: string | null };
type Errors = Partial<Record<FieldKey, string>>;

function validate(form: HTMLFormElement): Errors {
  const data = new FormData(form);
  const values = Object.fromEntries(weddingSettingsKeys.map(key => [key, data.get(key) ?? ""]));
  const result = weddingSettingsSchema.safeParse(values);
  if (result.success) return {};
  const errors: Errors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0]) as FieldKey;
    if (weddingSettingsKeys.includes(key) && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export function SettingsForm({ initial, imagePath }: Props) {
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<FieldKey[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const updateErrors = (form: HTMLFormElement, nextTouched = touched, isSubmitted = submitted) => {
    const next = validate(form);
    setErrors(Object.fromEntries(Object.entries(next).filter(([key]) => isSubmitted || nextTouched.includes(key as FieldKey))) as Errors);
    return next;
  };
  const field = (name: FieldKey, type = "text", multiline = false) => {
    const required = ["firstName", "secondName", "city", "date", "time", "timezone"].includes(name);
    const maxLength: Partial<Record<FieldKey, number>> = { firstName:80, secondName:80, city:120, timezone:80, heroMessage:400, venueName:160, venueAddress:400, venueDescription:1000 };
    const className = `w-full min-h-12 rounded-xl border bg-white px-4 py-3 text-foreground ${errors[name] ? "border-red-600" : "border-line"}`;
    const common = { name, id:name, defaultValue:initial[name], required, "aria-invalid":Boolean(errors[name]), "aria-describedby":errors[name] ? `${name}-error` : undefined, maxLength:maxLength[name] };
    return <label key={name} className="grid gap-2 text-sm font-semibold" htmlFor={name}>
      {weddingSettingsLabels[name]}{required ? " *" : " (opcional)"}
      {multiline ? <textarea {...common} className={`${className} min-h-28`}/> : <input {...common} type={type} className={className}/>}
      {errors[name] && <span id={`${name}-error`} role="alert" className="text-sm font-normal text-red-700">{errors[name]}</span>}
    </label>;
  };
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    setSubmitted(true);
    const next = updateErrors(event.currentTarget, touched, true);
    if (Object.keys(next).length) {
      event.preventDefault();
      const first = Object.keys(next)[0];
      event.currentTarget.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${first}"]`)?.focus();
    }
  };
  return <form action={saveWeddingSettings} encType="multipart/form-data" noValidate onSubmit={onSubmit}
    onBlur={event => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
      const name = target.name as FieldKey;
      if (!weddingSettingsKeys.includes(name)) return;
      const nextTouched = [...new Set([...touched, name])];
      setTouched(nextTouched);
      updateErrors(event.currentTarget, nextTouched);
    }}
    onChange={event => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
      if (weddingSettingsKeys.includes(target.name as FieldKey)) updateErrors(event.currentTarget);
    }}
    className="card-soft space-y-8 p-6 sm:p-9">
    <p className="text-sm text-muted">Campos com * são obrigatórios. Os outros podem ficar vazios e não impedem o salvamento.</p>
    <fieldset className="grid gap-5 md:grid-cols-2"><legend className="mb-5 font-editorial text-3xl">O casal</legend>
      {field("firstName")}{field("secondName")}
    </fieldset>
    <fieldset className="grid gap-5 md:grid-cols-2"><legend className="mb-5 font-editorial text-3xl">O grande dia</legend>
      {field("date", "date")}{field("time", "time")}{field("city")}{field("timezone")}
    </fieldset>
    <fieldset className="grid gap-5"><legend className="mb-5 font-editorial text-3xl">Capa</legend>
      {field("heroMessage", "text", true)}
      <label className="grid gap-2 text-sm font-semibold">Nova foto de capa (opcional — JPG, PNG ou WEBP, até 5 MB)
        <input type="file" name="heroImage" accept="image/jpeg,image/png,image/webp" className="rounded-xl border border-line bg-white p-3 text-foreground" />
      </label>
      <p className="text-sm text-muted">Imagem atual: {imagePath || "não definida"}. Deixe vazio para manter.</p>
    </fieldset>
    <fieldset className="grid gap-5"><legend className="mb-5 font-editorial text-3xl">Cerimônia e recepção</legend>
      <p className="text-sm text-muted">Pode deixar tudo vazio. O local só é publicado quando houver nome e endereço; informações parciais não bloqueiam outras alterações.</p>
      {field("venueName")}{field("venueAddress")}{field("venueDescription", "text", true)}
    </fieldset>
    <button type="submit" className="focus-ring min-h-12 rounded-full bg-foreground px-7 font-semibold text-white hover:opacity-85">Salvar informações</button>
  </form>;
}
