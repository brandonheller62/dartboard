import React, { useState, useEffect, useMemo, useRef } from "react";

/* ------------------------------------------------------------------
   S&P 500 constituents, parsed from the Wikipedia list Brandon supplied.
   Format: "TICKER|Company Name" joined with commas, grouped by GICS sector.
   502 tickers. This is a snapshot: if the index changes before 12/15/26,
   decide the rule for a deleted name before it happens, not after.
------------------------------------------------------------------- */
const RAW = {
  "Information Technology": "AAPL|Apple Inc,ACN|Accenture,ADBE|Adobe Inc,ADI|Analog Devices,ADSK|Autodesk,AKAM|Akamai Technologies,AMAT|Applied Materials,AMD|Advanced Micro Devices,ANET|Arista Networks,APH|Amphenol,AVGO|Broadcom,CDNS|Cadence Design Systems,CDW|CDW Corporation,CIEN|Ciena,COHR|Coherent Corp,CRM|Salesforce,CRWD|CrowdStrike,CSCO|Cisco,CTSH|Cognizant,DDOG|Datadog,DELL|Dell Technologies,FFIV|F5 Inc,FICO|Fair Isaac,FLEX|Flex Ltd,FSLR|First Solar,FTNT|Fortinet,GDDY|GoDaddy,GEN|Gen Digital,GLW|Corning Inc,HPE|Hewlett Packard Enterprise,HPQ|HP Inc,IBM|IBM,INTC|Intel,INTU|Intuit,IT|Gartner,JBL|Jabil,KEYS|Keysight Technologies,KLAC|KLA Corporation,LITE|Lumentum,LRCX|Lam Research,MCHP|Microchip Technology,MPWR|Monolithic Power Systems,MRVL|Marvell Technology,MSFT|Microsoft,MSI|Motorola Solutions,MU|Micron Technology,NOW|ServiceNow,NTAP|NetApp,NVDA|Nvidia,NXPI|NXP Semiconductors,ON|ON Semiconductor,ORCL|Oracle Corporation,PANW|Palo Alto Networks,PLTR|Palantir Technologies,PTC|PTC Inc,Q|Qnity Electronics,QCOM|Qualcomm,ROP|Roper Technologies,SMCI|Supermicro,SNDK|Sandisk,SNPS|Synopsys,STX|Seagate Technology,SWKS|Skyworks Solutions,TDY|Teledyne Technologies,TEL|TE Connectivity,TER|Teradyne,TRMB|Trimble Inc,TXN|Texas Instruments,TYL|Tyler Technologies,VRSN|Verisign,WDAY|Workday Inc,WDC|Western Digital,ZBRA|Zebra Technologies",
  "Financials": "ACGL|Arch Capital Group,AFL|Aflac,AIG|American International Group,AIZ|Assurant,AJG|Arthur J. Gallagher & Co,ALL|Allstate,AMP|Ameriprise Financial,AON|Aon plc,APO|Apollo Global Management,ARES|Ares Management,AXP|American Express,BAC|Bank of America,BEN|Franklin Resources,BLK|BlackRock,BNY|BNY Mellon,BRK.B|Berkshire Hathaway,BRO|Brown & Brown,BX|Blackstone Inc,C|Citigroup,CB|Chubb Limited,CBOE|Cboe Global Markets,CFG|Citizens Financial Group,CINF|Cincinnati Financial,CME|CME Group,COF|Capital One,COIN|Coinbase,CPAY|Corpay,EG|Everest Group,ERIE|Erie Indemnity,FDS|FactSet,FIS|Fidelity National Information Services,FISV|Fiserv,FITB|Fifth Third Bancorp,GL|Globe Life,GPN|Global Payments,GS|Goldman Sachs,HBAN|Huntington Bancshares,HIG|Hartford,HOOD|Robinhood Markets,IBKR|Interactive Brokers,ICE|Intercontinental Exchange,IVZ|Invesco,JKHY|Jack Henry & Associates,JPM|JPMorgan Chase,KEY|KeyCorp,KKR|KKR & Co,L|Loews Corporation,MA|Mastercard,MCO|Moody's Corporation,MET|MetLife,MRSH|Marsh McLennan,MS|Morgan Stanley,MSCI|MSCI,MTB|M&T Bank,NDAQ|Nasdaq Inc,NTRS|Northern Trust,PFG|Principal Financial Group,PGR|Progressive Corporation,PNC|PNC Financial Services,PRU|Prudential Financial,PYPL|PayPal,RF|Regions Financial Corporation,RJF|Raymond James Financial,SCHW|Charles Schwab Corporation,SPGI|S&P Global,STT|State Street Corporation,SYF|Synchrony Financial,TFC|Truist Financial,TROW|T. Rowe Price,TRV|Travelers Companies,USB|U.S. Bancorp,V|Visa Inc,WFC|Wells Fargo,WRB|W. R. Berkley Corporation,WTW|Willis Towers Watson,XYZ|Block Inc",
  "Health Care": "A|Agilent Technologies,ABBV|AbbVie,ABT|Abbott Laboratories,ALGN|Align Technology,AMGN|Amgen,BAX|Baxter International,BDX|Becton Dickinson,BIIB|Biogen,BMY|Bristol Myers Squibb,BSX|Boston Scientific,CAH|Cardinal Health,CI|Cigna,CNC|Centene Corporation,COO|Cooper Companies,COR|Cencora,CRL|Charles River Laboratories,CVS|CVS Health,DGX|Quest Diagnostics,DHR|Danaher Corporation,DVA|DaVita,DXCM|Dexcom,ELV|Elevance Health,EW|Edwards Lifesciences,GEHC|GE HealthCare,GILD|Gilead Sciences,HCA|HCA Healthcare,HSIC|Henry Schein,HUM|Humana,IDXX|Idexx Laboratories,INCY|Incyte,IQV|IQVIA,ISRG|Intuitive Surgical,JNJ|Johnson & Johnson,LH|Labcorp,LLY|Lilly,MCK|McKesson Corporation,MDT|Medtronic,MRK|Merck & Co,MRNA|Moderna,MTD|Mettler Toledo,PFE|Pfizer,PODD|Insulet Corporation,REGN|Regeneron Pharmaceuticals,RMD|ResMed,RVTY|Revvity,SOLV|Solventum,STE|Steris,SYK|Stryker Corporation,TECH|Bio-Techne,TMO|Thermo Fisher Scientific,UHS|Universal Health Services,UNH|UnitedHealth Group,VEEV|Veeva Systems,VRTX|Vertex Pharmaceuticals,VTRS|Viatris,WAT|Waters Corporation,WST|West Pharmaceutical Services,ZBH|Zimmer Biomet,ZTS|Zoetis",
  "Consumer Discretionary": "ABNB|Airbnb,AMZN|Amazon,APTV|Aptiv,AZO|AutoZone,BBY|Best Buy,BKNG|Booking Holdings,CCL|Carnival Corporation,CMG|Chipotle Mexican Grill,CVNA|Carvana,DASH|DoorDash,DECK|Deckers Brands,DHI|D. R. Horton,DPZ|Domino's,DRI|Darden Restaurants,EBAY|eBay Inc,EXPE|Expedia Group,F|Ford Motor Company,GM|General Motors,GPC|Genuine Parts Company,GRMN|Garmin,HAS|Hasbro,HD|Home Depot,HLT|Hilton Worldwide,LEN|Lennar,LOW|Lowe's,LULU|Lululemon Athletica,LVS|Las Vegas Sands,MAR|Marriott International,MCD|McDonald's,MGM|MGM Resorts,NCLH|Norwegian Cruise Line Holdings,NKE|Nike Inc,NVR|NVR Inc,ORLY|O'Reilly Automotive,PHM|PulteGroup,RCL|Royal Caribbean Group,RL|Ralph Lauren Corporation,ROST|Ross Stores,SBUX|Starbucks,TJX|TJX Companies,TPR|Tapestry Inc,TSCO|Tractor Supply,TSLA|Tesla Inc,ULTA|Ulta Beauty,WSM|Williams-Sonoma Inc,WYNN|Wynn Resorts,YUM|Yum! Brands",
  "Industrials": "ADP|Automatic Data Processing,ALLE|Allegion,AME|Ametek,AOS|A. O. Smith,AXON|Axon Enterprise,BA|Boeing,BLDR|Builders FirstSource,BR|Broadridge Financial Solutions,CARR|Carrier Global,CAT|Caterpillar Inc,CHRW|C.H. Robinson,CMI|Cummins,CPRT|Copart,CSX|CSX Corporation,CTAS|Cintas,DAL|Delta Air Lines,DD|DuPont,DE|Deere & Company,DOV|Dover Corporation,EFX|Equifax,EME|Emcor,EMR|Emerson Electric,ETN|Eaton Corporation,EXPD|Expeditors International,FAST|Fastenal,FDX|FedEx,FDXF|FedEx Freight,FERG|Ferguson Enterprises,FIX|Comfort Systems USA,FTV|Fortive,GD|General Dynamics,GE|GE Aerospace,GEV|GE Vernova,GNRC|Generac,GWW|W. W. Grainger,HII|Huntington Ingalls Industries,HON|Honeywell Technologies,HONA|Honeywell Aerospace,HUBB|Hubbell Incorporated,HWM|Howmet Aerospace,IEX|IDEX Corporation,IR|Ingersoll Rand,ITW|Illinois Tool Works,J|Jacobs Solutions,JBHT|J.B. Hunt,JCI|Johnson Controls,LDOS|Leidos,LHX|L3Harris,LII|Lennox International,LMT|Lockheed Martin,LUV|Southwest Airlines,MAS|Masco,MMM|3M,NDSN|Nordson Corporation,NOC|Northrop Grumman,NSC|Norfolk Southern,ODFL|Old Dominion,OTIS|Otis Worldwide,PAYX|Paychex,PH|Parker Hannifin,PNR|Pentair,PWR|Quanta Services,ROK|Rockwell Automation,ROL|Rollins Inc,RSG|Republic Services,RTX|RTX Corporation,SNA|Snap-on,SWK|Stanley Black & Decker,TDG|TransDigm Group,TT|Trane Technologies,TXT|Textron,UAL|United Airlines Holdings,UBER|Uber,UNP|Union Pacific Corporation,UPS|United Parcel Service,URI|United Rentals,VLTO|Veralto,VRSK|Verisk Analytics,VRT|Vertiv,WAB|Wabtec,WM|Waste Management,XYL|Xylem Inc",
  "Consumer Staples": "ADM|Archer Daniels Midland,BF.B|Brown–Forman,BG|Bunge Global,CASY|Casey's,CHD|Church & Dwight,CL|Colgate-Palmolive,CLX|Clorox,COST|Costco,DG|Dollar General,DLTR|Dollar Tree,EL|Estée Lauder Companies,GIS|General Mills,HRL|Hormel Foods,HSY|Hershey Company,KDP|Keurig Dr Pepper,KHC|Kraft Heinz,KMB|Kimberly-Clark,KO|Coca-Cola Company,KR|Kroger,KVUE|Kenvue,MDLZ|Mondelez International,MKC|McCormick & Company,MNST|Monster Beverage,MO|Altria,PEP|PepsiCo,PG|Procter & Gamble,PM|Philip Morris International,SJM|J.M. Smucker Company,STZ|Constellation Brands,SYY|Sysco,TAP|Molson Coors Beverage Company,TGT|Target Corporation,TSN|Tyson Foods,WMT|Walmart",
  "Communication Services": "APP|AppLovin,CHTR|Charter Communications,CMCSA|Comcast,DIS|Walt Disney Company,ECHO|EchoStar,FOX|Fox Corporation,FOXA|Fox Corporation,GOOG|Alphabet Inc,GOOGL|Alphabet Inc,LYV|Live Nation Entertainment,META|Meta Platforms,NFLX|Netflix,NWS|News Corp,NWSA|News Corp,OMC|Omnicom Group,PSKY|Paramount Skydance Corporation,RDDT|Reddit,T|AT&T,TKO|TKO Group Holdings,TMUS|T-Mobile US,TTD|Trade Desk,TTWO|Take-Two Interactive,VZ|Verizon,WBD|Warner Bros. Discovery",
  "Energy": "APA|APA Corporation,BKR|Baker Hughes,COP|ConocoPhillips,CVX|Chevron Corporation,DVN|Devon,EOG|EOG Resources,EQT|EQT Corporation,EXE|Expand,FANG|Diamondback,HAL|Halliburton,KMI|Kinder Morgan,MPC|Marathon Petroleum,OKE|Oneok,OXY|Occidental Petroleum,PSX|Phillips 66,SLB|Schlumberger,TPL|Texas Pacific Land Corporation,TRGP|Targa Resources,VLO|Valero,WEC|WEC,WMB|Williams Companies,XOM|ExxonMobil",
  "Utilities": "AEE|Ameren,AEP|American Electric Power,AES|AES Corporation,ATO|Atmos Energy,AWK|American Water Works,CEG|Constellation Energy,CMS|CMS Energy,CNP|CenterPoint Energy,D|Dominion Energy,DTE|DTE Energy,DUK|Duke Energy,ED|Consolidated Edison,EIX|Edison International,ES|Eversource Energy,ETR|Entergy,EVRG|Evergy,EXC|Exelon,FE|FirstEnergy,LNT|Alliant Energy,NEE|NextEra Energy,NI|NiSource,NRG|NRG Energy,PCG|PG&E Corporation,PEG|Public Service Enterprise Group,PNW|Pinnacle West Capital,PPL|PPL Corporation,SO|Southern Company,SRE|Sempra,VST|Vistra Corp,XEL|Xcel Energy",
  "Real Estate": "AMT|American Tower,ARE|Alexandria Real Estate Equities,BXP|BXP Inc,CBRE|CBRE Group,CCI|Crown Castle,CPT|Camden Property Trust,CSGP|CoStar Group,DLR|Digital Realty,DOC|Healthpeak Properties,EQIX|Equinix,ESS|Essex Property Trust,EXR|Extra Space Storage,FRT|Federal Realty Investment Trust,HST|Host Hotels & Resorts,INVH|Invitation Homes,IRM|Iron Mountain,KIM|Kimco Realty,MAA|Mid-America Apartment Communities,O|Realty Income,PLD|Prologis,PSA|Public Storage,REG|Regency Centers,SBAC|SBA Communications,SPG|Simon Property Group,UDR|UDR Inc,VICI|Vici Properties,VMRK|Vivmark Residential,VTR|Ventas,WELL|Welltower,WY|Weyerhaeuser",
  "Materials": "ALB|Albemarle Corporation,AMCR|Amcor,APD|Air Products,AVY|Avery Dennison,BALL|Ball Corporation,CF|CF Industries,CRH|CRH plc,CTVA|Corteva,DOW|Dow Inc,ECL|Ecolab,FCX|Freeport-McMoRan,IFF|International Flavors & Fragrances,IP|International Paper,LIN|Linde plc,LYB|LyondellBasell,MLM|Martin Marietta,MOS|Mosaic Company,NEM|Newmont,NUE|Nucor,PKG|Packaging Corporation of America,PPG|PPG Industries,SHW|Sherwin-Williams,STLD|Steel Dynamics,SW|Smurfit Westrock,VMC|Vulcan",
};

