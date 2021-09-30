importScripts('./../ngsw-worker.js');
self.addEventListener('notificationclick', (event) => {
    const url = `https://todo-fe-angular.herokuapp.com/dashboard?id=${event.notification.data.id}`;
    event.notification.close();
    var promise = new Promise(function(resolve) {
        setTimeout(resolve, 3000);
    }).then(function() {
        // return the promise returned by openWindow, just in case.
        // Opening any origin only works in Chrome 43+.
        return clients.openWindow(url);
    });

    // Now wait for the promise to keep the permission alive.
    event.waitUntil(promise);
});
