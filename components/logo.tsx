export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 text-lg font-black text-black">
        KP
      </div>
      <div>
        <p className="text-base font-black tracking-wide text-white">Kuya Pahipak</p>
        <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300">Premium Vape Hub</p>
      </div>
    </div>
  );
}
