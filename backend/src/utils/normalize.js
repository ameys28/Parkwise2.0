export const normalizePlate = (value) =>
  String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

export const toSafeUser = (user) => ({
  id: user.id,
  username: user.username,
  role: user.role,
  fullName: user.fullName,
  createdAt: user.createdAt,
});