export async function POST(request) {
  try {
    const { messages } = await request.json();

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: messages,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter error:", data);

      return Response.json(
        {
          error:
            data?.error?.message ||
            "خطا در اتصال به OpenRouter",
        },
        { status: response.status }
      );
    }

    return Response.json({
      content: data.choices?.[0]?.message?.content || "پاسخی دریافت نشد.",
    });
  } catch (error) {
    console.error("Server error:", error);

    return Response.json(
      {
        error: error?.message || "خطای سرور",
      },
      { status: 500 }
    );
  }
}
