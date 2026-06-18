export function parseFilterParam(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Comma-separated values for URL persistence only (not API). */
export function serializeFilterParam(value) {
  if (!value) return '';
  if (Array.isArray(value)) return value.filter(Boolean).join(',');
  return String(value);
}

export function hasFilterValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
}

export function hasMultipleFilterValues(...values) {
  return values.some((value) => parseFilterParam(value).length > 1);
}

export function scalarFilterValue(value) {
  return parseFilterParam(value)[0] || '';
}

/**
 * Cartesian product of single-value filter combos (OR within a field, AND across fields).
 * Undefined means "no filter" for that field.
 */
export function buildSingleFilterCombos({ department, designation, location } = {}) {
  const deptOpts = parseFilterParam(department);
  const desigOpts = parseFilterParam(designation);
  const locOpts = parseFilterParam(location);

  const fields = [
    ['department', deptOpts.length ? deptOpts : [undefined]],
    ['designation', desigOpts.length ? desigOpts : [undefined]],
    ['location', locOpts.length ? locOpts : [undefined]],
  ];

  let combos = [{}];
  for (const [key, options] of fields) {
    combos = combos.flatMap((combo) =>
      options.map((option) => {
        if (option === undefined) return combo;
        return { ...combo, [key]: option };
      })
    );
  }
  return combos;
}

/** Axios serializer: department=A&department=B */
export const REPEAT_ARRAY_PARAMS_SERIALIZER = { indexes: null };

export function applyFilterToParams(params, key, value) {
  const scalar = scalarFilterValue(value);
  if (scalar) params[key] = scalar;
}

export function appendFilterToSearchParams(searchParams, key, value) {
  const values = parseFilterParam(value);
  values.forEach((entry) => searchParams.append(key, entry));
}
