const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'obligations', component: () => import('pages/ObligationsPage.vue') },
      { path: 'obligations/new', component: () => import('pages/ObligationFormPage.vue') },
      {
        path: 'obligations/:id',
        component: () => import('pages/ObligationDetailPage.vue')
      },
      {
        path: 'obligations/:id/edit',
        component: () => import('pages/ObligationFormPage.vue')
      },
      { path: 'incomes', component: () => import('pages/IncomesPage.vue') },
      { path: 'savings', component: () => import('pages/SavingsPage.vue') },
      { path: 'reconciliation', component: () => import('pages/ReconciliationPage.vue') },
      {
        path: 'reconciliation/:id',
        component: () => import('pages/ReconciliationDetailPage.vue')
      },
      { path: 'calendar', component: () => import('pages/CalendarPage.vue') },
      { path: 'check-in', component: () => import('pages/CheckInPage.vue') },
      { path: 'settings', component: () => import('pages/SettingsPage.vue') },
      { path: 'import', redirect: '/reconciliation' },
      { path: 'import/:id/summary', redirect: (to) => `/reconciliation/${to.params.id}` }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { guest: true },
    children: [
      { path: 'login', component: () => import('pages/auth/LoginPage.vue') },
      { path: 'register', component: () => import('pages/auth/RegisterPage.vue') },
      { path: 'forgot-password', component: () => import('pages/auth/ForgotPasswordPage.vue') },
      { path: 'reset-password', component: () => import('pages/auth/ResetPasswordPage.vue') }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
