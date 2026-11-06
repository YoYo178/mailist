import z, { ZodError } from 'zod';

export function getProcessedErrors(err: unknown): Record<string, unknown> {
  const errors = {};

  if (!(err instanceof ZodError)) return errors;

  const zodErrorObj = z.treeifyError(err);

  const flattenedErrors = [
    { general: zodErrorObj?.errors || [] },
    // @ts-ignore
    ...Array.from(Object.entries(zodErrorObj?.properties || {})).flatMap(([k, v]) => ({
      // @ts-ignore
      [k]: v?.errors?.length === 1 ? v?.errors?.[0] : v?.errors,
    })),
  ];

  Object.assign(errors, ...flattenedErrors);

  return errors;
}