const SECTOR_COLORS = {
  "Information Technology": "#2F6F6B",
  "Financials": "#1F4E6B",
  "Health Care": "#6B2F45",
  "Consumer Discretionary": "#8A5A22",
  "Industrials": "#3E4A2E",
  "Consumer Staples": "#5A6B2F",
  "Communication Services": "#4A3A6B",
  "Energy": "#7A3A22",
  "Utilities": "#2F5A7A",
  "Real Estate": "#6B5A2F",
  "Materials": "#553F33",
};

const SHORT = {
  "Information Technology": "Info Tech",
  "Financials": "Financials",
  "Health Care": "Health Care",
  "Consumer Discretionary": "Cons. Disc.",
  "Industrials": "Industrials",
  "Consumer Staples": "Staples",
  "Communication Services": "Comm. Svcs",
  "Energy": "Energy",
  "Utilities": "Utilities",
  "Real Estate": "Real Estate",
  "Materials": "Materials",
};

const UNIVERSE = Object.entries(RAW).flatMap(([sector, str]) =>
  str.split(",").map((s) => {
    const [ticker, name] = s.split("|");
    return { ticker, name, sector };
  })
);

const C = {
  felt: "#123027",
  feltDeep: "#0C211B",
  cork: "#D9BE95",
  brass: "#C9A227",
  chalk: "#F2EDE3",
  chalkDim: "#A9B5AC",
  dart: "#C4462F",
  line: "#2A4A3E",
};

