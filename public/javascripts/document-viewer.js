document.addEventListener("DOMContentLoaded", async () => {
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
