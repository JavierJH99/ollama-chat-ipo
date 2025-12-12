import { NextRequest } from "next/server";

export const runtime = "nodejs";

type ClientMessage = { role: "system" | "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const { messages }: { messages: ClientMessage[] } = await req.json();

  const host = process.env.OLLAMA_HOST ?? "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL ?? "llama3.1:8b";
  console.log({processEnv: process.env, host, model});
  const ollamaRes = await fetch(`${host}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  });

  if (!ollamaRes.ok || !ollamaRes.body) {
    const text = await ollamaRes.text().catch(() => "");
    return new Response(
      JSON.stringify({ error: "Ollama error", status: ollamaRes.status, detail: text }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Ollama stream devuelve JSONL (una línea JSON por chunk)
  // Convertimos a texto plano (solo tokens) para el frontend.
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = ollamaRes.body!.getReader();

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Procesa líneas completas
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const obj = JSON.parse(line);
              const token: string | undefined = obj?.message?.content;
              const isDone: boolean | undefined = obj?.done;

              if (token) controller.enqueue(encoder.encode(token));
              if (isDone) {
                controller.close();
                return;
              }
            } catch {
              // Ignora líneas malformadas
            }
          }
        }

        controller.close();
      } catch (e) {
        controller.error(e);
      } finally {
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}