const IDLE_VEL = 165;  // deg/sec, the wheel's baseline drift
const FLIGHT_MS = 470; // how long a dart is in the air

const mono = "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace";
const display = "Georgia, 'Iowan Old Style', 'Times New Roman', serif";

function polar(r, deg) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [r * Math.cos(a), r * Math.sin(a)];
}
function wedgePath(r0, r1, a0, a1) {
  const [x0, y0] = polar(r1, a0);
  const [x1, y1] = polar(r1, a1);
  const [x2, y2] = polar(r0, a1);
  const [x3, y3] = polar(r0, a0);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r1} ${r1} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${r0} ${r0} 0 ${large} 0 ${x3} ${y3} Z`;
}

const KEYFRAMES = `
@keyframes db-hit {
  from { r: 3px; opacity: 0.85; stroke-width: 3; }
  to   { r: 26px; opacity: 0; stroke-width: 0.5; }
}
@keyframes db-quiver {
  0%   { transform: rotate(-9deg) translateY(2px); }
  35%  { transform: rotate(5deg); }
  65%  { transform: rotate(-2.2deg); }
  100% { transform: rotate(0deg); }
}
@keyframes db-rise {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}`;

export default function Dartboard() {
  const [tab, setTab] = useState("throw");
  const [phase, setPhase] = useState("idle"); // idle | flight | settle | done
  const [result, setResult] = useState(null);
  const [stuck, setStuck] = useState(null);   // landed dart, in board-local coords
  const [picks, setPicks] = useState([]);
  const [noRepeat, setNoRepeat] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [bench, setBench] = useState({ entry: "", now: "" });

  const wheelRef = useRef(null);   // the rotating <g>
  const flyRef = useRef(null);     // the dart while it is in the air
  const shellRef = useRef(null);   // wrapper we shake on impact
  const angleRef = useRef(0);
  const velRef = useRef(IDLE_VEL);
  const phaseRef = useRef("idle");
  const flightRef = useRef(null);
  const shakeRef = useRef(0);
  const pendingRef = useRef(null);
  const wedgeRef = useRef([]);
  const poolRef = useRef([]);

  const reduced = typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("dartboard:v1");
        if (r && r.value) {
          const parsed = JSON.parse(r.value);
          setPicks(parsed.picks || []);
          setBench(parsed.bench || { entry: "", now: "" });
        }
      } catch (e) {
        /* first run, nothing saved yet */
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.storage
      ?.set("dartboard:v1", JSON.stringify({ picks, bench }))
      .catch(() => {});
  }, [picks, bench, loaded]);

  const drawn = useMemo(() => new Set(picks.map((p) => p.ticker)), [picks]);
  const pool = useMemo(
    () => (noRepeat ? UNIVERSE.filter((s) => !drawn.has(s.ticker)) : UNIVERSE),
    [drawn, noRepeat]
  );

  // Wedge angles sized by how many names each sector still has in the pool.
  const wedges = useMemo(() => {
    const counts = {};
    pool.forEach((s) => (counts[s.sector] = (counts[s.sector] || 0) + 1));
    const total = pool.length || 1;
    let a = 0;
    return Object.keys(RAW)
      .filter((s) => counts[s])
      .map((s) => {
        const span = (counts[s] / total) * 360;
        const w = { sector: s, a0: a, a1: a + span, n: counts[s] };
        a += span;
        return w;
      });
  }, [pool]);

  // Keep the animation loop reading current data without re-subscribing.
  useEffect(() => {
    wedgeRef.current = wedges;
    poolRef.current = pool;
  });

  // Which name is under the dart? The wedge is whatever the board's rotation
  // put there at the moment of impact; the name is uniform inside that wedge.
  // Wedge width is proportional to names remaining, so every name stays equally
  // likely overall.
  function resolveAt(screenAngle) {
    const local = (((screenAngle - angleRef.current) % 360) + 360) % 360;
    const list = wedgeRef.current;
    const w = list.find((x) => local >= x.a0 && local < x.a1) || list[list.length - 1];
    const inSector = poolRef.current.filter((x) => x.sector === w.sector);
    return { stock: inSector[Math.floor(Math.random() * inSector.length)], local };
  }

  function land(r, jitter) {
    const { stock, local } = resolveAt(jitter);
    pendingRef.current = stock;
    setStuck({ r, a: local, key: Math.random() });
    flightRef.current = null;
    shakeRef.current = 1;
    velRef.current += 24; // the dart carries its own momentum into the board
    phaseRef.current = "settle";
    setPhase("settle");
  }

  useEffect(() => {
    if (reduced) return;
    let raf;
    let last = performance.now();
    let t = 0;
    const step = (now) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;

      const p = phaseRef.current;
      if (p === "idle" || p === "flight") {
        // A wandering drift, so the wheel cannot be timed by eye.
        const target =
          IDLE_VEL + 42 * Math.sin(t * 0.53) + 24 * Math.sin(t * 1.27 + 1.1);
        velRef.current += (target - velRef.current) * Math.min(dt * 3, 1);
      } else if (p === "settle") {
        velRef.current *= Math.exp(-2.0 * dt); // friction
        if (velRef.current < 5) {
          velRef.current = 0;
          phaseRef.current = "done";
          setPhase("done");
          setResult(pendingRef.current);
        }
      }
      angleRef.current += velRef.current * dt;
      if (wheelRef.current)
        wheelRef.current.setAttribute("transform", `rotate(${angleRef.current % 360})`);

      const f = flightRef.current;
      if (p === "flight" && f) {
        const k = Math.min((now - f.t0) / FLIGHT_MS, 1);
        const e = k * k; // accelerating away from the hand
        const [tx, ty] = polar(f.r, f.jitter);
        const x = f.x0 + (tx - f.x0) * e;
        const y = f.y0 + (ty - f.y0) * e;
        const sc = 2.4 - 1.4 * e; // foreshortening as it flies away from you
        const rot = f.spin0 * (1 - e) + f.jitter;
        if (flyRef.current)
          flyRef.current.setAttribute(
            "transform",
            `translate(${x} ${y}) rotate(${rot}) scale(${sc})`
          );
        if (k >= 1) land(f.r, f.jitter);
      }

      if (shakeRef.current > 0.002) {
        shakeRef.current *= Math.exp(-9 * dt);
        const m = shakeRef.current;
        if (shellRef.current)
          shellRef.current.style.transform =
            `translate(${Math.sin(t * 62) * 5 * m}px, ${Math.sin(t * 51 + 2) * 4 * m}px) ` +
            `rotate(${Math.sin(t * 47) * 0.7 * m}deg)`;
      } else if (shellRef.current && shellRef.current.style.transform) {
        shakeRef.current = 0;
        shellRef.current.style.transform = "";
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  function reset() {
    setResult(null);
    setStuck(null);
    pendingRef.current = null;
    flightRef.current = null;
    phaseRef.current = "idle";
    setPhase("idle");
  }

  function throwDart() {
    if (phaseRef.current === "flight" || phaseRef.current === "settle") return;
    if (pool.length === 0) return;
    setResult(null);
    setStuck(null);
    const r = 70 + Math.random() * 72;    // how deep into the board it bites
    const jitter = Math.random() * 360;   // and anywhere around it

    if (reduced) {
      const { stock, local } = resolveAt(jitter);
      setStuck({ r, a: local, key: Math.random() });
      setResult(stock);
      phaseRef.current = "done";
      setPhase("done");
      return;
    }

    flightRef.current = {
      t0: performance.now(),
      x0: -130 + Math.random() * 280, // thrown from a slightly different spot
      y0: 300,
      r,
      jitter,
      spin0: 260 + Math.random() * 220,
    };
    phaseRef.current = "flight";
    setPhase("flight");
  }

  function keepPick() {
    if (!result) return;
    setPicks([
      ...picks,
      {
        ...result,
        drawnAt: new Date().toISOString().slice(0, 10),
        entry: "",
        now: "",
      },
    ]);
    reset();
  }

  function update(i, field, val) {
    const next = picks.slice();
    next[i] = { ...next[i], [field]: val };
    setPicks(next);
  }

  const rets = picks.map((p) => {
    const e = parseFloat(p.entry), n = parseFloat(p.now);
    return e > 0 && n > 0 ? n / e - 1 : null;
  });
  const valid = rets.filter((r) => r !== null);
  const portRet = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
  const be = parseFloat(bench.entry), bn = parseFloat(bench.now);
  const benchRet = be > 0 && bn > 0 ? bn / be - 1 : null;

  return (
    <div style={{ background: C.feltDeep, color: C.chalk, minHeight: "100%", fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <style>{KEYFRAMES}</style>
      <div className="mx-auto px-5 py-6" style={{ maxWidth: 940 }}>
        <header className="flex flex-wrap items-end justify-between gap-3 pb-4" style={{ borderBottom: `1px solid ${C.line}` }}>
          <div>
            <h1 style={{ fontFamily: display, fontSize: 34, lineHeight: 1.05, margin: 0, letterSpacing: "-0.01em" }}>
              The Dartboard
            </h1>
            <p style={{ color: C.chalkDim, margin: "6px 0 0", fontSize: 14 }}>
              A uniform random draw from {UNIVERSE.length} S&amp;P 500 names. Your control group until 12/15/26.
            </p>
          </div>
          <nav className="flex gap-1" role="tablist">
            {[["throw", "Throw"], ["portfolio", "Portfolio"]].map(([k, label]) => (
              <button
                key={k}
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className="px-3 py-2"
                style={{
                  fontSize: 13,
                  background: tab === k ? C.felt : "transparent",
                  color: tab === k ? C.chalk : C.chalkDim,
                  border: `1px solid ${tab === k ? C.brass : C.line}`,
                  borderRadius: 2,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        </header>

        {tab === "throw" && (
          <section className="flex flex-col items-center py-6">
            <div
              ref={shellRef}
              onClick={throwDart}
              role="button"
              tabIndex={0}
              aria-label="Throw a dart"
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") { e.preventDefault(); throwDart(); }
              }}
              style={{
                position: "relative", width: 340, height: 340,
                cursor: phase === "idle" || phase === "done" ? "crosshair" : "default",
                willChange: "transform",
              }}
            >
              <svg viewBox="-170 -170 340 340" width="340" height="340" style={{ overflow: "visible" }}>
                <defs>
                  <radialGradient id="feltLight" cx="38%" cy="30%">
                    <stop offset="0%" stopColor="#1B4437" />
                    <stop offset="100%" stopColor={C.felt} />
                  </radialGradient>
                  <radialGradient id="vignette" cx="50%" cy="50%">
                    <stop offset="62%" stopColor="#000" stopOpacity="0" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
                  </radialGradient>
                  <filter id="dartShadow" x="-60%" y="-60%" width="220%" height="220%">
                    <feDropShadow dx="3" dy="5" stdDeviation="3" floodColor="#000" floodOpacity="0.45" />
                  </filter>
                </defs>

                <circle r="164" fill="url(#feltLight)" stroke={C.line} />
                <g ref={wheelRef} transform="rotate(0)">
                  {wedges.map((w) => {
                    const mid = ((w.a0 + w.a1) / 2) % 360;
                    const left = mid > 180;
                    return (
                      <g key={w.sector}>
                        <path d={wedgePath(52, 152, w.a0, w.a1)} fill={SECTOR_COLORS[w.sector]} stroke={C.brass} strokeWidth="0.6" />
                        <g transform={`rotate(${left ? mid + 90 : mid - 90})`}>
                          <text
                            x={left ? -60 : 60} y="3"
                            fill={C.chalk} fontSize="10"
                            textAnchor={left ? "end" : "start"}
                          >
                            {SHORT[w.sector]}
                            <tspan fill={C.brass} fontSize="8.5"> {w.n}</tspan>
                          </text>
                        </g>
                      </g>
                    );
                  })}
                  <circle r="52" fill={C.cork} stroke={C.brass} strokeWidth="1.5" />
                  <circle r="14" fill={C.dart} stroke={C.brass} />

                  {/* The landed dart rides the board around as it slows. */}
                  {stuck && (
                    <g transform={`translate(${polar(stuck.r, stuck.a)[0]} ${polar(stuck.r, stuck.a)[1]}) rotate(${stuck.a})`}>
                      <circle key={stuck.key} r="4" fill="none" stroke={C.chalk} strokeWidth="2" style={{ animation: "db-hit 520ms ease-out forwards" }} />
                      <g filter="url(#dartShadow)" style={{ animation: "db-quiver 700ms cubic-bezier(.2,.9,.3,1) 1" }}>
                        <DartGlyph />
                      </g>
                    </g>
                  )}
                </g>

                <circle r="164" fill="url(#vignette)" pointerEvents="none" />

                <g pointerEvents="none">
                  <circle r="52" fill="none" stroke={C.brass} strokeWidth="1.5" />
                  <text y="-8" fill={C.feltDeep} fontSize="20" textAnchor="middle" style={{ fontFamily: display }}>
                    {pool.length}
                  </text>
                  <text y="8" fill={C.feltDeep} fontSize="9" textAnchor="middle">
                    names left
                  </text>
                </g>

                {/* In the air: drawn last so it passes over everything. */}
                {phase === "flight" && (
                  <g ref={flyRef} transform="translate(150 300) scale(2.4)" filter="url(#dartShadow)" pointerEvents="none">
                    <DartGlyph />
                  </g>
                )}
              </svg>
            </div>

            <button
              onClick={throwDart}
              disabled={phase === "flight" || phase === "settle" || pool.length === 0}
              className="mt-5 px-8 py-3"
              style={{
                fontFamily: display, fontSize: 19, letterSpacing: "0.01em",
                background: phase === "flight" || phase === "settle" ? C.line : C.dart,
                color: C.chalk,
                border: `1px solid ${C.brass}`, borderRadius: 2,
                transition: "background 200ms ease",
                cursor: phase === "idle" || phase === "done" ? "pointer" : "default",
              }}
            >
              {phase === "flight" ? "In the air..." : phase === "settle" ? "Board still turning..." : phase === "done" ? "Throw again" : "Throw a dart"}
            </button>

            <label className="mt-3 flex items-center gap-2" style={{ fontSize: 13, color: C.chalkDim }}>
              <input type="checkbox" checked={noRepeat} onChange={(e) => setNoRepeat(e.target.checked)} />
              Draw without replacement
            </label>

            <div className="mt-5 w-full" style={{ maxWidth: 420, minHeight: 128 }}>
              {result ? (
                <div className="p-4" style={{ background: C.felt, border: `1px solid ${C.brass}`, borderRadius: 2, animation: "db-rise 320ms ease-out both" }}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span style={{ fontFamily: mono, fontSize: 30 }}>{result.ticker}</span>
                    <span style={{ fontSize: 12, color: C.chalkDim }}>{result.sector}</span>
                  </div>
                  <div style={{ fontFamily: display, fontSize: 17, marginTop: 2 }}>{result.name}</div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={keepPick} className="px-4 py-2" style={{ background: C.brass, color: C.feltDeep, border: "none", borderRadius: 2, fontSize: 13, cursor: "pointer" }}>
                      Add to portfolio
                    </button>
                    <button onClick={reset} className="px-4 py-2" style={{ background: "transparent", color: C.chalkDim, border: `1px solid ${C.line}`, borderRadius: 2, fontSize: 13, cursor: "pointer" }}>
                      Discard
                    </button>
                  </div>
                  <p style={{ fontSize: 11, color: C.chalkDim, marginTop: 10, marginBottom: 0 }}>
                    Discarding is a choice, and choices are exactly what this portfolio is supposed to be free of. Keep every throw or the control group stops being a control group.
                  </p>
                </div>
              ) : (
                <p className="text-center" style={{ color: C.chalkDim, fontSize: 13 }}>
                  The wheel never stops. Throw whenever you like \u2014 wedge width is each sector's share of the names left, so wherever the dart bites, every company still carries the same {(100 / pool.length).toFixed(2)}% chance. Equal odds per name, not per sector.
                </p>
              )}
            </div>
          </section>
        )}

        {tab === "portfolio" && (
          <section className="py-6">
            {picks.length === 0 ? (
              <p style={{ color: C.chalkDim }}>No throws yet. Head to the Throw tab and start the draw.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ color: C.chalkDim, textAlign: "left" }}>
                        <th className="py-2 pr-3" style={{ fontWeight: 500 }}>Ticker</th>
                        <th className="py-2 pr-3" style={{ fontWeight: 500 }}>Company</th>
                        <th className="py-2 pr-3" style={{ fontWeight: 500 }}>Drawn</th>
                        <th className="py-2 pr-3" style={{ fontWeight: 500 }}>Entry $</th>
                        <th className="py-2 pr-3" style={{ fontWeight: 500 }}>Now $</th>
                        <th className="py-2 pr-3" style={{ fontWeight: 500 }}>Return</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {picks.map((p, i) => (
                        <tr key={p.ticker + i} style={{ borderTop: `1px solid ${C.line}` }}>
                          <td className="py-2 pr-3" style={{ fontFamily: mono }}>{p.ticker}</td>
                          <td className="py-2 pr-3">{p.name}</td>
                          <td className="py-2 pr-3" style={{ color: C.chalkDim }}>{p.drawnAt}</td>
                          <td className="py-2 pr-3">
                            <input value={p.entry} onChange={(e) => update(i, "entry", e.target.value)} inputMode="decimal"
                              style={{ width: 68, background: C.felt, color: C.chalk, border: `1px solid ${C.line}`, padding: "3px 5px", borderRadius: 2 }} />
                          </td>
                          <td className="py-2 pr-3">
                            <input value={p.now} onChange={(e) => update(i, "now", e.target.value)} inputMode="decimal"
                              style={{ width: 68, background: C.felt, color: C.chalk, border: `1px solid ${C.line}`, padding: "3px 5px", borderRadius: 2 }} />
                          </td>
                          <td className="py-2 pr-3" style={{ fontFamily: mono, color: rets[i] === null ? C.chalkDim : rets[i] >= 0 ? "#7FBF8A" : C.dart }}>
                            {rets[i] === null ? "--" : (rets[i] * 100).toFixed(1) + "%"}
                          </td>
                          <td className="py-2">
                            <button onClick={() => setPicks(picks.filter((_, j) => j !== i))} aria-label={`Remove ${p.ticker}`}
                              style={{ background: "none", border: "none", color: C.chalkDim, cursor: "pointer" }}>x</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex flex-wrap gap-8">
                  <div>
                    <div style={{ fontSize: 12, color: C.chalkDim }}>Equal-weighted portfolio return</div>
                    <div style={{ fontFamily: display, fontSize: 30 }}>
                      {portRet === null ? "--" : (portRet * 100).toFixed(2) + "%"}
                    </div>
                    <div style={{ fontSize: 11, color: C.chalkDim }}>
                      {valid.length} of {picks.length} names priced
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: C.chalkDim }}>Benchmark (SPY or ^GSPC)</div>
                    <div className="flex gap-2 mt-1">
                      <input placeholder="entry" value={bench.entry} onChange={(e) => setBench({ ...bench, entry: e.target.value })} inputMode="decimal"
                        style={{ width: 72, background: C.felt, color: C.chalk, border: `1px solid ${C.line}`, padding: "4px 6px", borderRadius: 2 }} />
                      <input placeholder="now" value={bench.now} onChange={(e) => setBench({ ...bench, now: e.target.value })} inputMode="decimal"
                        style={{ width: 72, background: C.felt, color: C.chalk, border: `1px solid ${C.line}`, padding: "4px 6px", borderRadius: 2 }} />
                    </div>
                    <div style={{ fontSize: 12, color: C.chalkDim, marginTop: 6 }}>
                      Active return: <span style={{ fontFamily: mono, color: C.chalk }}>
                        {portRet !== null && benchRet !== null ? ((portRet - benchRet) * 100).toFixed(2) + "%" : "--"}
                      </span>
                    </div>
                  </div>
                </div>

                <SectorBars picks={picks} />

                <button
                  onClick={() => {
                    const rows = [["ticker", "name", "sector", "drawn", "entry", "now"]].concat(
                      picks.map((p) => [p.ticker, p.name, p.sector, p.drawnAt, p.entry, p.now])
                    );
                    const csv = rows.map((r) => r.join(",")).join("\n");
                    navigator.clipboard?.writeText(csv);
                  }}
                  className="mt-6 px-4 py-2"
                  style={{ background: "transparent", color: C.chalkDim, border: `1px solid ${C.line}`, borderRadius: 2, fontSize: 13, cursor: "pointer" }}
                >
                  Copy as CSV
                </button>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function SectorBars({ picks }) {
  const counts = {};
  picks.forEach((p) => (counts[p.sector] = (counts[p.sector] || 0) + 1));
  const idxCounts = {};
  UNIVERSE.forEach((s) => (idxCounts[s.sector] = (idxCounts[s.sector] || 0) + 1));
  const rows = Object.keys(RAW).filter((s) => counts[s] || idxCounts[s]);
  return (
    <div className="mt-8">
      <h3 style={{ fontFamily: display, fontSize: 18, margin: "0 0 4px" }}>Where the darts landed</h3>
      <p style={{ fontSize: 12, color: C.chalkDim, margin: "0 0 10px" }}>
        Your draw against the share of index names in each sector. Small samples cluster; that clustering is real risk, not bad luck.
      </p>
      {rows.map((s) => {
        const yours = ((counts[s] || 0) / picks.length) * 100;
        const idx = (idxCounts[s] / UNIVERSE.length) * 100;
        return (
          <div key={s} className="flex items-center gap-2" style={{ fontSize: 12, marginBottom: 4 }}>
            <div style={{ width: 104, color: C.chalkDim }}>{SHORT[s]}</div>
            <div style={{ flex: 1, height: 14, background: C.felt, position: "relative" }}>
              <div style={{ width: `${yours}%`, height: "100%", background: SECTOR_COLORS[s] }} />
              <div style={{ position: "absolute", left: `${idx}%`, top: -2, width: 1, height: 18, background: C.brass }} />
            </div>
            <div style={{ width: 40, fontFamily: mono }}>{yours.toFixed(0)}%</div>
          </div>
        );
      })}
      <p style={{ fontSize: 11, color: C.chalkDim, marginTop: 6 }}>Gold tick marks the index share by number of names.</p>
    </div>
  );
}

/* The dart itself: tip at the origin, body pointing outward along -y, so a
   single rotate() both aims it and places it on the board. */
function DartGlyph() {
  return (
    <g>
      <path d="M 0 0 L -2.2 -7 L 2.2 -7 Z" fill="#E9E4D6" />
      <rect x="-1.1" y="-24" width="2.2" height="17" fill="#B9BEC4" />
      <rect x="-3.1" y="-21" width="6.2" height="11" rx="2.4" fill="#7E858C" />
      <rect x="-3.1" y="-19" width="6.2" height="1" fill="#5C6268" />
      <rect x="-3.1" y="-15" width="6.2" height="1" fill="#5C6268" />
      <rect x="-1" y="-33" width="2" height="10" fill={C.brass} />
      <path d="M 0 -33 L -7.5 -40 L -7.5 -29 Z" fill={C.dart} />
      <path d="M 0 -33 L 7.5 -40 L 7.5 -29 Z" fill="#9E3524" />
    </g>
  );
}
