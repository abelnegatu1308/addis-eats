export function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function rowsToCsv(rows, headers) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "";
  }

  const columns = Array.isArray(headers) && headers.length > 0
    ? headers
    : Object.keys(rows[0] ?? {});

  const csvRows = [columns.map((column) => escapeCsvValue(column)).join(",")];

  for (const row of rows) {
    const values = columns.map((column) => escapeCsvValue(row?.[column] ?? ""));
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

export function downloadCsv(filename, rows, headers) {
  if (typeof window === "undefined") {
    return false;
  }

  const csv = rowsToCsv(rows, headers);
  if (!csv) {
    return false;
  }

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  return true;
}
