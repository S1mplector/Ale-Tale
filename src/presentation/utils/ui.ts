export function renderStars(rating: number): string {
  const stars: string[] = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push('★');
    else if (rating >= i - 0.5) stars.push('½');
    else stars.push('☆');
  }
  return stars.join('');
}

export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
