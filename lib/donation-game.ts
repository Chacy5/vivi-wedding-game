export type DonationAction = {
  id: string;
  title: string;
  label: string;
  description: string;
  metric?: "chemistry" | "compatibility" | "knowledge" | "trust" | "chaos" | "flags";
  metricChange?: number;
  mode?: "court" | "compatibility" | "contract" | "roulette";
  toast?: string;
};

export type DonationEvent = {
  id: string;
  username: string;
  message: string;
  amount: number;
  currency: string;
  createdAt: string;
  isTest?: boolean;
  action: DonationAction;
};

export const donationMenu: { amount: number; action: DonationAction }[] = [
  { amount: 50, action: { id: "vow", title: "Клятва на салфетке", label: "50 ₽", description: "Донатер задаёт короткую клятву или обещание для пары. Виви и Хиночка принимают, отклоняют или смешно исправляют её.", metric: "trust", metricChange: 1 } },
  { amount: 100, action: { id: "bouquet", title: "Букет совпадений", label: "100 ₽", description: "Добавляет +1 к химии и даёт донатеру право назвать один «зелёный флаг» пары.", metric: "chemistry", metricChange: 1 } },
  { amount: 150, action: { id: "toast", title: "Алхимический тост", label: "150 ₽", description: "На экране появляется свадебное пророчество и повод для тоста. Символический глоток — любого напитка и только если хочется.", metric: "chaos", metricChange: 1, mode: "roulette", toast: "За то, что это всё ещё хорошая идея." } },
  { amount: 200, action: { id: "case", title: "Дело от свидетеля", label: "200 ₽", description: "Открывает Семейный суд: донатер присылает свой кейс, чат выбирает вердикт.", metric: "chaos", metricChange: 2, mode: "court" } },
  { amount: 300, action: { id: "seal", title: "Печать совместимости", label: "300 ₽", description: "Открывает «Совпадём или разведёмся» и даёт паре +3 к совместимости за честное раскрытие.", metric: "compatibility", metricChange: 3, mode: "compatibility" } },
  { amount: 500, action: { id: "amendment", title: "Поправка в договор", label: "500 ₽", description: "Сообщение донатера становится пунктом брачного договора. Пара всё ещё может внести правку или отклонить его.", mode: "contract" } },
  { amount: 1000, action: { id: "witness", title: "Главный свидетель", label: "1000 ₽", description: "Запускает большую свадебную рулетку и даёт +5 к химии. Донатер пишет торжественную речь или абсолютный мем.", metric: "chemistry", metricChange: 5, mode: "roulette" } },
];

export function actionForAmount(amount: number): DonationAction {
  return [...donationMenu].reverse().find((tier) => amount >= tier.amount)?.action ?? donationMenu[0]!.action;
}
