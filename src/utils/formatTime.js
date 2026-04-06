/**
 * Milisaniyeyi "3:45" formatına çevirir
 * @param {number} ms - Milisaniye
 * @returns {string}
 */
export function formatTime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * "3:45" formatını saniyeye çevirir
 * @param {string} time - "3:45" veya "1:03:45" formatı
 * @returns {number} saniye
 */
export function parseTime(time) {
  const parts = time.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return parts[0] * 60 + parts[1];
}
