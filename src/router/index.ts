import { createRouter, createWebHashHistory } from 'vue-router'



const routes = [
    { path: '/welcome', component: () => import('../pages/Welcome.vue') },
    { path: '/guide', component: () => import('../pages/createWallet/Guide.vue') },
    { path: '/create', component: () => import('../pages/createWallet/Create.vue') },
    { path: '/import', component: () => import('../pages/createWallet/Import.vue') },
    {
        path: '/',
        component: () => import('../pages/Layout.vue'),
        redirect: '/start',
        children: [
            { path: 'start', component: () => import('../pages/start/index.vue') },
            { path: 'award', component: () => import('../pages/award/index.vue') },
            {
                path: 'me', component: () => import('../pages/me/index.vue'),
                redirect: '/me/wallet',
                children: [
                    { path: 'wallet', component: () => import('../pages/me/WalletList.vue') },
                    { path: 'doc', component: () => import('../pages/me/DocPage.vue') },
                    { path: 'about', component: () => import('../pages/me/About.vue') },
                ]

            },
        ]
    },
]



const router = createRouter({
    history: createWebHashHistory(),
    routes, 
})

export default router