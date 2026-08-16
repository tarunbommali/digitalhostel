/**
 * Safely escapes special regular expression characters from user input strings
 * Prevents regex injection in MongoDB $regex queries.
 */
const escapeRegex = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim();
};

module.exports = {
  escapeRegex,
};
