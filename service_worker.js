/* eslint-disable */
// ServiceWorker処理：https://developers.google.com/web/fundamentals/primers/service-workers/?hl=ja

// キャッシュ名とキャッシュファイルの指定
const CACHE_NAME = 'pwa-sample-caches';
const urlsToCache = [
    '/dcskimura.github.io/'
];

// インストールイベント
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(function (cache) {
                console.log('cache');
                return cache.addAll(urlsToCache);
            })
    );
    console.log('Service Worker is Installed');
});

// アクティブイベント
self.addEventListener('activate', (e) => {
    console.log('Service Worker is Activater ');
    e.waitUntil(caches.keys().then(CACHE_NAME => Promise.all(CACHE_NAME.map((cache) => {
        if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
        }
    }))));
});

// Fetchイベント(横取り)
self.addEventListener('fetch', (e) => {
    console.log('Service Worker is Fetching ');
    e.respondWith(fetch(e.request)
        .then((res) => {
            // リクエストのコピーをする
            const resClone = res.clone();
            // キャッシュを開く
            caches
                .open(CACHE_NAME)
                .then((cache) => {
                    cache.put(e.request, resClone);
                });
            return res;
        }).catch(err => caches.match(e.requset).then(res => res)));
});

// push通知
self.addEventListener('push', (event) => {
    event.waitUntil(self.registration.pushManager.getSubscription()
        .then((subscription) => {
            if (subscription) {
                return subscription.endpoint;
            }
            throw new Error('User not subscribed');
        })
        .then((res) => {
            return fetch('/notifications.json')
        })
        .then((res) => {
            if (res.status === 200) {
                return res.json();
            }
            throw new Error('notification api response error');
        })
        .then((res) => self.registration.showNotification(res.title, {
            icon: '/icon.png',
            body: res.body
        })));
});
