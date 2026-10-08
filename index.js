// unipc-site — Worker entry point.
//
// This project serves static HTML/CSS files from the repo root via Cloudflare's
// static-assets feature. This file adds exactly one thing on top of that: two
// API routes for the website's contact and media-submission forms. Every other
// request (every .html page, the CSS, images, etc.) is untouched — it's handed
// straight to env.ASSETS.fetch(request), same as before this file existed.
//
// Requires one secret, set in the Cloudflare dashboard under this Worker's
// Settings → Variables and Secrets: RESEND_API_KEY (from resend.com).

const ALLOWED_DEPARTMENTS = new Set([
  "eosg@unipc.info",
  "secretariat@unipc.info",
  "jcac@unipc.info",
  "treaties@unipc.info",
  "irp@unipc.info",
  "otc@unipc.info",
  "oac@unipc.info",
  "osc@unipc.info",
  "membership@unipc.info",
  "social@unipc.info",
  "volunteer@unipc.info",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json" },
  });
}

async function sendViaResend(env, payload) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

async function handleContact(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "Invalid submission." }, 400);
  }

  const { department, subject, first_name, family_name, email, phone, indigenous_nation, state, message } = body;

  if (!ALLOWED_DEPARTMENTS.has(department)) return json({ error: "Unknown department." }, 400);
  if (!first_name || !family_name || !email || !message || !subject) return json({ error: "Missing required fields." }, 400);
  if (!EMAIL_RE.test(email)) return json({ error: "Invalid email." }, 400);

  const html = `
    <h2>New contact form submission — UNIPC website</h2>
    <p><b>Routed to:</b> ${escapeHtml(department)}</p>
    <p><b>Subject:</b> ${escapeHtml(subject)}</p>
    <p><b>From:</b> ${escapeHtml(first_name)} ${escapeHtml(family_name)} &lt;${escapeHtml(email)}&gt;</p>
    <p><b>Telephone:</b> ${escapeHtml(phone) || "—"}</p>
    <p><b>Indigenous Nation:</b> ${escapeHtml(indigenous_nation) || "—"}</p>
    <p><b>State:</b> ${escapeHtml(state) || "—"}</p>
    <hr>
    <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
  `;

  const res = await sendViaResend(env, {
    from: "UNIPC Website <forms@unipc.info>",
    to: [department],
    reply_to: email,
    subject: `[Website] ${subject} — ${department.split("@")[0]}`,
    html,
  });

  if (!res.ok) return json({ error: "Send failed", detail: await res.text() }, 502);
  return json({ ok: true });
}

async function handleMediaSubmission(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "Invalid submission." }, 400);
  }

  const { name, email, organization, submission_type, source_link, description, consent } = body;

  if (!name || !email || !submission_type || !source_link || !description) return json({ error: "Missing required fields." }, 400);
  if (!EMAIL_RE.test(email)) return json({ error: "Invalid email." }, 400);
  if (!consent) return json({ error: "Consent required." }, 400);

  const typeLabel = { news: "News item", media: "Media — photo or video", other: "Other" }[submission_type] || submission_type;

  const html = `
    <h2>New news/media submission — UNIPC website</h2>
    <p><b>From:</b> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
    <p><b>Organization:</b> ${escapeHtml(organization) || "—"}</p>
    <p><b>Type:</b> ${escapeHtml(typeLabel)}</p>
    <p><b>Source / media link:</b> <a href="${escapeHtml(source_link)}">${escapeHtml(source_link)}</a></p>
    <p><b>Consent to verifiable-source / usage terms:</b> Yes</p>
    <hr>
    <p style="white-space:pre-wrap">${escapeHtml(description)}</p>
  `;

  const res = await sendViaResend(env, {
    from: "UNIPC Website <forms@unipc.info>",
    to: ["social@unipc.info"],
    reply_to: email,
    subject: `[Website] New ${typeLabel.toLowerCase()} submission`,
    html,
  });

  if (!res.ok) return json({ error: "Send failed", detail: await res.text() }, 502);
  return json({ ok: true });
}

async function handleFeedback(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "Invalid submission." }, 400);
  }

  const { name, email, category, feedback } = body;

  if (!category || !feedback) return json({ error: "Missing required fields." }, 400);
  if (email && !EMAIL_RE.test(email)) return json({ error: "Invalid email." }, 400);

  const html = `
    <h2>New feedback submission — UNIPC website</h2>
    <p><b>From:</b> ${escapeHtml(name) || "Not provided"} ${email ? `&lt;${escapeHtml(email)}&gt;` : "(no email provided)"}</p>
    <p><b>Category:</b> ${escapeHtml(category)}</p>
    <hr>
    <p style="white-space:pre-wrap">${escapeHtml(feedback)}</p>
  `;

  const res = await sendViaResend(env, {
    from: "UNIPC Website <forms@unipc.info>",
    to: ["secretariat@unipc.info"],
    reply_to: email || undefined,
    subject: `[Website] New feedback — ${category}`,
    html,
  });

  if (!res.ok) return json({ error: "Send failed", detail: await res.text() }, 502);
  return json({ ok: true });
}

async function handleSubscribe(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "Invalid submission." }, 400);
  }

  const { email } = body;
  if (!email || !EMAIL_RE.test(email)) return json({ error: "Invalid email." }, 400);

  const res = await fetch("https://api.resend.com/contacts", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, unsubscribed: false }),
  });

  // Resend returns an error if the contact already exists — treat that as success,
  // not a failure, since the visitor's intent (being subscribed) is already satisfied.
  if (!res.ok) {
    const detail = await res.text();
    if (!detail.includes("already exists") && !detail.includes("duplicate")) {
      return json({ error: "Subscribe failed", detail }, 502);
    }
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/contact") {
      return handleContact(request, env);
    }
    if (request.method === "POST" && url.pathname === "/api/media-submission") {
      return handleMediaSubmission(request, env);
    }
    if (request.method === "POST" && url.pathname === "/api/feedback") {
      return handleFeedback(request, env);
    }
    if (request.method === "POST" && url.pathname === "/api/subscribe") {
      return handleSubscribe(request, env);
    }

    // Everything else — every .html page, CSS, images, sitemap, robots.txt —
    // is untouched, exactly as it worked before this file existed.
    return env.ASSETS.fetch(request);
  },
};
