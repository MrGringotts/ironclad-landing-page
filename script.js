const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function clampToastText(text, max = 160) {
  if (!text) return "";
  const t = String(text).trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

function normalizePhone(value) {
  return String(value || "").replace(/[^\d+]/g, "").trim();
}

function validateEmail(value) {
  const v = String(value || "").trim();
  if (!v) return "Please enter your email.";
  // Simple, pragmatic email check for UI validation.
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  return ok ? "" : "Please enter a valid email.";
}

function validateRequired(value, label) {
  const v = String(value || "").trim();
  return v ? "" : `Please enter your ${label}.`;
}

function validateBusinessType(value) {
  const v = String(value || "").trim();
  return v ? "" : "Please select a business type.";
}

function validatePhone(value) {
  const v = String(value || "").trim();
  if (!v) return "Please enter your phone number.";
  const digits = normalizePhone(v).replace(/^\+/, "");
  if (digits.length < 10) return "Please enter a valid phone number.";
  return "";
}

function setFieldError(form, name, message) {
  const el = form.querySelector(`[data-error-for="${CSS.escape(name)}"]`);
  if (el) el.textContent = message || "";
  const input = form.elements?.[name];
  if (input) {
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }
}

function getFormData(form) {
  const fd = new FormData(form);
  return Object.fromEntries(fd.entries());
}

function validateLeadForm(form) {
  const data = getFormData(form);
  const errors = {
    name: validateRequired(data.name, "name"),
    phone: validatePhone(data.phone),
    email: validateEmail(data.email),
    businessType: validateBusinessType(data.businessType),
  };

  Object.entries(errors).forEach(([key, msg]) => setFieldError(form, key, msg));

  const firstErrorKey = Object.keys(errors).find((k) => errors[k]);
  if (firstErrorKey) {
    const el = form.elements?.[firstErrorKey];
    if (el?.focus) el.focus();
    return { ok: false, data };
  }
  return { ok: true, data };
}

function showToast(message, opts = {}) {
  const toast = $("#toast");
  const toastText = $("#toastText");
  const toastBtn = $("#toastBtn");
  if (!toast || !toastText || !toastBtn) return;

  toastText.textContent = clampToastText(message);

  if (opts.copyText) {
    toastBtn.hidden = false;
    toastBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(opts.copyText);
        toastText.textContent = "Copied. Paste it into an email/CRM.";
      } catch {
        toastText.textContent = "Copy failed. Your browser may block clipboard access.";
      }
    };
  } else {
    toastBtn.hidden = true;
    toastBtn.onclick = null;
  }

  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.hidden = true;
  }, 5200);
}

function formatLeadForCopy(lead) {
  const safe = (v) => (v == null ? "" : String(v).trim());
  const lines = [
    "New lead (mockup):",
    `Name: ${safe(lead.name)}`,
    `Business type: ${safe(lead.businessType)}`,
    `Email: ${safe(lead.email)}`,
    `Phone: ${safe(lead.phone)}`,
    lead.goal ? `Goal: ${safe(lead.goal)}` : "",
    `Captured: ${new Date().toISOString()}`,
  ].filter(Boolean);
  return lines.join("\n");
}

function storeLead(lead) {
  const key = "ironcladSites.leads";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  existing.unshift({ ...lead, capturedAt: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(existing.slice(0, 25)));
}

function connectModal() {
  const dlg = $("#leadModal");
  if (!dlg) return;

  const openers = $$("[data-open-lead]");
  const closers = $$("[data-close-lead]");

  const open = () => {
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "true");
  };
  const close = () => {
    if (typeof dlg.close === "function") dlg.close();
    else dlg.removeAttribute("open");
  };

  openers.forEach((btn) => btn.addEventListener("click", open));
  closers.forEach((btn) => btn.addEventListener("click", close));

  dlg.addEventListener("click", (e) => {
    const rect = dlg.getBoundingClientRect();
    const inDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;
    if (!inDialog) close();
  });
}

function connectTabs() {
  const root = document.querySelector("[data-tabs]");
  if (!root) return;

  const tabs = $$("[role='tab']", root);
  const panels = $$("[role='tabpanel']", root);

  function selectTab(next) {
    tabs.forEach((t) => {
      const on = t === next;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => {
      const on = p.getAttribute("aria-labelledby") === next.id;
      if (on) p.removeAttribute("hidden");
      else p.setAttribute("hidden", "");
    });
    next.focus();
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const idx = tabs.indexOf(tab);
      const nextIdx = e.key === "ArrowRight" ? idx + 1 : idx - 1;
      const next = tabs[(nextIdx + tabs.length) % tabs.length];
      selectTab(next);
    });
  });
}

function connectForms() {
  const forms = ["#heroLeadForm", "#leadForm", "#modalLeadForm"]
    .map((id) => $(id))
    .filter(Boolean);

  forms.forEach((form) => {
    // Clear errors on input.
    form.addEventListener("input", (e) => {
      const name = e.target?.name;
      if (!name) return;
      setFieldError(form, name, "");
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const { ok, data } = validateLeadForm(form);
      if (!ok) return;

      storeLead(data);
      form.reset();

      const copyText = formatLeadForCopy(data);
      showToast("Lead captured. Click to copy the details.", { copyText });

      const dlg = $("#leadModal");
      if (dlg?.open) dlg.close();
    });
  });
}

function connectAccordion() {
  const root = document.querySelector("[data-accordion]");
  if (!root) return;
  const items = $$("details", root);
  items.forEach((d) => {
    d.addEventListener("toggle", () => {
      if (!d.open) return;
      items.forEach((other) => {
        if (other !== d) other.open = false;
      });
    });
  });
}

function main() {
  connectModal();
  connectTabs();
  connectForms();
  connectAccordion();
}

document.addEventListener("DOMContentLoaded", main);
