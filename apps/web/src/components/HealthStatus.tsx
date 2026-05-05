import { createSignal, onMount } from "solid-js";

export default function HealthStatus() {
  const [text, setText] = createSignal("読み込み中…");

  onMount(async () => {
    try {
      const res = await fetch("/api/health");
      if (!res.ok) {
        setText(`HTTP ${res.status}`);
        return;
      }
      const data: unknown = await res.json();
      setText(JSON.stringify(data, null, 2));
    } catch (e) {
      setText(e instanceof Error ? e.message : "取得に失敗しました");
    }
  });

  return (
    <section aria-live="polite">
      <h2 class="text-lg font-semibold">API /health（dev プロキシ）</h2>
      <pre class="mt-2 rounded bg-neutral-100 p-3 text-sm dark:bg-neutral-800">
        {text()}
      </pre>
    </section>
  );
}
