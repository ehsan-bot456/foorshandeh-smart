import OpenAI from "openai";

export async function POST(request) {
  try {
    const { messages } = await request.json();

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          error: "OPENAI_API_KEY تنظیم نشده است."
        },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "تو فروشنده هوشمند هستی. به فارسی پاسخ بده و در فروش محصولات، معرفی کالا، مقایسه محصولات و پاسخ به سوالات مشتری کمک کن."
        },
        ...messages
      ]
    });

    return Response.json({
      content:
        completion.choices[0].message.content
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "خطایی در اتصال به هوش مصنوعی رخ داد."
      },
      { status: 500 }
    );
  }
}
