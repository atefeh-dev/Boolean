export default defineEventHandler(async (event) => {
  const session = await getSessionUser(event);
  if (!session) {
    return { user: null };
  }

  // Re-check against the DB so a deleted/role-changed user can't ride
  // an old token until it expires.
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { subscriber: true },
  });
  if (!user) {
    clearSessionCookie(event);
    return { user: null };
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscribed: !!user.subscriber,
    },
  };
});
