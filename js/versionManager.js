let CURRENT_VERSION = null;

export async function initVersion(){
    CURRENT_VERSION = await getAppVersion();
}

// get app version from SERVER
export async function getAppVersion() {
    const res = await fetch("./data/version.json", { cache: "no-store" });
    const data = await res.json();
    return data.version;
}

export function registerServiceWorker() {
    navigator.serviceWorker.register("./service_worker.js")
        .then((registration) => {
            console.log("Service Worker registered");

            // already waiting
            if (registration.waiting) {
                showUpdateToast(registration.waiting);
            }

            // new update found
            registration.addEventListener("updatefound", () => {
                const newWorker = registration.installing;
                newWorker.addEventListener("statechange", () => {
                    if (newWorker.state === "installed" &&
                        navigator.serviceWorker.controller) 
                    {
                        showUpdateToast(newWorker);
                    }
                });
            });
        })
        .catch(err => console.error("SW registration failed:", err));
}

export async function checkForUpdate() {
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) return;

        await registration.update();
    } catch (err) {
        console.warn("Update check failed:", err);
    }
}

async function showUpdateToast(worker) {
    if (document.querySelector(".update-toast")) return;
    const newVersion = await getAppVersion();
    const toast = document.createElement("div");
    toast.className = "update-toast";

    toast.innerHTML = `
        <span>Mise à jour disponible (v${newVersion})</span>
        <div class="toast-actions">
            <button id="refreshApp">Activer</button>
            <button id="dismissUpdate">✕</button>
        </div>
    `;

    document.body.appendChild(toast);

    document.getElementById("refreshApp")
        .addEventListener("click", () => {
            toast.remove();
            worker.postMessage("SKIP_WAITING");
        });

    document.getElementById("dismissUpdate")
        .addEventListener("click", () => {
            toast.remove();
        });
}

export async function setVersionInFooter(){
    if(!CURRENT_VERSION){
        console.warn("could not load CURRENT_VERSION");
        return;
    }
    document.getElementById("appVersion").textContent += `${CURRENT_VERSION}`;
}