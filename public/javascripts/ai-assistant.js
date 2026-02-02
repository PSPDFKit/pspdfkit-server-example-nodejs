class AIAssistant {
  constructor(config) {
    this.documentId = config.documentId;
    this.layer = config.layer;
    this.button = document.querySelector('a[href*="aiAssistant=true"]');
  }

  async checkHealth() {
    try {
      const response = await fetch("/healthcheck", {
        method: "GET",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("AI Assistant health check failed:", error);
      return false;
    }
  }

  async enable() {
    if (!this.button) return;

    const isHealthy = await this.checkHealth();
    if (!isHealthy) {
      this.updateButtonState("AI Assistant: Not Ready. Check Docker logs", false);
      this.button.style.pointerEvents = "none";
      return;
    }

    this.button.addEventListener("click", async (e) => {
      e.preventDefault();
      await this.startIngestion();
    });
  }

  async startIngestion() {
    this.updateButtonState("Ingesting document...", true);

    try {
      const response = await fetch(
        `/document/${this.documentId}/ingest${this.layer ? `?layer=${this.layer}` : ""}`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        alert(
          "Document ingestion complete! Click the sparkles icon in the toolbar to start chatting with your PDF."
        );
        window.location.href = window.location.pathname + "?aiAssistant=true";
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      alert(
        `${error.message}. Please check the AI Assistant Docker container logs for more information.`
      );
      this.updateButtonState("AI Assistant: OFF", false);
    }
  }

  updateButtonState(text, isIngesting) {
    this.button.textContent = text;
    this.button.classList.remove(isIngesting ? "btn-default" : "btn-info");
    this.button.classList.add(isIngesting ? "btn-info" : "btn-default");
    this.button.style.pointerEvents = isIngesting ? "none" : "auto";
  }

  async getConfig() {
    const response = await fetch(
      `/document/${this.documentId}/ai-assistant-config${this.layer ? `?layer=${this.layer}` : ""}`,
      {
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      }
    );
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data;
  }
}
