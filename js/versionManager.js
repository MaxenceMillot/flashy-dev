let CURRENT_VERSION = null;

export async function initVersion(){
    CURRENT_VERSION = await getAppVersion();
}

export function getCurrentVersion(){
    return CURRENT_VERSION;
}

// get app version from SERVER
export async function getAppVersion() {
    const res = await fetch("./data/version.json", { cache: "no-store" });
    const data = await res.json();
    return data.version;
}

export async function checkForUpdate() {
    try {
        let newVersion = await getAppVersion();
        let isToastShowed = document.querySelector(".update-toast");

        if (!CURRENT_VERSION) return;

        if (newVersion !== CURRENT_VERSION && !isToastShowed) {
            showUpdateToast(newVersion);
        }

    } catch (err) {
        console.warn("Update check failed: ", err);
    }
}

function showUpdateToast(newVersion) {
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

    document.getElementById("refreshApp").addEventListener("click", async () => {
         if ("serviceWorker" in navigator) {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) await reg.update();
        }

        window.location.reload();
    });

    document.getElementById("dismissUpdate").addEventListener("click", () => {
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