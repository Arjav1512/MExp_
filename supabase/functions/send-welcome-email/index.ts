import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function sendEmail(
  apiKey: string,
  payload: { from: string; to: string[]; subject: string; html: string },
  retries = 1
): Promise<{ ok: boolean; text: string }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (res.ok) return { ok: true, text };
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }
      return { ok: false, text };
    } catch (err) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  return { ok: false, text: "Max retries exceeded" };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._%+\-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email) || email.length > 320 || email.indexOf('@') > 64) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeEmail = escapeHtml(email);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ownerEmail = "info@makhana-express.com";
    const couponCode = "LAUNCH2026";

    const subscriberHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>Welcome to Makhana Express</title></head>
<body style="margin:0;padding:0;font-family:Helvetica,Arial,sans-serif;background:#f5f0eb;">
  <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;">
    <div style="background:#154212;padding:36px 40px 28px;">
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-0.5px;">Makhana Express</h1>
      <p style="margin:10px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">From Pond To Pack, Done Right.</p>
    </div>
    <div style="padding:36px 40px;">
      <h2 style="margin:0 0 12px;color:#154212;font-size:22px;font-weight:800;">Welcome to the community!</h2>
      <p style="margin:0 0 20px;color:#42493e;font-size:15px;line-height:1.6;">
        Thank you for joining us. As promised, here's your exclusive <strong>20% off</strong> coupon for your first order:
      </p>
      <div style="background:#f8f4de;border:2px dashed #a1d494;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
        <p style="margin:0 0 6px;color:#42493e;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Your Coupon Code</p>
        <p style="margin:0;color:#154212;font-size:30px;font-weight:900;letter-spacing:4px;">${couponCode}</p>
        <p style="margin:8px 0 0;color:#72796e;font-size:12px;">20% off your first order · Valid for new customers only</p>
      </div>
      <p style="margin:0 0 20px;color:#42493e;font-size:14px;line-height:1.6;">
        Our makhana is harvested by hand from Bihar's freshwater lotus ponds — no preservatives, no shortcuts.
        Just pure, clean snacking.
      </p>
      <p style="margin:0;color:#72796e;font-size:13px;">
        Follow us on <a href="https://www.instagram.com/makhanaexpress" style="color:#154212;font-weight:700;">Instagram</a> for updates on new flavours and restocks.
      </p>
    </div>
    <div style="background:#f8f4de;padding:20px 40px;border-top:1px solid #ece9d3;">
      <p style="margin:0;color:#72796e;font-size:12px;">© 2026 Makhana Express. From the heart of Bihar.</p>
    </div>
  </div>
</body>
</html>`;

    const ownerHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>New Subscriber</title></head>
<body style="margin:0;padding:32px;font-family:Helvetica,Arial,sans-serif;background:#f5f0eb;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
    <h2 style="margin:0 0 16px;color:#1a3d0a;">New Newsletter Subscriber</h2>
    <p style="margin:0 0 8px;color:#3d2b0a;font-size:16px;">Someone just subscribed:</p>
    <p style="margin:0;color:#1a3d0a;font-size:20px;font-weight:700;">${safeEmail}</p>
  </div>
</body>
</html>`;

    const [subscriberResult, ownerResult] = await Promise.allSettled([
      sendEmail(RESEND_API_KEY, {
        from: "Makhana Express <onboarding@resend.dev>",
        to: [email],
        subject: "Your 20% off coupon is here — welcome to Makhana Express!",
        html: subscriberHtml,
      }),
      sendEmail(RESEND_API_KEY, {
        from: "Makhana Express <onboarding@resend.dev>",
        to: [ownerEmail],
        subject: `New subscriber: ${safeEmail}`,
        html: ownerHtml,
      }),
    ]);

    if (subscriberResult.status === "rejected") {
      console.error("Failed to send subscriber welcome email after retries:", subscriberResult.reason);
      return new Response(JSON.stringify({ error: "Failed to send welcome email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!subscriberResult.value.ok) {
      console.error("Resend API error (subscriber):", subscriberResult.value.text);
      return new Response(JSON.stringify({ error: "Failed to send welcome email", details: subscriberResult.value.text }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (ownerResult.status === "rejected") {
      console.error("Failed to send owner notification:", ownerResult.reason);
    } else if (!ownerResult.value.ok) {
      console.error("Resend API error (owner):", ownerResult.value.text);
    }

    const data = JSON.parse(subscriberResult.value.text);
    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
