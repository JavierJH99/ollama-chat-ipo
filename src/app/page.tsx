"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Role = "system" | "user" | "assistant";
type Msg = { role: Role; content: string };

type Chat = {
  id: string;
  title: string;
  createdAt: number;
  messages: Msg[];
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

// Markdown MUY básico (code, inline code, negrita, cursiva, links, saltos).
function renderMarkdown(text: string) {
  // Escape básico
  const esc = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bloques de código ```
  const withCodeBlocks = esc.replace(/```([\s\S]*?)```/g, (_, code) => {
    return `<pre class="mt-2 mb-2 overflow-auto rounded-xl border bg-black/90 p-3 text-xs text-white"><code>${code}</code></pre>`;
  });

  // Inline code `
  const withInlineCode = withCodeBlocks.replace(/`([^`]+)`/g, (_, code) => {
    return `<code class="rounded-md border bg-black/5 px-1 py-0.5 text-[0.95em]">${code}</code>`;
  });

  // **negrita**
  const withBold = withInlineCode.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // *cursiva*
  const withItalic = withBold.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // links [txt](url)
  const withLinks = withItalic.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    `<a class="underline underline-offset-2" href="$2" target="_blank" rel="noreferrer">$1</a>`
  );

  // Saltos de línea
  const withBreaks = withLinks.replace(/\n/g, "<br/>");

  return { __html: withBreaks };
}

export default function Page() {
  const SYSTEM: Msg = useMemo(
    () => ({
      role: "system",
      content:
        "Eres un asistente útil. Responde en español. Si falta contexto, pregunta antes de inventar.",
    }),
    []
  );

  const [dark, setDark] = useState(false);

  // Persistencia local
  const [chats, setChats] = useState<Chat[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem("ollama_chats_v1");
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Chat[];
    } catch {
      return [];
    }
  });

  const [activeId, setActiveId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const raw = localStorage.getItem("ollama_active_chat_v1");
    return raw ?? "";
  });

  const activeChat = useMemo(() => chats.find((c) => c.id === activeId), [chats, activeId]);

  useEffect(() => {
    localStorage.setItem("ollama_chats_v1", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem("ollama_active_chat_v1", activeId);
  }, [activeId]);

  // Si no hay chat activo, crea uno
  useEffect(() => {
    if (activeChat) return;
    const id = uid();
    const c: Chat = {
      id,
      title: "Nuevo chat",
      createdAt: Date.now(),
      messages: [SYSTEM],
    };
    setChats((prev) => [c, ...prev]);
    setActiveId(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const messages = activeChat?.messages ?? [SYSTEM];
  const viewMessages = useMemo(() => messages.filter((m) => m.role !== "system"), [messages]);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [viewMessages.length, isSending]);

  function newChat() {
    const id = uid();
    const c: Chat = {
      id,
      title: "Nuevo chat",
      createdAt: Date.now(),
      messages: [SYSTEM],
    };
    setChats((prev) => [c, ...prev]);
    setActiveId(id);
    setInput("");
  }

  function deleteChat(id: string) {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      setActiveId("");
    }
  }

  function renameFromFirstUserMessage(chat: Chat) {
    const firstUser = chat.messages.find((m) => m.role === "user")?.content?.trim();
    if (!firstUser) return chat.title;
    return firstUser.length > 32 ? firstUser.slice(0, 32) + "…" : firstUser;
  }

  async function send() {
    const text = input.trim();
    if (!text || isSending || !activeChat) return;

    setInput("");
    setIsSending(true);

    // Añade mensaje user + placeholder assistant
    const userMsg: Msg = { role: "user", content: text };
    const placeholder: Msg = { role: "assistant", content: "" };

    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== activeChat.id) return c;
        const next = { ...c, messages: [...c.messages, userMsg, placeholder] };
        // auto-título al primer mensaje
        if (c.title === "Nuevo chat") next.title = renameFromFirstUserMessage(next);
        return next;
      })
    );

    // Prepara payload (sin placeholder vacío)
    const payloadMessages: Msg[] = [...activeChat.messages, userMsg];

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const err = await res.text().catch(() => "");
        throw new Error(err || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        setChats((prev) =>
          prev.map((c) => {
            if (c.id !== activeChat.id) return c;
            const msgs = [...c.messages];
            const last = msgs[msgs.length - 1];
            if (last?.role === "assistant") {
              msgs[msgs.length - 1] = { ...last, content: last.content + chunk };
            }
            return { ...c, messages: msgs };
          })
        );
      }
    } catch (e: any) {
      const msg = e?.name === "AbortError" ? "Respuesta detenida." : `⚠️ Error: ${e?.message ?? "fallo de conexión"}`;
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== activeChat.id) return c;
          const msgs = [...c.messages];
          const last = msgs[msgs.length - 1];
          if (last?.role === "assistant") msgs[msgs.length - 1] = { ...last, content: msg };
          return { ...c, messages: msgs };
        })
      );
    } finally {
      setIsSending(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  const shell = dark ? "dark" : "";

  return (
    <div className={shell}>
      <div className="min-h-screen bg-white text-gray-900 dark:bg-[#0b0f14] dark:text-gray-100">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="hidden md:flex w-72 flex-col border-r border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#0f1620]">
            <div className="p-3 flex items-center justify-between gap-2 border-b border-black/10 dark:border-white/10">
              <button
                onClick={newChat}
                className="flex-1 rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2 text-sm hover:bg-white dark:hover:bg-white/10"
              >
                + Nuevo chat
              </button>
              <button
                onClick={() => setDark((d) => !d)}
                className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2 text-sm hover:bg-white dark:hover:bg-white/10"
                title="Modo claro/oscuro"
              >
                {dark ? "☀️" : "🌙"}
              </button>
            </div>

            <div className="flex-1 overflow-auto p-2">
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 px-2 py-2">
                Conversaciones
              </div>
              <div className="space-y-1">
                {chats
                  .slice()
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((c) => (
                    <div
                      key={c.id}
                      className={[
                        "group flex items-center gap-2 rounded-xl px-3 py-2 cursor-pointer border",
                        c.id === activeId
                          ? "bg-white dark:bg-white/10 border-black/10 dark:border-white/15"
                          : "bg-transparent border-transparent hover:bg-white/60 dark:hover:bg-white/5",
                      ].join(" ")}
                      onClick={() => setActiveId(c.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{c.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {new Date(c.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(c.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-xs rounded-lg px-2 py-1 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
                        title="Borrar"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-3 border-t border-black/10 dark:border-white/10 text-xs text-gray-500 dark:text-gray-400">
              Ollama local · streaming
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 flex flex-col">
            {/* Topbar */}
            <header className="sticky top-0 z-10 border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-[#0b0f14]/70 backdrop-blur">
              <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Chat con IA</div>
                  <div className="font-semibold truncate">{activeChat?.title ?? "—"}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={newChat}
                    className="md:hidden rounded-xl border border-black/10 dark:border-white/10 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    + Nuevo
                  </button>

                  <button
                    onClick={() => setDark((d) => !d)}
                    className="md:hidden rounded-xl border border-black/10 dark:border-white/10 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                    title="Modo claro/oscuro"
                  >
                    {dark ? "☀️" : "🌙"}
                  </button>

                  {isSending ? (
                    <button
                      onClick={stop}
                      className="rounded-xl border border-black/10 dark:border-white/10 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                      title="Detener"
                    >
                      ⏹ Stop
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">Listo</span>
                  )}
                </div>
              </div>
            </header>

            {/* Messages */}
            <section className="flex-1 overflow-auto">
              <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
                {viewMessages.length === 0 && (
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4 text-gray-600 dark:text-gray-300">
                    Escribe algo para empezar. Ejemplos:
                    <div className="mt-2 flex flex-wrap gap-2 text-sm">
                      {[
                        "Resume este texto…",
                        "Explícame X como si tuviera 10 años",
                        "Dame ideas de…",
                        "Revisa este código…",
                      ].map((s) => (
                        <button
                          key={s}
                          className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10"
                          onClick={() => setInput(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {viewMessages.map((m, i) => (
                  <div
                    key={i}
                    className={[
                      "flex",
                      m.role === "user" ? "justify-end" : "justify-start",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "max-w-[92%] md:max-w-[82%] rounded-2xl border px-4 py-3 shadow-sm",
                        m.role === "user"
                          ? "bg-white dark:bg-white/10 border-black/10 dark:border-white/15"
                          : "bg-gray-50 dark:bg-white/5 border-black/10 dark:border-white/10",
                      ].join(" ")}
                    >
                      <div className="mb-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {m.role === "user" ? "Tú" : "IA"}
                      </div>
                      <div
                        className="text-sm leading-relaxed"
                        dangerouslySetInnerHTML={renderMarkdown(m.content)}
                      />
                      {m.role === "assistant" && isSending && i === viewMessages.length - 1 && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          escribiendo…
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div ref={bottomRef} />
              </div>
            </section>

            {/* Composer */}
            <footer className="border-t border-black/10 dark:border-white/10 bg-white/70 dark:bg-[#0b0f14]/70 backdrop-blur">
              <div className="mx-auto max-w-3xl px-4 py-3">
                <div className="flex items-end gap-2">
                  <textarea
                    className="flex-1 resize-none rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                    placeholder="Escribe tu mensaje… (Enter para enviar, Shift+Enter para salto)"
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    disabled={isSending}
                  />

                  {isSending ? (
                    <button
                      onClick={stop}
                      className="rounded-2xl border border-black/10 dark:border-white/10 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10"
                      title="Detener"
                    >
                      ⏹
                    </button>
                  ) : (
                    <button
                      onClick={send}
                      disabled={!input.trim()}
                      className="rounded-2xl border border-black/10 dark:border-white/10 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50"
                      title="Enviar"
                    >
                      ➤
                    </button>
                  )}
                </div>

                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Consejos: <span className="font-medium">Shift+Enter</span> para nueva línea ·{" "}
                  <span className="font-medium">Stop</span> para cortar la respuesta.
                </div>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
