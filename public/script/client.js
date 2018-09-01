if ("serviceWorker" in navigator) {
  send().catch(err => console.error(err));
}
async function send() {
  const register = await navigator.serviceWorker.register("/script/worker.js", {
    scope: "/script/"
  });
  const subscription = await register.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey) //publicKey is loaded att start of index.html
  });
  var tosend = {"subscription": subscription};
  await fetch("/subscribe", {
    method: "POST",
    body: JSON.stringify(tosend),
    headers: {
      "content-type": "application/json"
    }
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}