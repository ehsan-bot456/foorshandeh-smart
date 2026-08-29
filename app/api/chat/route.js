import { bots } from "../../../../lib/bots";
import { getTenantId, getTenantConfig } from "../../../../lib/tenant";

export async function POST(request) {
  try {
    const { messages } = await request.json();

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          error: "OPENROUTER_API_KEY تنظیم نشده است."
        },
        { status: 500 }
      );
    }

    const tenantId = getTenantId(request);
    const bot = getTenantConfig(tenantId, bots);

    const productInfo = bot.products
      .map(
        (product) =>
          `نام محصول: ${product.name}
قیمت: ${product.price}
توضیحات: ${product.description}`
      )
      .join("\n\n");

    const systemMessage = `
تو فروشنده هوشمند فروشگاه «${bot.storeName}» هستی.

اطلاعات فروشگاه:
نام فروشگاه: ${bot.storeName}
شماره تماس: ${bot.phone}
شهر: ${bot.contact.city}
آدرس: ${bot.contact.address || "ثبت نشده"}

محصولات:
${productInfo}

دستورالعمل:
${bot.instructions}

به زبان فارسی پاسخ بده.
اطلاعاتی که وجود ندارد را حدس نزن.
قیمت ساختگی اعلام نکن.
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
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

    if (!response.ok) {
      console.error("OpenRouter Error:", data);

      return Response.json(
        {
          error: "خطا در اتصال به OpenRouter"
        },
        { status: response.status }
      );
    }

    return Response.json({
      content:
        data.choices?.[0]?.message?.content ||
        "پاسخی دریافت نشد."
    });

  } catch (error) {
    console.error("Server Error:", error);

    return Response.json(
      {
        error: "خطایی در سرور رخ داد."
      },
      { status: 500 }
    );
  }
}
