const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_NAME = 80;
const MAX_EMAIL = 254; // RFC 5321
const MIN_PW = 8;
const MAX_PW = 128;

export default defineEventHandler(async (event) => {
  // 10 registrations per hour per IP
  enforceRateLimit(`register:${getClientIp(event)}`, 10, 60 * 60_000);

  const body = await readBody<{ name?: string; email?: string; password?: string }>(event);

  const name     = body.name?.trim().slice(0, MAX_NAME);
  const email    = body.email?.trim().toLowerCase().slice(0, MAX_EMAIL);
  const password = body.password ?? "";

  if (!name || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: "همه فیلدها الزامی هستند." });
  }
  if (!EMAIL_RE.test(email)) {
    throw createError({ statusCode: 400, statusMessage: "فرمت ایمیل نامعتبر است." });
  }
  if (password.length < MIN_PW) {
    throw createError({ statusCode: 400, statusMessage: `رمز عبور باید حداقل ${MIN_PW} کاراکتر باشد.` });
  }
  if (password.length > MAX_PW) {
    throw createError({ statusCode: 400, statusMessage: "رمز عبور بیش از حد طولانی است." });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: "این ایمیل قبلاً ثبت شده است." });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });

  await createSessionCookie(event, {
    sub: user.id, email: user.email, name: user.name, role: user.role,
  });

  return { user: { id: user.id, name: user.name, email: user.email, role: user.role } };
});
