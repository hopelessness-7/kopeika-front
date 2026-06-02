const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'obligations', component: () => import('pages/ObligationsPage.vue') },
      { path: 'obligations/new', component: () => import('pages/ObligationFormPage.vue') },
      {
        path: 'obligations/:id/edit',
        component: () => import('pages/ObligationFormPage.vue')
      },
      { path: 'calendar', component: () => import('pages/CalendarPage.vue') },
      { path: 'import', component: () => import('pages/ImportPage.vue') },
      {
        path: 'import/:id/summary',
        component: () => import('pages/ImportSummaryPage.vue')
      },
      { path: 'check-in', component: () => import('pages/CheckInPage.vue') },
      { path: 'settings', component: () => import('pages/SettingsPage.vue') }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
