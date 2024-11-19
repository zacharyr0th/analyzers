export function formatNumber(num: string | number): string {
    const value = typeof num === 'string' ? parseFloat(num) : num;
    return new Intl.NumberFormat('en-US').format(value);
}
