"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUpRight, Check, Mail, Menu, MessageCircle, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { copy, menus, type Lang } from "./content";

const EMAIL_NL = "info@paulinekookt.nl";
const EMAIL_DE = "info@paulinekocht.de";
const PHONE = "31625547094";
const serviceImages = ["sharing-table", "salmon-brunch", "roasted-vegetable-platter"];
function Brand({ lang, large = false }: { lang: Lang; large?: boolean }) {
  const verb = lang === "nl" ? "kookt" : "cooks";
  return <a href="#top" className={`brand ${large ? "brand-large" : ""}`} aria-label={`Pauline ${verb} — ${lang === "nl" ? "naar boven" : "home"}`}><span>Pauline <em>{verb}</em></span><small>CATERING</small></a>;
}
export default function Home() {
  const [lang, setLang] = useState<Lang>("nl");
  const [languageReady, setLanguageReady] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [menuTab, setMenuTab] = useState("box");
  const [service, setService] = useState("unsure");
  const [country, setCountry] = useState<"nl" | "de">("nl");
  const [contactFeedback, setContactFeedback] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [today, setToday] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const t = copy[lang];
  const email = country === "de" ? EMAIL_DE : EMAIL_NL;
  useEffect(() => {
    try { const saved = localStorage.getItem("pauline-language"); if (saved === "en" || saved === "nl") setLang(saved); } catch {}
    setLanguageReady(true);
    const now = new Date();
    setToday(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t.meta);
    if (languageReady) { try { localStorage.setItem("pauline-language", lang); } catch {} }
  }, [lang, languageReady, t.pageTitle, t.meta]);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in-view"); observer.unobserve(e.target); }
    }), { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    let frame = 0;
    const update = () => { if (!frame) frame = requestAnimationFrame(() => {
      const progress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.3);
      document.documentElement.style.setProperty("--scroll", String(progress)); frame = 0;
    }); };
    window.addEventListener("scroll", update, { passive: true }); update();
    return () => { observer.disconnect(); window.removeEventListener("scroll", update); cancelAnimationFrame(frame); };
  }, []);
  function goMenu(value: string) { setMenuTab(value); document.getElementById("menu")?.scrollIntoView({behavior:"smooth"}); }
  function plan(value: string) { setService(value); document.getElementById("contact")?.scrollIntoView({behavior:"smooth"}); }
  useEffect(() => {
    type Registry = {registerTool: (tool: {name:string; title:string; description:string; inputSchema:object; annotations:object; execute:(input:unknown)=>Promise<object>}, options:{signal:AbortSignal}) => unknown};
    const context = (document as Document & {modelContext?:Registry}).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(context.registerTool({
        name:"start_catering_enquiry", title:"Start a catering enquiry",
        description:"Select a catering service and open the visible enquiry form. Does not send a message, contact Pauline or book catering.",
        inputSchema:{type:"object",properties:{service:{type:"string",enum:["unsure","box","lunch","buffet","other"]}},required:["service"],additionalProperties:false},
        annotations:{readOnlyHint:false,untrustedContentHint:false},
        execute: async (input:unknown) => {
          if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("A service is required.");
          const value = (input as {service?:unknown}).service;
          if (typeof value !== "string" || !["unsure","box","lunch","buffet","other"].includes(value) || Object.keys(input).some(k=>k!=="service")) throw new Error("Unknown service.");
          setService(value);
          await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
          document.getElementById("contact")?.scrollIntoView({behavior:"instant"});
          return {status:"form_open",service:value,messageSent:false};
        }
      },{signal:lifecycle.signal})).catch(()=>{});
    } catch {}
    return ()=>lifecycle.abort();
  }, []);
  function makeMessage() {
    const values = new FormData(formRef.current!);
    const get = (key: string) => String(values.get(key) || "").trim();
    const date = get("date");
    const readableDate = date ? new Date(`${date}T12:00:00`).toLocaleDateString(lang === "nl" ? "nl-NL" : "en-GB", {dateStyle:"long"}) : t.form.unknown;
    return `${t.form.greeting}\n\n${t.form.intro}\n\n${t.form.name}: ${get("name")}\n${t.form.email}: ${get("email")}\n${t.form.country}: ${country === "de" ? t.form.germany : t.form.netherlands}\n${t.form.service}: ${t.serviceOptions.find(s=>s[0] === service)?.[1]}\n${t.form.date}: ${readableDate}\n${t.form.guests}: ${get("guests") || t.form.unknown}\n${t.form.occasion}: ${get("occasion") || t.form.unknown}\n${t.form.city}: ${get("city") || t.form.unknown}\n\n${t.form.wishes}:\n${get("message") || t.form.noWishes}\n\n${t.form.signoff}\n${get("name")}`;
  }
  function openMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const method = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") || "email";
    const message = makeMessage();
    if (method === "whatsapp") window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    else window.location.href = `mailto:${email}?subject=${encodeURIComponent(t.form.subject)}&body=${encodeURIComponent(message)}`;
    setContactFeedback(t.form.draftNotice);
  }
  async function copyMessage() {
    if (!formRef.current?.reportValidity()) return;
    try { await navigator.clipboard.writeText(makeMessage()); setContactFeedback(`${t.form.copied} ${email}`); }
    catch { setContactFeedback(`${t.form.copyFailed} ${email}`); }
  }
  return <>
    <a className="skip-link" href="#offers">{t.skip}</a>
    <header className="site-header"><Brand lang={lang}/>
      <nav className={`desktop-nav ${mobileNav ? "is-open" : ""}`} aria-label={t.navigation}>
        {t.nav.services.map(([id,label])=><a href="#menu" className="nav-service" key={id} onClick={e=>{e.preventDefault();setMobileNav(false);goMenu(id);}}>{label}</a>)}
        <a href="#story" onClick={()=>setMobileNav(false)}>{t.nav.story}</a>
        <a href="#contact" className="nav-contact" onClick={()=>setMobileNav(false)}>{t.nav.contact}</a>
      </nav>
      <div className="header-actions"><div className="language-switch" aria-label="Language / Taal"><button lang="nl" aria-pressed={lang === "nl"} onClick={()=>{setLang("nl");setContactFeedback("");}}>NL</button><span>/</span><button lang="en" aria-pressed={lang === "en"} onClick={()=>{setLang("en");setContactFeedback("");}}>EN</button></div><button className="nav-toggle" aria-label={mobileNav ? t.closeMenu : t.openMenu} aria-expanded={mobileNav} onClick={()=>setMobileNav(!mobileNav)}>{mobileNav ? <X/> : <Menu/>}</button></div>
    </header>
    <main>
      <section className="hero" id="top">
        <div className="hero-art" aria-hidden="true"><div className="fig-whole-motion"><img src="/images/fig-whole.webp" alt="" className="fig-whole" width="989" height="1073" fetchPriority="high"/></div><div className="fig-cut-motion"><img src="/images/fig-cut.webp" alt="" className="fig-cut" width="572" height="677"/></div></div>
        <div className="hero-content"><p className="eyebrow">{t.hero.eyebrow}</p><h1>{t.hero.line1}<br/><em>{t.hero.line2}</em></h1><p className="hero-intro">{t.hero.intro}</p><div className="hero-actions"><a className="button button-cream" href="#offers">{t.hero.cta}<ArrowDown size={18}/></a><a className="button button-hero-contact" href="#contact">{t.hero.secondary}<ArrowUpRight size={18}/></a></div></div>
        <div className="hero-note"><span className="handwriting">{t.hero.note}</span></div><div className="hero-bottom"><span>{t.hero.bottom}</span><a href="#offers" aria-label={t.hero.cta}><ArrowDown size={20}/></a></div>
      </section>
      <section id="offers" className="section offers-section">
        <div className="section-heading reveal"><div><p className="eyebrow red">{t.offers.eyebrow}</p><h2>{t.offers.title1}<br/><em>{t.offers.title2}</em></h2></div></div>
        <div className="offer-grid">{t.offers.cards.map((card,i)=><article className="offer-card reveal" key={card.id}><h3>{card.title}</h3><button className="offer-image" onClick={()=>goMenu(card.id)} aria-label={`${t.offers.details}: ${card.title}`}><img src={`/images/${serviceImages[i]}.webp`} alt={card.alt} loading="lazy" width="800" height="1000"/><span className="image-tag">0{i+1} / {card.tag}</span><span className="image-arrow"><ArrowUpRight size={23}/></span></button><p>{card.description}</p><p className="offer-price">{card.price}</p><button className="text-link" onClick={()=>goMenu(card.id)}>{t.offers.details}<ArrowUpRight size={16}/></button></article>)}</div>
        <div className="offer-footer reveal"><span className="handwriting">{t.offers.personal}</span><p>{t.offers.flexible}</p><a className="button button-red" href="#contact">{t.offers.ask}<ArrowUpRight size={17}/></a></div>
      </section>
      <section id="menu" className="section menu-section">
        <div className="menu-top reveal"><h2>{t.menu.title1} <em>{t.menu.title2}</em></h2><p>{t.menu.intro}</p></div>
        <Tabs value={menuTab} onValueChange={setMenuTab} className="menu-tabs"><TabsList className="menu-tabs-list" aria-label={t.menu.choose}>{t.menu.tabs.map(([id,label],i)=><TabsTrigger className="menu-tab" value={id} key={id}><span className="tab-number" aria-hidden="true">0{i+1}</span><span className="tab-copy"><span>{label}</span><small>{menuTab === id ? t.menu.current : t.menu.view}</small></span><ArrowDown size={18} aria-hidden="true"/></TabsTrigger>)}</TabsList>
          {menus[lang].map(menu=><TabsContent value={menu.id} key={menu.id} className="menu-panel"><div className="menu-caption"><h3>{menu.title}</h3><p className="menu-price">{menu.price}</p><p>{menu.description}</p><div className="menu-practical"><span className="eyebrow">{t.menu.expect}</span><p>{menu.expect}</p></div><button className="button button-red" onClick={()=>plan(menu.id)}>{t.menu.cta}<ArrowUpRight size={17}/></button></div><div className="menu-paper"><div className="menu-paper-heading"><span>Pauline <em>{lang === "nl" ? "kookt" : "cooks"}</em></span><span className="eyebrow">{t.menu.inspiration}</span></div><div className="menu-groups">{menu.groups.map(group=><div className="menu-group" key={group.title}><h4>{group.title}</h4><ul>{group.items.map(item=><li key={item}>{item}</li>)}</ul></div>)}</div></div></TabsContent>)}
        </Tabs>
      </section>
      <section id="story" className="story-section"><div className="story-image"><img src="/images/pauline.webp" alt={t.story.alt} width="825" height="1100" loading="lazy"/><span className="portrait-caption handwriting">{t.story.caption}</span></div><div className="story-copy reveal"><p className="eyebrow">{t.story.eyebrow}</p><h2>{t.story.title1}<br/><em>{t.story.title2}</em></h2><p>{t.story.p1}</p><p>{t.story.p2}</p><p>{t.story.p3}</p></div></section>
      <section className="section process-section"><div className="process-heading reveal"><h2>{t.process.title}</h2></div><div className="process-grid">{t.process.steps.map((step,i)=><div className="process-step reveal" key={step.title}><span className="step-number">0{i+1}</span><h3>{step.title}</h3><p>{step.body}</p></div>)}</div><div className="process-action"><a href="#contact" className="button button-red">{t.process.cta}<ArrowUpRight size={18}/></a></div></section>
      <section id="contact" className="section contact-section">
        <div className="contact-copy"><h2>{t.contact.title1}<br/><em>{t.contact.title2}</em></h2><p>{t.contact.intro}</p><div className="response-promise"><Check size={18}/>{t.contact.response}</div><div className="direct-links"><a href={`mailto:${EMAIL_NL}`}><Mail size={20}/><span>NL · {EMAIL_NL}</span></a><a href={`mailto:${EMAIL_DE}`}><Mail size={20}/><span>DE · {EMAIL_DE}</span></a><a href={`https://wa.me/${PHONE}`} target="_blank" rel="noreferrer"><MessageCircle size={20}/><span>WhatsApp · +31 6 25 54 70 94</span></a></div><div className="contact-practical"><h3>{t.contact.deliveryTitle}</h3><p>{t.contact.delivery}</p></div></div>
        <div className="form-wrap"><h3>{t.form.heading}</h3><p className="form-description">{t.form.description}</p><form ref={formRef} onSubmit={openMessage} onChange={()=>setContactFeedback("")}>
          <div className="form-grid"><label>{t.form.name} *<input name="name" autoComplete="name" required maxLength={100}/></label><label>{t.form.email} *<input name="email" type="email" autoComplete="email" required maxLength={160}/></label></div>
          <label>{t.form.country}<select name="country" value={country} onChange={e=>{setCountry(e.target.value as "nl" | "de");setContactFeedback("");}}><option value="nl">{t.form.netherlands}</option><option value="de">{t.form.germany}</option></select></label>
          <div className="form-field"><label htmlFor="service-select">{t.form.service}</label><Select value={service} onValueChange={v=>{setService(v);setContactFeedback("");}}><SelectTrigger id="service-select" className="service-select"><SelectValue/></SelectTrigger><SelectContent>{t.serviceOptions.map(([id,label])=><SelectItem value={id} key={id}>{label}</SelectItem>)}</SelectContent></Select></div>
          <div className="form-grid"><label>{t.form.dateOptional}<input name="date" type="date" min={today || undefined}/></label><label>{t.form.guestsOptional}<input name="guests" type="number" min="1" step="1" placeholder={t.form.guestsPlaceholder}/></label></div>
          <div className="form-grid"><label>{t.form.occasionOptional}<input name="occasion" placeholder={t.form.occasionPlaceholder} maxLength={120}/></label><label>{t.form.cityOptional}<input name="city" placeholder={t.form.cityPlaceholder} maxLength={140}/></label></div>
          <label>{t.form.wishesOptional}<textarea name="message" rows={3} maxLength={2500} placeholder={t.form.wishesPlaceholder}/></label>
          <div className="form-buttons"><button type="submit" value="email" className="button button-red">{t.form.emailButton}<ArrowUpRight size={17}/></button><button type="submit" value="whatsapp" className="button button-outline">WhatsApp<MessageCircle size={17}/></button></div><p className="form-explanation">{t.form.handoff}</p><div className="form-small-links"><button type="button" onClick={copyMessage}>{t.form.copy}</button><button type="button" onClick={()=>setPrivacy(true)}>{t.form.privacy}</button></div><p className="form-feedback" role="status" aria-live="polite">{contactFeedback}</p>
        </form></div>
      </section>
      <section className="gallery-section" aria-label={t.gallery.label}><div className="gallery-grid">{t.gallery.photos.map(photo=><figure key={photo.src} className="reveal"><img src={photo.src} alt={photo.alt} loading="lazy" width={photo.width} height={photo.height}/></figure>)}</div></section>
    </main>
    <footer className="site-footer"><div className="footer-top"><Brand lang={lang} large/><a href="#top" className="back-top">{t.footer.back}<ArrowUpRight size={18}/></a></div><div className="footer-bottom"><span>© 2026 Pauline {lang === "nl" ? "kookt" : "cooks"} · Arcen</span><button onClick={()=>setPrivacy(true)}>{t.form.privacy}</button></div></footer>
    <Dialog open={privacy} onOpenChange={setPrivacy}><DialogContent className="privacy-dialog" showCloseButton={false}><DialogTitle>{t.form.privacy}</DialogTitle><DialogDescription>{t.privacy.intro}</DialogDescription>{t.privacy.paragraphs.map(p=><p key={p}>{p}</p>)}<a href={`mailto:${EMAIL_NL}`}>{EMAIL_NL}</a><a href={`mailto:${EMAIL_DE}`}>{EMAIL_DE}</a><DialogClose className="button button-red">{t.close}</DialogClose></DialogContent></Dialog>
  </>;
}
