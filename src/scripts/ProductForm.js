import { formatPrice } from "./utils";

class ProductForm extends HTMLElement {
  constructor() {
    super();
    this.CONFIG = {
      domain: "0v8paw-jk.myshopify.com",
      token: "e76b0b1745c7f891fc4cf5fd5a412be1",
      handle: "vilo-smart-ring",
      utmSource: "vilo-site",
      utmMedium: "preorder-button",
      utmCampaign: "vilo-launch-2026",
    };
    this.abortController = null;
    this.currentVariantId = null;
    this.updateVariant = this.updateVariant.bind(this);
    this.handleCheckout = this.handleCheckout.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
    this.handlePaymentPlanChange = this.handlePaymentPlanChange.bind(this);
    this.updatePrice = this.updatePrice.bind(this);
  }

  connectedCallback() {
    const handle = this.dataset.productHandle;
    if (handle) this.CONFIG.handle = handle;

    this.originalPriceElArray = Array.from(
      document.querySelectorAll("[data-original-price]"),
    );
    this.comparePriceElArray = Array.from(
      document.querySelectorAll("[data-compare-price]"),
    );
    this.installmentPriceElArray = Array.from(
      document.querySelectorAll(".js-product-installment-price"),
    );
    this.installmentLeadEl = document.querySelector(".bnpl-installments__lead");
    this.installmentContainerEl = document.querySelector(".bnpl-installments");
    this.depositLabelEl = document.querySelector("[data-deposit-label]");
    this.customBuyBtn = this.querySelector(".js-preorder-button");
    this.toggleUIState(false);
    this.addUiEventListeners();
    if (globalThis.ShopifyBuy?.UI) {
      this.initShopify();
    } else {
      globalThis.addEventListener(
        "shopify-sdk-loaded",
        () => this.initShopify(),
        { once: true },
      );
    }
  }

  disconnectedCallback() {
    this.abortController?.abort();
  }

  addUiEventListeners() {
    this.abortController?.abort();
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    this.customBuyBtn?.addEventListener("click", this.handleCheckout, {
      signal,
    });

    this.querySelectorAll("fieldset").forEach((fs) => {
      fs.addEventListener("change", this.updateVariant, { signal });
      if (fs.dataset.optionName === "color") {
        fs.addEventListener("change", this.handleColorChange, { signal });
      }
      if (fs.dataset.optionName === "payment-plan") {
        fs.addEventListener("change", this.handlePaymentPlanChange, {
          signal,
        });
      }
    });
  }

  async initShopify() {
    try {
      const shopifyClient = ShopifyBuy.buildClient({
        domain: this.CONFIG.domain,
        storefrontAccessToken: this.CONFIG.token,
      });

      this.productData = await shopifyClient.product.fetchByHandle(
        this.CONFIG.handle,
      );
      this.updateVariant();
    } catch (error) {
      console.error("Shopify Initialization Failed:", error);
    }
  }

  handleColorChange(e) {
    const selectedColor = e.target.value;
    if (selectedColor) {
      globalThis.dispatchEvent(
        new CustomEvent("variant:changed", {
          detail: { variant: selectedColor },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  handlePaymentPlanChange(e) {
    const selectedPlan = e.target.value;
    if (selectedPlan) {
      globalThis.dispatchEvent(
        new CustomEvent("payment-plan:changed", {
          detail: { plan: selectedPlan },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  updateVariant() {
    if (!this.productData) return;

    const fieldsets = this.querySelectorAll("fieldset");
    const selectedOptions = Array.from(fieldsets).map(
      (fs) => fs.querySelector("input:checked")?.value,
    );

    const matchedVariant = this.productData.variants.find((variant) =>
      selectedOptions.every((val) =>
        variant.selectedOptions.some((opt) => opt.value === val),
      ),
    );

    if (matchedVariant) {
      this.updatePrice(matchedVariant);
      this.updateDepositLabel(selectedOptions);
      this.currentVariantId = matchedVariant.id.split("/").pop();
      this.toggleUIState(matchedVariant.available);
    }
  }

  updateDepositLabel(selectedOptions) {
    if (!this.depositLabelEl) return;
    this.depositLabelEl.style.display = selectedOptions.includes("Deposit")
      ? "inline"
      : "none";
  }

  updatePrice(variant) {
    const { priceV2, compareAtPriceV2 } = variant;
    this.originalPriceElArray.forEach((el) => {
      el.textContent = formatPrice(priceV2.amount, priceV2.currencyCode);
    });
    this.comparePriceElArray.forEach((el) => {
      el.textContent = compareAtPriceV2
        ? formatPrice(compareAtPriceV2.amount, compareAtPriceV2.currencyCode)
        : "";
      el.style.display = compareAtPriceV2 ? "inline" : "none";
    });
    this.installmentPriceElArray.forEach((el) => {
      el.textContent = formatPrice(
        Number(priceV2.amount) / 4,
        priceV2.currencyCode,
      );
    });
    if (this.installmentLeadEl) {
      this.installmentLeadEl.textContent = "4 payments of";
    }
    this.installmentContainerEl?.classList.add("is-ready");
  }

  toggleUIState(isActive) {
    if (!this.customBuyBtn) return;
    this.customBuyBtn.disabled = !isActive;
    this.customBuyBtn.style.opacity = isActive ? "1" : "0.5";
    this.customBuyBtn.style.pointerEvents = isActive ? "auto" : "none";
  }

  handleCheckout(e) {
    e.preventDefault();
    if (this.currentVariantId) {
      this.customBuyBtn.disabled = true;
      const utms = `?utm_source=${this.CONFIG.utmSource}&utm_medium=${this.CONFIG.utmMedium}&utm_campaign=${this.CONFIG.utmCampaign}`;
      globalThis.location.href = `https://${this.CONFIG.domain}/cart/${this.currentVariantId}:1${utms}`;
    }
  }
}

customElements.define("product-form", ProductForm);
