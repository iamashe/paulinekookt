"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUpRight, Check, Mail, Menu, MessageCircle, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { copy, menus, type Lang } from "./content";

export type SitePage = "home" | "catering" | "box" | "lunch" | "buffet" | "weekly" | "story" | "contact";
const EMAIL_NL = "info@paulinekookt.nl";
const EMAIL_DE = "info@paulinekocht.de";
const PHONE = "31625547094";
const serviceImages = ["sharing-table", "salmon-brunch", "roasted-vegetable-platter"];
const serviceRoutes: Record<string,string> = {box:"/catering/grazing-box",lunch:"/catering/lunch-brunch",buffet:"/catering/buffet"};
const serviceIds = ["unsure","box","lunch","buffet","weekly","other"];
function contactHref(service = "unsure") { return `/contact?service=${encodeURIComponent(service)}`; }
function Brand({ lang, large = false }: { lang: Lang; large?: boolean }) {
  const verb = lang === "nl" ? "kookt" : "cooks";
  return <a href="/" className={`brand ${large ? "brand-large" : ""}`} aria-label={`Pauline ${verb} — home`}><span>Pauline <em>{verb}</em></span><small>CATERING</small></a>;
}
export default function Site({page = "home"}:{page?:SitePage}) {
  const [lang, setLang] = useState<Lang>("nl");
  const [languageReady, setLanguageReady] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [service, setService] = useState("unsure");
  const [email, setEmail] = useState(EMAIL_NL);
  const [contactFeedback, setContactFeedback] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const t = copy[lang];
  const menu = menus[lang].find(item=>item.id===page);
  const cardIndex = t.offers.cards.findIndex(item=>item.id===page);
  const card = t.offers.cards[cardIndex];
  const cateringPage = ["catering","box","lunch","buffet"].includes(page);
  const pageName = page === "home" ? "" : card?.title || ({catering:t.nav.catering,weekly:t.nav.weekly,story:t.nav.story,contact:t.nav.contact} as Record<string,string>)[page];
  useEffect(() => {
    try { const saved = localStorage.getItem("pauline-language"); if (saved === "en" || saved === "nl") setLang(saved); } catch {}
    setLanguageReady(true);
    const params = new URLSearchParams(window.location.search);
    const requestedService = params.get("service");
    if (requestedService && serviceIds.includes(requestedService)) setService(requestedService);
    if (window.location.hostname === "paulinekocht.de" || window.location.hostname.endsWith(".paulinekocht.de")) setEmail(EMAIL_DE);
    // Preserve old shared section links after the move to dedicated pages.
    if (page === "home") {
      const legacy:Record<string,string> = {"#contact":"/contact","#story":"/over-pauline","#weekly-meals":"/maaltijden-op-maat","#menu":"/catering"};
      const target = legacy[window.location.hash];
      if (target) window.location.replace(target);
    }
  }, [page]);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = pageName ? `${pageName} | Pauline ${lang === "nl" ? "kookt" : "cooks"}` : t.pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", menu?.description || (page === "weekly" ? t.weekly.intro : t.meta));
    if (languageReady) { try { localStorage.setItem("pauline-language", lang); } catch {} }
  }, [lang, languageReady, pageName, t, menu, page]);
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
  }, [page]);
  useEffect(() => {
    if (!mobileNav) return;
    const close = (event:KeyboardEvent) => { if (event.key === "Escape") setMobileNav(false); };
    window.addEventListener("keydown",close);
    return ()=>window.removeEventListener("keydown",close);
  }, [mobileNav]);
  useEffect(() => {
    type Registry = {registerTool: (tool: {name:string; title:string; description:string; inputSchema:object; annotations:object; execute:(input:unknown)=>Promise<object>}, options:{signal:AbortSignal}) => unknown};
    const context = (document as Document & {modelContext?:Registry}).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(context.registerTool({
        name:"start_catering_enquiry", title:"Start an enquiry",
        description:"Select a service and open the enquiry form. Does not send a message or make a booking.",
        inputSchema:{type:"object",properties:{service:{type:"string",enum:serviceIds}},required:["service"],additionalProperties:false},
        annotations:{readOnlyHint:false,untrustedContentHint:false},
        execute: async (input:unknown) => {
          if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("A service is required.");
          const value = (input as {service?:unknown}).service;
          if (typeof value !== "string" || !serviceIds.includes(value) || Object.keys(input).some(k=>k!=="service")) throw new Error("Unknown service.");
          if (page !== "contact") { window.location.assign(contactHref(value)); return {status:"opening_form",service:value,messageSent:false}; }
          setService(value);
          document.getElementById("contact")?.scrollIntoView({behavior:"instant"});
          return {status:"form_open",service:value,messageSent:false};
        }
      },{signal:lifecycle.signal})).catch(()=>{});
    } catch {}
    return ()=>lifecycle.abort();
  }, [page]);
  function makeMessage() {
    const values = new FormData(formRef.current!);
    const get = (key:string)=>String(values.get(key)||"").trim();
    return `${t.form.greeting}\n\n${t.form.intro}\n\n${t.form.name}: ${get("name")}\n${t.form.email}: ${get("email")}\n${t.form.service}: ${t.serviceOptions.find(s=>s[0]===service)?.[1]}\n\n${t.form.wishes}:\n${get("message")}\n\n${t.form.signoff}\n${get("name")}`;
  }
  function openMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = new FormData(e.currentTarget);
    if (!["name","email","message"].every(key=>String(values.get(key)||"").trim())) {
      setContactFeedback(lang === "nl" ? "Vul je naam, e-mailadres en een kort bericht in." : "Please enter your name, email and a short message.");
      return;
    }
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
  function Offers() {
    return <section id="offers" className="section offers-section">
      {page === "home" && <div className="section-heading reveal"><div><p className="eyebrow red">{t.offers.eyebrow}</p><h2>{t.offers.title1}<br/><em>{t.offers.title2}</em></h2></div></div>}
      <div className="offer-grid">{t.offers.cards.map((offer,i)=><article className="offer-card reveal" key={offer.id}>
        <h3><a href={serviceRoutes[offer.id]}>{offer.title}</a></h3>
        <a className="offer-image" href={serviceRoutes[offer.id]} aria-label={`${t.offers.details}: ${offer.title}`}><img src={`/images/${serviceImages[i]}.webp`} alt={offer.alt} loading="lazy" width="800" height="1000"/><span className="image-tag">0{i+1} / {offer.tag}</span><span className="image-arrow"><ArrowUpRight size={23}/></span></a>
        <p>{offer.description}</p><p className="offer-price">{offer.price}</p><a className="text-link" href={serviceRoutes[offer.id]}>{t.offers.details}<ArrowUpRight size={16}/></a>
      </article>)}</div>
      {page === "catering" && <div className="offer-footer reveal"><span className="handwriting">{t.offers.personal}</span><p>{t.offers.flexible}</p><a className="button button-red" href="/contact">{t.offers.ask}<ArrowUpRight size={17}/></a></div>}
    </section>;
  }
  function ContactCta({value="unsure"}:{value?:string}) {
    return <section className="section contact-cta"><div><h2>{t.contact.title1}<br/><em>{t.contact.title2}</em></h2><p>{t.pages.contactShort}</p></div><a className="button button-red" href={contactHref(value)}>{t.pages.contactCta}<ArrowUpRight size={18}/></a></section>;
  }
  return <>
    <a className="skip-link" href="#main">{t.pages.homeSkip}</a>
    <header className={`site-header ${page !== "home" ? "inner-header" : ""}`}><Brand lang={lang}/>
      <nav id="main-navigation" className={`desktop-nav ${mobileNav ? "is-open" : ""}`} aria-label={t.navigation}>
        <a href="/catering" aria-current={cateringPage ? "page" : undefined}>{t.nav.catering}</a>
        <a href="/maaltijden-op-maat" aria-current={page === "weekly" ? "page" : undefined}>{t.nav.weekly}</a>
        <a href="/over-pauline" aria-current={page === "story" ? "page" : undefined}>{t.nav.story}</a>
        <a href="/contact" className="nav-contact" aria-current={page === "contact" ? "page" : undefined}>{t.nav.contact}</a>
      </nav>
      <div className="header-actions"><div className="language-switch" aria-label="Language / Taal"><button lang="nl" aria-pressed={lang === "nl"} onClick={()=>{setLang("nl");setContactFeedback("");}}>NL</button><span>/</span><button lang="en" aria-pressed={lang === "en"} onClick={()=>{setLang("en");setContactFeedback("");}}>EN</button></div><button className="nav-toggle" aria-controls="main-navigation" aria-label={mobileNav ? t.closeMenu : t.openMenu} aria-expanded={mobileNav} onClick={()=>setMobileNav(!mobileNav)}>{mobileNav ? <X/> : <Menu/>}</button></div>
    </header>
    <main id="main" className={`page-${page}`}>
      {page === "home" && <>
      <section className="hero" id="top">
        <div className="hero-art" aria-hidden="true"><div className="fig-whole-motion"><img src="/images/fig-whole.webp" alt="" className="fig-whole" width="989" height="1073" fetchPriority="high"/></div><div className="fig-cut-motion"><img src="/images/fig-cut.webp" alt="" className="fig-cut" width="572" height="677"/></div></div>
        <div className="hero-content"><p className="eyebrow">{t.hero.eyebrow}</p><h1>{t.hero.line1}<br/><em>{t.hero.line2}</em></h1><p className="hero-intro">{t.hero.intro}</p><div className="hero-actions"><a className="button button-cream" href="#offers">{t.hero.cta}<ArrowDown size={18}/></a><a className="button button-hero-contact" href="/contact">{t.hero.secondary}<ArrowUpRight size={18}/></a></div></div>
        <div className="hero-note"><span className="handwriting">{t.hero.note}</span></div><div className="hero-bottom"><span>{t.hero.bottom}</span><a href="#offers" aria-label={t.hero.cta}><ArrowDown size={20}/></a></div>
      </section>

        <Offers/>
        <section className="section weekly-teaser"><img src="/images/roast-vegetables.webp" alt={t.weekly.alt} loading="lazy" width="1125" height="1500"/><div><p className="eyebrow red">{t.weekly.eyebrow}</p><h2>{t.weekly.title1}<br/><em>{t.weekly.title2}</em></h2><p>{t.pages.weeklyIntroShort}</p><a className="text-link" href="/maaltijden-op-maat">{t.pages.weeklyMore}<ArrowUpRight size={18}/></a></div></section>
      </>}
      {page === "catering" && <><section className="section page-intro"><p className="eyebrow red">{t.offers.eyebrow}</p><h1>{t.offers.title1}<br/><em>{t.offers.title2}</em></h1></section><Offers/></>}
      {menu && card && <>
        <section className="section service-hero">
          <div className="service-hero-copy"><a className="text-link breadcrumb" href="/catering">← {t.pages.overview}</a><p className="eyebrow red">{card.tag}</p><h1>{card.title}</h1><p>{menu.description}</p><p className="service-price">{menu.price}</p><div className="service-actions"><a className="button button-red" href={contactHref(menu.id)}>{t.menu.cta}<ArrowUpRight size={18}/></a><a className="text-link" href="#food-menu">{t.pages.menuLink}<ArrowDown size={17}/></a></div></div>
          <img className="service-hero-image" src={`/images/${serviceImages[cardIndex]}.webp`} alt={card.alt} width="1125" height="1500"/>
        </section>
        <section id="food-menu" className="section detail-menu"><div className="detail-menu-heading"><p className="eyebrow red">{t.menu.inspiration}</p><h2>{t.pages.menuHeading}</h2><p>{t.pages.menuIntro}</p></div>
          <div className="menu-paper"><div className="menu-paper-heading"><span>Pauline <em>{lang === "nl" ? "kookt" : "cooks"}</em></span><span className="eyebrow">{card.title}</span></div><div className="menu-groups">{menu.groups.map(group=><div className="menu-group" key={group.title}><h3>{group.title}</h3><ul>{group.items.map(item=><li key={item}>{item}</li>)}</ul></div>)}</div></div>
          <aside className="detail-practical"><h3>{t.menu.expect}</h3><p>{menu.expect}</p><p>{t.pages.delivery}</p><p className="flexibility-note">{t.offers.flexible}</p></aside>
        </section>
        <ContactCta value={menu.id}/>
      </>}
      {page === "weekly" && <>
        <section className="section weekly-section weekly-full"><div className="weekly-image"><img src="/images/roast-vegetables.webp" alt={t.weekly.alt} width="1125" height="1500"/></div><div className="weekly-copy"><p className="eyebrow red">{t.weekly.eyebrow}</p><h1>{t.weekly.title1}<br/><em>{t.weekly.title2}</em></h1><p>{t.weekly.intro}</p><p>{t.weekly.detail}</p><p className="weekly-price">{t.weekly.price}</p><a className="button button-red" href={contactHref("weekly")}>{t.weekly.cta}<ArrowUpRight size={18}/></a></div></section>
        <section className="section process-section"><div className="process-heading"><h2>{t.process.title}</h2></div><div className="process-grid">{t.pages.weeklySteps.map((step,i)=><div className="process-step" key={step.title}><span className="step-number">0{i+1}</span><h3>{step.title}</h3><p>{step.body}</p></div>)}</div><p className="weekly-note">{t.pages.weeklyNote}</p></section><ContactCta value="weekly"/>
      </>}
      {(page === "home" || page === "story") && <>
      <section id="story" className="story-section"><div className="story-image"><img src="/images/pauline.webp" alt={t.story.alt} width="825" height="1100" loading="lazy"/><span className="portrait-caption handwriting">{t.story.caption}</span></div><div className="story-copy reveal"><p className="eyebrow">{t.story.eyebrow}</p>{page === "story" ? <h1>{t.story.title1}<br/><em>{t.story.title2}</em></h1> : <h2>{t.story.title1}<br/><em>{t.story.title2}</em></h2>}{page === "story" ? <><p>{t.story.p1}</p><p>{t.story.p2}</p><p>{t.story.p3}</p></> : <><p>{t.pages.storyShort}</p><a className="text-link light story-more" href="/over-pauline">{t.pages.storyMore}<ArrowUpRight size={18}/></a></>}</div></section>

        <ContactCta/>
      </>}
      {page === "catering" && <ContactCta/>}
      {page === "contact" && <section id="contact" className="section contact-section">
        <div className="contact-copy"><h1>{t.contact.title1}<br/><em>{t.contact.title2}</em></h1><p>{t.contact.intro}</p><div className="response-promise"><Check size={18}/>{t.contact.response}</div><div className="direct-links"><a href={`mailto:${EMAIL_NL}`}><Mail size={20}/><span>NL · {EMAIL_NL}</span></a><a href={`mailto:${EMAIL_DE}`}><Mail size={20}/><span>DE · {EMAIL_DE}</span></a><a href={`https://wa.me/${PHONE}`} target="_blank" rel="noreferrer"><MessageCircle size={20}/><span>WhatsApp · +31 6 25 54 70 94</span></a></div><div className="contact-practical"><h2>{t.contact.deliveryTitle}</h2><p>{t.contact.delivery}</p></div></div>
        <div className="form-wrap"><h2>{t.form.heading}</h2><p className="form-description">{t.form.description}</p><form ref={formRef} onSubmit={openMessage} onChange={()=>setContactFeedback("")}>
          <label>{t.form.name}<input name="name" autoComplete="name" required maxLength={100}/></label>
          <label>{t.form.email}<input name="email" type="email" autoComplete="email" required maxLength={160}/></label>
          <label>{t.form.service}<select name="service" value={service} required onChange={e=>{setService(e.target.value);setContactFeedback("");}}>{t.serviceOptions.map(([id,label])=><option value={id} key={id}>{label}</option>)}</select></label>
          <label>{t.form.wishes}<textarea name="message" rows={4} required maxLength={2500} placeholder={service === "weekly" ? t.form.weeklyPlaceholder : t.form.wishesPlaceholder}/></label>
          <div className="form-buttons"><button type="submit" value="email" className="button button-red">{t.form.emailButton}<ArrowUpRight size={17}/></button><button type="submit" value="whatsapp" className="button button-outline">WhatsApp<MessageCircle size={17}/></button></div><p className="form-explanation">{t.form.handoff}</p><div className="form-small-links"><button type="button" onClick={copyMessage}>{t.form.copy}</button><button type="button" onClick={()=>setPrivacy(true)}>{t.form.privacy}</button></div><p className="form-feedback" role="status" aria-live="polite">{contactFeedback}</p>
        </form></div>
      </section>}
      {page === "home" && <>
      <section className="gallery-section" aria-label={t.gallery.label}><div className="gallery-grid">{t.gallery.photos.map(photo=><figure key={photo.src} className="reveal"><img src={photo.src} alt={photo.alt} loading="lazy" width={photo.width} height={photo.height}/></figure>)}</div></section>

      </>}
    </main>
    <footer className="site-footer"><div className="footer-top"><Brand lang={lang} large/><a href="#main" className="back-top">{t.footer.back}<ArrowUpRight size={18}/></a></div><nav className="footer-nav" aria-label={lang === "nl" ? "Voetnavigatie" : "Footer navigation"}><a href="/catering">{t.nav.catering}</a><a href="/maaltijden-op-maat">{t.nav.weekly}</a><a href="/over-pauline">{t.nav.story}</a><a href="/contact">{t.nav.contact}</a></nav><div className="footer-bottom"><span>© 2026 Pauline {lang === "nl" ? "kookt" : "cooks"} · Arcen</span><button onClick={()=>setPrivacy(true)}>{t.form.privacy}</button></div></footer>
    <Dialog open={privacy} onOpenChange={setPrivacy}><DialogContent className="privacy-dialog" showCloseButton={false}><DialogTitle>{t.form.privacy}</DialogTitle><DialogDescription>{t.privacy.intro}</DialogDescription>{t.privacy.paragraphs.map(p=><p key={p}>{p}</p>)}<a href={`mailto:${EMAIL_NL}`}>{EMAIL_NL}</a><a href={`mailto:${EMAIL_DE}`}>{EMAIL_DE}</a><DialogClose className="button button-red">{t.close}</DialogClose></DialogContent></Dialog>
  </>;
}
