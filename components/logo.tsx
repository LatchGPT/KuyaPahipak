import Image from "next/image";
import { Bebas_Neue } from "next/font/google";

const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400", display: "swap" });

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <Image src="/logo.png" alt="Kuya Pahipak Vape Supply" width={96} height={96} priority className="h-16 w-16 rounded-xl object-contain" />
      <div className="min-w-0">
        <p className={`${bebasNeue.className} logo-title whitespace-nowrap text-2xl leading-none tracking-[0.08em]`}>Kuya Pahipak</p>
        <p className="logo-subtitle whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.22em]">Premium Vape Hub</p>
      </div>
    </div>
  );
}
