export async function POST(request) {
  try {
    const { messages } = await request.json();

    const lastMessage = messages?.[messages.length - 1];

    return Response.json({
      content: `پیام شما دریافت شد: ${lastMessage?.content || ""}`,
    });
  } catch (error) {
    return Response.json(
      { error: "خطا در دریافت پیام" },
      { status: 500 }
    );
  }
}
