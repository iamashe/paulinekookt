/* Export the current React presentation as portable NL/EN HTML pages. */
const fs = require('fs');
const path = require('path');
const Module = require('module');
const root = path.resolve(__dirname,'..');
const output = path.resolve(process.argv[2] || path.join(root,'static-export'));
const projectRequire = Module.createRequire(path.join(root,'package.json'));
const ts = projectRequire('typescript');
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request,parent,...rest) {
  return resolve.call(this,request.startsWith('@/') ? path.join(root,request.slice(2)) : request,parent,...rest);
};
let renderLanguage = 'nl';
for (const ext of ['.tsx','.ts']) require.extensions[ext] = (mod,file) => {
  let source = fs.readFileSync(file,'utf8');
  if (file === path.join(root,'app/site.tsx')) source=source.replace('useState<Lang>("nl")',`useState<Lang>("${renderLanguage}")`);
  const result=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}});
  mod._compile(result.outputText,file);
};
const React = projectRequire('react');
const {renderToStaticMarkup} = projectRequire('react-dom/server');
const {copy} = projectRequire('./app/content.ts');
const routes = {home:['/','index'],catering:['/catering','catering'],box:['/catering/grazing-box','grazing-box'],lunch:['/catering/lunch-brunch','lunch-brunch'],buffet:['/catering/buffet','buffet'],weekly:['/maaltijden-op-maat','maaltijden-op-maat'],story:['/over-pauline','over-pauline'],contact:['/contact','contact']};
const filename=(page,lang)=>routes[page][1]+(lang==='en'?'-en':'')+'.html';
fs.mkdirSync(output,{recursive:true});
for (const asset of ['images','fonts','favicon.svg']) fs.cpSync(path.join(root,'public',asset),path.join(output,asset),{recursive:true});
const cssDir=path.join(root,'dist/client/_next/static/css');
const css=fs.readdirSync(cssDir).filter(n=>n.endsWith('.css')).map(n=>fs.readFileSync(path.join(cssDir,n),'utf8')).join('\n').replaceAll('/fonts/','./fonts/');
fs.writeFileSync(path.join(output,'styles.css'),css+'\n.static-privacy{max-width:560px;width:calc(100% - 40px);border:1px solid #d8c7b8;padding:30px;background:#fffdf8;color:#31271f}.static-privacy::backdrop{background:#241a16aa}.static-privacy h2{font-size:2.5rem;margin-bottom:20px}.static-privacy p{margin-bottom:16px}.static-privacy .button{margin-top:20px}.nav-toggle{font-size:26px;line-height:1}\n');
for (const lang of ['nl','en']) {
  renderLanguage=lang;
  delete require.cache[projectRequire.resolve('./app/site.tsx')];
  const Site=projectRequire('./app/site.tsx').default;
  const t=copy[lang];
  for (const page of Object.keys(routes)) {
    let html=renderToStaticMarkup(React.createElement(Site,{page}));
    html=html.replace(/<link\b[^>]*rel="preload"[^>]*\/>/g,'');
    html=html.replace(/href="(\/[^\"]*)"/g,(all,url)=>{
      const split=url.search(/[?#]/); const base=split===-1?url:url.slice(0,split); const suffix=split===-1?'':url.slice(split);
      const target=Object.keys(routes).find(key=>routes[key][0]===base);
      return target ? `href="${filename(target,lang)}${suffix}"` : all;
    }).replaceAll('src="/images/','src="./images/');
    html=html.replace(/<button lang="(nl|en)"[^>]*>(NL|EN)<\/button>/g,(_,to,label)=>`<a href="${filename(page,to)}" lang="${to}" class="static-language" ${lang===to?'aria-current="true"':''}>${label}</a>`);
    html=html.replace(/<button([^>]*)>Privacy<\/button>/g,'<button$1 data-privacy>Privacy</button>');
    const escapedCopy=t.form.copy.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    html=html.replace(new RegExp('<button([^>]*)>'+escapedCopy+'<\\/button>','g'),'<button$1 data-copy>'+t.form.copy+'</button>');
    const card=t.offers.cards.find(c=>c.id===page);
    const name=card?.title||({catering:t.nav.catering,weekly:t.nav.weekly,story:t.nav.story,contact:t.nav.contact})[page];
    const title=name?`${name} | Pauline ${lang==='nl'?'kookt':'cooks'}`:t.pageTitle;
    const settings={lang,page,form:t.form,serviceOptions:t.serviceOptions,privacy:t.privacy,close:t.close,openMenu:t.openMenu,closeMenu:t.closeMenu};
    const safeSettings=JSON.stringify(settings).replaceAll('<','\\u003c');
    const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
    const doc=`<!doctype html>\n<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${escape(t.meta)}"><title>${escape(title)}</title><link rel="icon" href="./favicon.svg"><link rel="stylesheet" href="./styles.css"><style>.language-switch a{padding:8px 3px;opacity:.68}.language-switch a[aria-current=true]{opacity:1;text-decoration:underline;text-underline-offset:5px}</style></head><body>${html}<script>window.PAULINE=${safeSettings};</script><script src="./site.js" defer></script></body></html>`;
    fs.writeFileSync(path.join(output,filename(page,lang)),doc);
  }
}
fs.copyFileSync(path.join(root,'scripts/static-site.js'),path.join(output,'site.js'));
console.log('Exported 16 portable HTML pages with local images, fonts, animation and working contact drafts.');
