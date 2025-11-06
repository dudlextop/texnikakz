export const metadata = {
  title: 'Вход в Texnika.kz'
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Вход по номеру телефона</h1>
        <p className="mt-2 text-sm text-slate-600">Получите одноразовый код и продолжите работу с объявлениями и профилем.</p>
      </div>
      <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Номер телефона
          <input
            type="tel"
            placeholder="+7 7xx xxx xx xx"
            className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </label>
        <button type="button" className="w-full rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white">
          Получить код
        </button>
      </form>
    </div>
  );
}
