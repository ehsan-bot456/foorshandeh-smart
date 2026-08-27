import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { messages } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    return Response.json({
      content: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("OPENAI ERROR:", error);

    return Response.json(
      {
        error: error?.message || "خطای نامشخص در OpenAI",
      },
      { status: 500 }
    );
  }
}
