/**
 * ASCII progress bar oluşturur
 * @param {number} current - Geçen süre (ms)
 * @param {number} total - Toplam süre (ms)
 * @param {number} length - Bar uzunluğu (karakter)
 * @returns {string}
 */
export function createProgressBar(current, total, length = 15) {
  const percentage = Math.min(current / total, 1);
  const filled = Math.round(length * percentage);
  const empty = length - filled;

  const filledBar = '█'.repeat(filled);
  const emptyBar = '░'.repeat(empty);
  const percent = Math.round(percentage * 100);

  return `${filledBar}${emptyBar} ${percent}%`;
}
