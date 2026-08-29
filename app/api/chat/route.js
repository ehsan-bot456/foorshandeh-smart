import { bots } from "../../../lib/bots";
import { getTenantId, getTenantConfig } from "../../../lib/tenant";

export async function POST(request) {
  try {
    // دریافت پیام‌ها
    const body = await request.json();
    const messages = body?.messages;

    if (!Array.isArray(messages)) {
      return Response.json(
        {
          error: "messages ارسال نشده یا فرمت آن اشتباه است."
        },
        { status: 400 }
      );
    }

    // بررسی کلید OpenRouter
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error("OPENROUTER_API_KEY is missing");

      return Response.json(
        {
          error: "کلید OPENROUTER_API_KEY در Vercel تنظیم نشده است."
        },
        { status: 500 }
      );
    }

    // دریافت Tenant
    const tenantId = getTenantId(request);

    console.log("Tenant ID:", tenantId);

    // دریافت تنظیمات Bot
    const bot = getTenantConfig(tenantId, bots);

    if (!bot) {
      console.error("Bot not found for tenant:", tenantId);

      return Response.json(
        {
          error: `ربات برای tenant "${tenantId}" پیدا نشد.`
        },
        { status: 404 }
      );
    }

    // بررسی اطلاعات Bot
    if (!Array.isArray(bot.products)) {
      console.error("bot.products is not an array:", bot);

      return Response.json(
        {
          error: "لیست محصولات این ربات تنظیم نشده است."
        },
        { status: 500 }
      );
    }

    // ساخت اطلاعات محصولات
    const productInfo = bot.products
      .map(
        (product) =>
          `نام محصول: ${product.name || "ثبت نشده"}
قیمت: ${product.price || "ثبت نشده"}
توضیحات: ${product.description || "ثبت نشده"}`
      )
      .join("\n\n");

    // ساخت پیام سیستم
    const systemMessage = `
تو فروشنده هوشمند فروشگاه «${bot.storeName || "فروشگاه"}» هستی.

اطلاعات فروشگاه:
نام فروشگاه: ${bot.storeName || "ثبت نشده"}
شماره تماس: ${bot.phone || "ثبت نشده"}
شهر: ${bot.contact?.city || "ثبت نشده"}
آدرس: ${bot.contact?.address || "ثبت نشده"}

محصولات:
${productInfo || "محصولی ثبت نشده است."}

دستورالعمل:
${bot.instructions || "به مشتری با ادب و به زبان فارسی پاسخ بده."}

قوانین:
- به زبان فارسی پاسخ بده.
- اطلاعاتی که وجود ندارد را حدس نزن.
- قیمت ساختگی اعلام نکن.
- اگر اطلاعات محصول در لیست بالا وجود ندارد، صادقانه بگو اطلاعات آن را نداری.
`;

    console.log("Sending request to OpenRouter...");

    // ارسال درخواست به OpenRouter
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://foorshandeh-smart.vercel.app",
          "X-Title": "فروشنده هوشمند"
        },

        body: JSON.stringify({
          model: "openrouter/free",

          messages: [
            {
              role: "system",
              content: systemMessage
            },
            ...messages
          ]
        })
      }
    );

    const data = await response.json();

    console.log("OpenRouter status:", response.status);

    // بررسی خطای OpenRouter
    if (!response.ok) {
      console.error("OpenRouter Error:", data);

      return Response.json(
        {
          error:
            data?.error?.message ||
            "خطا در اتصال به OpenRouter"
        },
        {
          status: response.status
        }
      );
    }

    // بررسی پاسخ مدل
    const content =
      data?.choices?.[0]?.message?.content;

    if (!content) {
      console.error("Invalid OpenRouter response:", data);

      return Response.json(
        {
          error: "OpenRouter پاسخی برای این درخواست برنگرداند."
        },
        { status: 500 }
      );
    }

    // پاسخ نهایی
    return Response.json({
      content
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);

    return Response.json(
      {
        error:
          error?.message ||
          "خطایی در سرور رخ داد."
      },
      { status: 500 }
    );
  }
}
