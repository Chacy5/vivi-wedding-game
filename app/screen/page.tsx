"use client";

import { useEffect, useState } from "react";

type State = {
  mode?: string;
  names?: string[];
  metrics?: Record<string, number>;
  status?: string;
  title?: string;
  question?: { id: number; text: string; category: string };
  prompt?: string;
  options?: string[];
  answers?: string[];
  revealed?: boolean;
  bingo?: { text: string; checked: boolean }[];
  court?: string;
  contract?: string[];
  tier?: Record<string, string>;
  roulette?: string;
  donation?: { username: string; amount: number; currency: string; action: { title: string; toast?: string } } | null;
};

const modeLabels: Record<string, string> = {
  home: "ПРЕДСВАДЕБНЫЕ ИСПЫТАНИЯ",
  questions: "ВОПРОСЫ",
  bingo: "БИНГО ЧАТА",
  this: "КТО ИЗ НАС?",
  compatibility: "СОВПАДЁМ ИЛИ РАЗВЕДЁМСЯ",
  tier: "ТИР-ЛИСТ БРАКА",
  court: "СЕМЕЙНЫЙ СУД",
  contract: "БРАЧНЫЙ ДОГОВОР",
  flags: "ФЛАГИ",
  knowledge: "НАСКОЛЬКО ТЫ МЕНЯ ЗНАЕШЬ?",
  would: "ЧТО БЫ ТЫ ВЫБРАЛ?",
  dowry: "ПРИДАНОЕ",
  life: "СОВМЕСТНАЯ ЖИЗНЬ",
  roulette: "СВАДЕБНАЯ РУЛЕТКА",
  final: "ФИНАЛЬНЫЙ ЭКЗАМЕН",
};

export default function ScreenPage() {
  const [state, setState] = useState<State | null>(null);
  useEffect(() => {
    const room = new URLSearchParams(location.search).get("room") || "VIVI-HINA";
    const load = async () => {
      try {
        const response = await fetch(`/api/room?room=${room}`, { cache: "no-store" });
        setState((await response.json()).state);
      } catch {}
    };
    load();
    const interval = window.setInterval(load, 1200);
    return () => window.clearInterval(interval);
  }, []);

  const mode = state?.mode || "home";
  const heading = mode === "questions" ? state?.question?.text : mode === "court" ? state?.court : mode === "roulette" ? state?.roulette : state?.prompt;
  const choices = ["this", "compatibility", "flags", "would"].includes(mode);

  return <main className="screen">
    <header className="screen-head"><span>✦ ТЕСТ НА СОУЛМЕЙТА</span><b>{state?.names?.join(" × ") || "Виви × Хиночка"}</b></header>
    <section className="screen-card">
      <p className="screen-kicker">{mode === "questions" ? `ВОПРОС №${String(state?.question?.id || 1).padStart(3, "0")} · ${state?.question?.category || "знакомство"}` : modeLabels[mode] || "ПРЕДСВАДЕБНЫЕ ИСПЫТАНИЯ"}</p>
      {mode === "bingo" ? <Bingo board={state?.bingo || []} /> : mode === "contract" ? <Contract items={state?.contract || []} /> : mode === "tier" ? <Tier tiers={state?.tier || {}} /> : mode === "roulette" ? <Roulette value={state?.roulette || "КРУТИМ?"} /> : <><h1>{heading || "Ведущая выбирает следующее испытание…"}</h1>{choices && <Choices options={state?.options || []} answers={state?.answers || []} revealed={Boolean(state?.revealed)} />}{["knowledge", "dowry", "life", "final"].includes(mode) && <p className="screen-note">Ведущая ведёт этот этап в пульте — результаты появятся здесь автоматически.</p>}</>}
      <div className="screen-status">СТАБИЛЬНОСТЬ БРАКА: <b>{state?.status || "Подозрительно стабильно"}</b></div>
    </section>
    {state?.donation && <aside className="screen-donation"><span>₽ {state.donation.username} · {state.donation.amount} {state.donation.currency}</span><b>{state.donation.action.title}</b>{state.donation.action.toast && <em>{state.donation.action.toast}</em>}</aside>}
    <footer>{Object.entries(state?.metrics || {}).map(([key, value]) => <span key={key}>{key} <b>{value}</b></span>)}</footer>
  </main>;
}

function Choices({ options, answers, revealed }: { options: string[]; answers: string[]; revealed: boolean }) {
  return <div className="screen-options">{options.map((option, index) => <span className={revealed && answers.includes(option) ? "revealed" : ""} key={option}>{revealed ? option : `${index + 1}. ${option}`}</span>)}</div>;
}

function Bingo({ board }: { board: { text: string; checked: boolean }[] }) {
  return <><h1>БИНГО ЧАТА</h1><div className="screen-bingo">{board.map((cell, index) => <span className={cell.checked ? "checked" : ""} key={`${cell.text}${index}`}>{cell.checked && "✦ "}{cell.text}</span>)}</div></>;
}

function Contract({ items }: { items: string[] }) {
  return <><h1>Законы брака, предложенные чатом</h1><ol className="screen-contract">{items.length ? items.map((item, index) => <li key={`${item}${index}`}>{item}</li>) : <li>Первый закон ждёт своего чатерса.</li>}</ol></>;
}

function Tier({ tiers }: { tiers: Record<string, string> }) {
  const rows = Object.entries(tiers);
  return <><h1>Тир-лист брака</h1><div className="screen-tier">{rows.length ? rows.map(([card, level]) => <span key={card}><b>{level}</b>{card}</span>) : <span>Карточки ещё ждут вердикта.</span>}</div></>;
}

function Roulette({ value }: { value: string }) {
  return <div className="screen-roulette"><p>СВАДЕБНАЯ РУЛЕТКА</p><b>{value}</b><small>Любой тост — добровольный и заменяется любым напитком.</small></div>;
}
