function parseCsvRecords(text) {
  const input = String(text || '').replace(/^\uFEFF/, '');
  const records = [];
  let record = [];
  let field = '';
  let quoted = false;

  function finishField() {
    record.push(field);
    field = '';
  }

  function finishRecord() {
    finishField();
    if (record.some(value => value !== '')) {
      records.push(record);
    }
    record = [];
  }

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (character === '"') {
      if (quoted && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      finishField();
    } else if (character === '\n' && !quoted) {
      finishRecord();
    } else if (character !== '\r' || quoted) {
      field += character;
    }
  }

  if (quoted) {
    throw new Error('CSV contains an unterminated quoted field.');
  }
  if (field || record.length) {
    finishRecord();
  }

  return records;
}

function parseCsvObjects(text) {
  const records = parseCsvRecords(text);
  if (records.length < 2) {
    throw new Error('CSV must contain a header and at least one data row.');
  }

  const headers = records.shift().map(header => header.trim());
  if (
    headers.some(header => !header) ||
    new Set(headers).size !== headers.length
  ) {
    throw new Error('CSV headers must be non-empty and unique.');
  }

  return records.map((values, index) => {
    if (values.length !== headers.length) {
      throw new Error(`CSV row ${index + 2} has an unexpected column count.`);
    }
    return Object.fromEntries(
      headers.map((header, headerIndex) => [header, values[headerIndex].trim()])
    );
  });
}

module.exports = { parseCsvObjects, parseCsvRecords };
