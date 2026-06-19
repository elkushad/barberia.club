"use client";

import { useState, useRef, useEffect } from "react";

export type CountryEntry = { code: string; flag: string; name: string };

const ALL_COUNTRIES: CountryEntry[] = [
  // América Latina primero
  { code: "+51",  flag: "🇵🇪", name: "Perú" },
  { code: "+52",  flag: "🇲🇽", name: "México" },
  { code: "+57",  flag: "🇨🇴", name: "Colombia" },
  { code: "+54",  flag: "🇦🇷", name: "Argentina" },
  { code: "+55",  flag: "🇧🇷", name: "Brasil" },
  { code: "+56",  flag: "🇨🇱", name: "Chile" },
  { code: "+593", flag: "🇪🇨", name: "Ecuador" },
  { code: "+58",  flag: "🇻🇪", name: "Venezuela" },
  { code: "+591", flag: "🇧🇴", name: "Bolivia" },
  { code: "+595", flag: "🇵🇾", name: "Paraguay" },
  { code: "+598", flag: "🇺🇾", name: "Uruguay" },
  { code: "+502", flag: "🇬🇹", name: "Guatemala" },
  { code: "+503", flag: "🇸🇻", name: "El Salvador" },
  { code: "+504", flag: "🇭🇳", name: "Honduras" },
  { code: "+505", flag: "🇳🇮", name: "Nicaragua" },
  { code: "+506", flag: "🇨🇷", name: "Costa Rica" },
  { code: "+507", flag: "🇵🇦", name: "Panamá" },
  { code: "+53",  flag: "🇨🇺", name: "Cuba" },
  { code: "+1",   flag: "🇩🇴", name: "Rep. Dominicana" },
  { code: "+509", flag: "🇭🇹", name: "Haití" },
  { code: "+592", flag: "🇬🇾", name: "Guyana" },
  { code: "+597", flag: "🇸🇷", name: "Surinam" },
  { code: "+501", flag: "🇧🇿", name: "Belice" },
  { code: "+590", flag: "🇬🇵", name: "Guadalupe" },
  { code: "+596", flag: "🇲🇶", name: "Martinica" },
  { code: "+594", flag: "🇬🇫", name: "Guayana Francesa" },
  { code: "+599", flag: "🇧🇶", name: "Curazao / Antillas" },
  // Norte América
  { code: "+1",   flag: "🇺🇸", name: "Estados Unidos" },
  { code: "+1",   flag: "🇨🇦", name: "Canadá" },
  // Europa
  { code: "+34",  flag: "🇪🇸", name: "España" },
  { code: "+44",  flag: "🇬🇧", name: "Reino Unido" },
  { code: "+49",  flag: "🇩🇪", name: "Alemania" },
  { code: "+33",  flag: "🇫🇷", name: "Francia" },
  { code: "+39",  flag: "🇮🇹", name: "Italia" },
  { code: "+351", flag: "🇵🇹", name: "Portugal" },
  { code: "+31",  flag: "🇳🇱", name: "Países Bajos" },
  { code: "+32",  flag: "🇧🇪", name: "Bélgica" },
  { code: "+41",  flag: "🇨🇭", name: "Suiza" },
  { code: "+43",  flag: "🇦🇹", name: "Austria" },
  { code: "+46",  flag: "🇸🇪", name: "Suecia" },
  { code: "+47",  flag: "🇳🇴", name: "Noruega" },
  { code: "+45",  flag: "🇩🇰", name: "Dinamarca" },
  { code: "+358", flag: "🇫🇮", name: "Finlandia" },
  { code: "+353", flag: "🇮🇪", name: "Irlanda" },
  { code: "+30",  flag: "🇬🇷", name: "Grecia" },
  { code: "+48",  flag: "🇵🇱", name: "Polonia" },
  { code: "+420", flag: "🇨🇿", name: "República Checa" },
  { code: "+421", flag: "🇸🇰", name: "Eslovaquia" },
  { code: "+36",  flag: "🇭🇺", name: "Hungría" },
  { code: "+40",  flag: "🇷🇴", name: "Rumania" },
  { code: "+359", flag: "🇧🇬", name: "Bulgaria" },
  { code: "+385", flag: "🇭🇷", name: "Croacia" },
  { code: "+386", flag: "🇸🇮", name: "Eslovenia" },
  { code: "+387", flag: "🇧🇦", name: "Bosnia y Herzegovina" },
  { code: "+381", flag: "🇷🇸", name: "Serbia" },
  { code: "+382", flag: "🇲🇪", name: "Montenegro" },
  { code: "+383", flag: "🇽🇰", name: "Kosovo" },
  { code: "+389", flag: "🇲🇰", name: "Macedonia del Norte" },
  { code: "+355", flag: "🇦🇱", name: "Albania" },
  { code: "+380", flag: "🇺🇦", name: "Ucrania" },
  { code: "+375", flag: "🇧🇾", name: "Bielorrusia" },
  { code: "+373", flag: "🇲🇩", name: "Moldavia" },
  { code: "+374", flag: "🇦🇲", name: "Armenia" },
  { code: "+994", flag: "🇦🇿", name: "Azerbaiyán" },
  { code: "+995", flag: "🇬🇪", name: "Georgia" },
  { code: "+370", flag: "🇱🇹", name: "Lituania" },
  { code: "+371", flag: "🇱🇻", name: "Letonia" },
  { code: "+372", flag: "🇪🇪", name: "Estonia" },
  { code: "+354", flag: "🇮🇸", name: "Islandia" },
  { code: "+356", flag: "🇲🇹", name: "Malta" },
  { code: "+357", flag: "🇨🇾", name: "Chipre" },
  { code: "+352", flag: "🇱🇺", name: "Luxemburgo" },
  { code: "+376", flag: "🇦🇩", name: "Andorra" },
  { code: "+377", flag: "🇲🇨", name: "Mónaco" },
  { code: "+378", flag: "🇸🇲", name: "San Marino" },
  { code: "+350", flag: "🇬🇮", name: "Gibraltar" },
  { code: "+298", flag: "🇫🇴", name: "Islas Feroe" },
  { code: "+299", flag: "🇬🇱", name: "Groenlandia" },
  { code: "+423", flag: "🇱🇮", name: "Liechtenstein" },
  { code: "+7",   flag: "🇷🇺", name: "Rusia" },
  // Asia
  { code: "+86",  flag: "🇨🇳", name: "China" },
  { code: "+91",  flag: "🇮🇳", name: "India" },
  { code: "+81",  flag: "🇯🇵", name: "Japón" },
  { code: "+82",  flag: "🇰🇷", name: "Corea del Sur" },
  { code: "+62",  flag: "🇮🇩", name: "Indonesia" },
  { code: "+63",  flag: "🇵🇭", name: "Filipinas" },
  { code: "+84",  flag: "🇻🇳", name: "Vietnam" },
  { code: "+66",  flag: "🇹🇭", name: "Tailandia" },
  { code: "+60",  flag: "🇲🇾", name: "Malasia" },
  { code: "+65",  flag: "🇸🇬", name: "Singapur" },
  { code: "+880", flag: "🇧🇩", name: "Bangladés" },
  { code: "+92",  flag: "🇵🇰", name: "Pakistán" },
  { code: "+94",  flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+95",  flag: "🇲🇲", name: "Myanmar" },
  { code: "+855", flag: "🇰🇭", name: "Camboya" },
  { code: "+856", flag: "🇱🇦", name: "Laos" },
  { code: "+673", flag: "🇧🇳", name: "Brunéi" },
  { code: "+670", flag: "🇹🇱", name: "Timor Oriental" },
  { code: "+977", flag: "🇳🇵", name: "Nepal" },
  { code: "+975", flag: "🇧🇹", name: "Bután" },
  { code: "+976", flag: "🇲🇳", name: "Mongolia" },
  { code: "+886", flag: "🇹🇼", name: "Taiwán" },
  { code: "+852", flag: "🇭🇰", name: "Hong Kong" },
  { code: "+853", flag: "🇲🇴", name: "Macao" },
  { code: "+850", flag: "🇰🇵", name: "Corea del Norte" },
  { code: "+998", flag: "🇺🇿", name: "Uzbekistán" },
  { code: "+992", flag: "🇹🇯", name: "Tayikistán" },
  { code: "+993", flag: "🇹🇲", name: "Turkmenistán" },
  { code: "+996", flag: "🇰🇬", name: "Kirguistán" },
  { code: "+7",   flag: "🇰🇿", name: "Kazajistán" },
  { code: "+93",  flag: "🇦🇫", name: "Afganistán" },
  // Medio Oriente
  { code: "+90",  flag: "🇹🇷", name: "Turquía" },
  { code: "+98",  flag: "🇮🇷", name: "Irán" },
  { code: "+964", flag: "🇮🇶", name: "Irak" },
  { code: "+963", flag: "🇸🇾", name: "Siria" },
  { code: "+961", flag: "🇱🇧", name: "Líbano" },
  { code: "+962", flag: "🇯🇴", name: "Jordania" },
  { code: "+972", flag: "🇮🇱", name: "Israel" },
  { code: "+970", flag: "🇵🇸", name: "Palestina" },
  { code: "+966", flag: "🇸🇦", name: "Arabia Saudita" },
  { code: "+971", flag: "🇦🇪", name: "Emiratos Árabes" },
  { code: "+974", flag: "🇶🇦", name: "Catar" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+973", flag: "🇧🇭", name: "Baréin" },
  { code: "+968", flag: "🇴🇲", name: "Omán" },
  { code: "+967", flag: "🇾🇪", name: "Yemen" },
  { code: "+960", flag: "🇲🇻", name: "Maldivas" },
  // África
  { code: "+20",  flag: "🇪🇬", name: "Egipto" },
  { code: "+27",  flag: "🇿🇦", name: "Sudáfrica" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+254", flag: "🇰🇪", name: "Kenia" },
  { code: "+233", flag: "🇬🇭", name: "Ghana" },
  { code: "+212", flag: "🇲🇦", name: "Marruecos" },
  { code: "+213", flag: "🇩🇿", name: "Argelia" },
  { code: "+216", flag: "🇹🇳", name: "Túnez" },
  { code: "+218", flag: "🇱🇾", name: "Libia" },
  { code: "+251", flag: "🇪🇹", name: "Etiopía" },
  { code: "+255", flag: "🇹🇿", name: "Tanzania" },
  { code: "+256", flag: "🇺🇬", name: "Uganda" },
  { code: "+250", flag: "🇷🇼", name: "Ruanda" },
  { code: "+237", flag: "🇨🇲", name: "Camerún" },
  { code: "+225", flag: "🇨🇮", name: "Costa de Marfil" },
  { code: "+221", flag: "🇸🇳", name: "Senegal" },
  { code: "+243", flag: "🇨🇩", name: "R. D. Congo" },
  { code: "+242", flag: "🇨🇬", name: "Congo" },
  { code: "+244", flag: "🇦🇴", name: "Angola" },
  { code: "+258", flag: "🇲🇿", name: "Mozambique" },
  { code: "+260", flag: "🇿🇲", name: "Zambia" },
  { code: "+263", flag: "🇿🇼", name: "Zimbabue" },
  { code: "+261", flag: "🇲🇬", name: "Madagascar" },
  { code: "+264", flag: "🇳🇦", name: "Namibia" },
  { code: "+267", flag: "🇧🇼", name: "Botsuana" },
  { code: "+265", flag: "🇲🇼", name: "Malaui" },
  { code: "+266", flag: "🇱🇸", name: "Lesoto" },
  { code: "+268", flag: "🇸🇿", name: "Suazilandia" },
  { code: "+249", flag: "🇸🇩", name: "Sudán" },
  { code: "+211", flag: "🇸🇸", name: "Sudán del Sur" },
  { code: "+252", flag: "🇸🇴", name: "Somalia" },
  { code: "+291", flag: "🇪🇷", name: "Eritrea" },
  { code: "+253", flag: "🇩🇯", name: "Yibuti" },
  { code: "+241", flag: "🇬🇦", name: "Gabón" },
  { code: "+240", flag: "🇬🇶", name: "Guinea Ecuatorial" },
  { code: "+239", flag: "🇸🇹", name: "Santo Tomé y Príncipe" },
  { code: "+238", flag: "🇨🇻", name: "Cabo Verde" },
  { code: "+236", flag: "🇨🇫", name: "R. Centroafricana" },
  { code: "+235", flag: "🇹🇩", name: "Chad" },
  { code: "+227", flag: "🇳🇪", name: "Níger" },
  { code: "+223", flag: "🇲🇱", name: "Mali" },
  { code: "+226", flag: "🇧🇫", name: "Burkina Faso" },
  { code: "+228", flag: "🇹🇬", name: "Togo" },
  { code: "+229", flag: "🇧🇯", name: "Benín" },
  { code: "+224", flag: "🇬🇳", name: "Guinea" },
  { code: "+245", flag: "🇬🇼", name: "Guinea-Bisáu" },
  { code: "+232", flag: "🇸🇱", name: "Sierra Leona" },
  { code: "+231", flag: "🇱🇷", name: "Liberia" },
  { code: "+220", flag: "🇬🇲", name: "Gambia" },
  { code: "+222", flag: "🇲🇷", name: "Mauritania" },
  { code: "+230", flag: "🇲🇺", name: "Mauricio" },
  { code: "+269", flag: "🇰🇲", name: "Comoras" },
  { code: "+248", flag: "🇸🇨", name: "Seychelles" },
  { code: "+262", flag: "🇷🇪", name: "Reunión" },
  // Oceanía
  { code: "+61",  flag: "🇦🇺", name: "Australia" },
  { code: "+64",  flag: "🇳🇿", name: "Nueva Zelanda" },
  { code: "+675", flag: "🇵🇬", name: "Papúa Nueva Guinea" },
  { code: "+679", flag: "🇫🇯", name: "Fiyi" },
  { code: "+677", flag: "🇸🇧", name: "Islas Salomón" },
  { code: "+678", flag: "🇻🇺", name: "Vanuatu" },
  { code: "+685", flag: "🇼🇸", name: "Samoa" },
  { code: "+676", flag: "🇹🇴", name: "Tonga" },
  { code: "+686", flag: "🇰🇮", name: "Kiribati" },
  { code: "+691", flag: "🇫🇲", name: "Micronesia" },
  { code: "+692", flag: "🇲🇭", name: "Islas Marshall" },
  { code: "+680", flag: "🇵🇼", name: "Palaos" },
  { code: "+674", flag: "🇳🇷", name: "Nauru" },
  { code: "+688", flag: "🇹🇻", name: "Tuvalu" },
  { code: "+689", flag: "🇵🇫", name: "Polinesia Francesa" },
  { code: "+687", flag: "🇳🇨", name: "Nueva Caledonia" },
  { code: "+682", flag: "🇨🇰", name: "Islas Cook" },
  { code: "+683", flag: "🇳🇺", name: "Niue" },
  { code: "+681", flag: "🇼🇫", name: "Wallis y Futuna" },
  { code: "+672", flag: "🇳🇫", name: "Isla Norfolk" },
  { code: "+500", flag: "🇫🇰", name: "Islas Malvinas" },
  { code: "+508", flag: "🇵🇲", name: "San Pedro y Miquelón" },
];

interface Props {
  value: string;
  selectedName: string;
  selectedFlag: string;
  onChange: (code: string, name: string, flag: string) => void;
}

export default function CountryCodePicker({ value, selectedName, selectedFlag, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const filtered = search.trim()
    ? ALL_COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.includes(search)
      )
    : ALL_COUNTRIES;

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setSearch(""); }}
        className="premium-input"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          cursor: "pointer",
          userSelect: "none",
          whiteSpace: "nowrap",
          padding: "0.6rem 0.75rem",
          fontSize: "0.95rem",
        }}
        aria-label="Seleccionar código de país"
      >
        <span>{selectedFlag}</span>
        <span>{value}</span>
        <span style={{ fontSize: "0.65rem", opacity: 0.6, marginLeft: "2px" }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0,
          zIndex: 300,
          width: "260px",
          backgroundColor: "var(--bg-secondary, #111)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        }}>
          <div style={{ padding: "8px" }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar país..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="premium-input"
              style={{ width: "100%", fontSize: "0.85rem", padding: "6px 10px" }}
            />
          </div>
          <ul style={{
            maxHeight: "240px",
            overflowY: "auto",
            margin: 0,
            padding: "0 0 6px 0",
            listStyle: "none",
          }}>
            {filtered.length === 0 && (
              <li style={{ padding: "10px 14px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Sin resultados
              </li>
            )}
            {filtered.map((c, i) => (
              <li key={`${c.name}-${i}`}>
                <button
                  type="button"
                  onClick={() => { onChange(c.code, c.name, c.flag); setOpen(false); setSearch(""); }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: c.code === value && c.name === selectedName ? "rgba(255,255,255,0.07)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "7px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.875rem",
                    color: "var(--text-primary, #fff)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                  onMouseLeave={e => (e.currentTarget.style.background = c.code === value && c.name === selectedName ? "rgba(255,255,255,0.07)" : "transparent")}
                >
                  <span style={{ fontSize: "1.1rem" }}>{c.flag}</span>
                  <span style={{ flex: 1 }}>{c.name}</span>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{c.code}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
