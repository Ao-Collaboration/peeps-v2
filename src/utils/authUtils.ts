export const isAdmin = (email?: string | null): boolean => {
  return email?.endsWith('@aocollab.tech') ?? false
}
