const mockUser = {
  id: 1,
  name: 'Demo User',
  email: 'demo@kopeika.local',
  email_verified_at: null
}

function delay (ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchCurrentUser () {
  return mockUser
}

export async function login () {
  await delay()
  return mockUser
}

export async function register (payload) {
  await delay()
  return {
    ...mockUser,
    name: payload.name,
    email: payload.email
  }
}

export async function logout () {
  void 0
}

export async function forgotPassword () {
  await delay()
  return { message: 'Если email зарегистрирован, мы отправили ссылку для сброса пароля.' }
}

export async function resetPassword () {
  await delay()
  return { message: 'Пароль обновлён. Можно войти с новым паролем.' }
}
