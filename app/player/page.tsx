"use client";

import { useEffect, useState } from "react";

type GameState = { mode?: string; title?: string; prompt?: string; options?: string[]; roundId?: number };
const playableModes = ["this", "compatibility", "flags", "would"];

export default function PlayerPage() {
  const [state, setState] = useState<GameState | null>(null);
  const [room, setRoom] = useState("VIVI-HINA");
  const [player, setPlayer] = useState<"vivi" | "hina">("vivi");
  const [playerKey, setPlayerKey] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nextRoom = params.get("room") || "VIVI-HINA";
    const nextPlayer = params.get("player") === "hina" ? "hina" : "vivi";
    setRoom(nextRoom); setPlayer(nextPlayer); setPlayerKey(params.get("key") || "");
    const load = async () => { try { const response = await fetch(`/api/room?room=${nextRoom}`, { cache: "no-store" }); setState((await response.json()).state); } catch {} };
    load(); const interval = window.setInterval(load, 1000); return () => window.clearInterval(interval);
  }, []);

  useEffect(() => setSent(false), [state?.roundId]);
  const submit = async (answer: string) => {
    if (!answer || sent) return;
    setError("");
    const response = await fetch("/api/room", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ room, player, playerKey, answer }) });
    if (response.ok) setSent(true); else setError("Не удалось отправить ответ: проверь ключ в ссылке.");
  };
  const active = playableModes.includes(state?.mode || "");
  const name = player === "vivi" ? "Виви" : "Хиночка";

  return <main className="player-page">
    <header><span>♥ ЛИЧНЫЙ ПЛАНШЕТ</span><b>{name}</b></header>
    {!active ? <section><p>ЖДЁМ РАУНД</p><h1>Ведущая сейчас выберет испытание.</h1><small>Держи эту страницу открытой. Когда начнётся «Кто из нас», «Совпадём?», «Флаги» или «Что выберешь», вопрос появится сам.</small></section> : <section>
      <p>{state?.title || "СЕКРЕТНЫЙ ВОПРОС"}</p>
      <h1>{state?.prompt}</h1>
      <div className="player-options">{state?.options?.map((option) => <button className={sent ? "sent" : ""} key={option} disabled={sent} onClick={() => submit(option)}>{option}</button>)}</div>
      <small>{sent ? "Ответ спрятан. Ждём, когда ведущая раскроет оба ответа." : error || "Выбери один вариант. Второй игрок и чат его пока не увидят."}</small>
    </section>}
  </main>;
}
