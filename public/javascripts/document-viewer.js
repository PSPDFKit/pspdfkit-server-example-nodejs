function showViewerError(message) {
  const container = document.querySelector("#doc-viewer");
  if (!container) return;
  container.innerHTML = `<div class="viewer-error">${message}</div>`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const externalUrl = document
    .querySelector('meta[name="pspdfkit-external-url"]')
    ?.getAttribute("content");

  // The SDK is served by Document Engine (through the reverse proxy, see the
  // Caddyfile). If its script did not load, PSPDFKit is undefined and calling
  // PSPDFKit.load() would throw with no visible feedback. Surface it instead of
  // leaving a blank page.
  if (typeof PSPDFKit === "undefined") {
    showViewerError(
      `The Nutrient Web SDK could not be loaded from ${externalUrl || "Document Engine"}. ` +
        "Check that Document Engine is running and reachable, then reload the page."
    );
    return;
  }

  const documentId = document.querySelector('meta[name="document-id"]').getAttribute("content");
  const jwt = document.querySelector('meta[name="jwt"]').getAttribute("content");
  const aiJwt = document.querySelector('meta[name="ai-jwt"]').getAttribute("content");
  const instant = document.querySelector('meta[name="instant"]').getAttribute("content") === "true";
  const layer = document.querySelector('meta[name="layer"]').getAttribute("content");
  const fileHash = document.querySelector('meta[name="file-hash"]').getAttribute("content");
  const aiAssistantEnabled =
    document.querySelector('meta[name="ai-assistant"]').getAttribute("content") === "true";

  // Initialize AI Assistant
  const aiAssistant = new AIAssistant({
    documentId,
    aiJwt,
    layer,
    fileHash,
  });

  aiAssistant.enable();

  let aiConfig = null;
  if (aiAssistantEnabled) {
    aiConfig = await aiAssistant.getConfig();
  }

  const configuration = {
    // The app and Document Engine are served from the same origin via the Caddy
    // reverse proxy (DOCUMENT_ENGINE_EXTERNAL_URL, see docker-compose.yml and
    // Caddyfile). Set serverUrl explicitly rather than relying on the SDK
    // inferring it from the <script> location.
    serverUrl: `${externalUrl}/`,
    authPayload: { jwt },
    container: "#doc-viewer",
    documentId,
    instant,
    toolbarItems: [...PSPDFKit.defaultToolbarItems],
  };

  if (aiConfig) {
    configuration.toolbarItems.push(...aiConfig.toolbarItems);
    configuration.aiAssistant = aiConfig.aiAssistant;
  }

  let instance;
  PSPDFKit.load(configuration)
    .then((loadedInstance) => {
      instance = loadedInstance;
    })
    .catch(function (error) {
      console.log(error);
    });
});
