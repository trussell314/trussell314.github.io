(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const t of s)if(t.type==="childList")for(const l of t.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&o(l)}).observe(document,{childList:!0,subtree:!0});function r(s){const t={};return s.integrity&&(t.integrity=s.integrity),s.referrerPolicy&&(t.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?t.credentials="include":s.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function o(s){if(s.ep)return;s.ep=!0;const t=r(s);fetch(s.href,t)}})();const h=document.querySelector("#app");if(!h)throw new Error("Unable to find the #app container");h.innerHTML=`
  <main
    style="
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      padding: clamp(2rem, 5vw, 4rem);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 760px;
      margin: 0 auto;
      color: #0f172a;
    "
  >
    <header style="text-align: center; display: flex; flex-direction: column; gap: 0.5rem;">
      <h1 style="margin: 0; font-size: clamp(2rem, 5vw, 3rem);">Bowling What-If</h1>
      <p style="margin: 0; color: #475569; font-size: 1.1rem;">
        Calculate frame-by-frame bowling scores for every game you enter.
      </p>
    </header>

    <form id="bowling-form" style="display: flex; flex-direction: column; gap: 0.75rem;">
      <label for="bowling-scores" style="font-weight: 600; font-size: 1.05rem;">
        Enter frame-by-frame bowling scores. Use one line per game.
      </label>
      <textarea
        id="bowling-scores"
        name="bowling-scores"
        rows="10"
        placeholder="Example:
9/ X 81 7/ X X 9- 90 X XX7"
        style="
          font: inherit;
          padding: 1rem;
          border: 1px solid #cbd5f0;
          border-radius: 0.75rem;
          resize: vertical;
          min-height: 12rem;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
          line-height: 1.5;
        "
        aria-describedby="bowling-instructions"
      ></textarea>
      <div id="bowling-instructions" style="font-size: 0.95rem; color: #475569; display: flex; flex-direction: column; gap: 0.35rem;">
        <p style="margin: 0;">Use spaces or commas to separate frames. Valid characters: <code style="background: #e2e8f0; padding: 0.1rem 0.35rem; border-radius: 0.35rem;">0-9 / - X</code></p>
        <p style="margin: 0;">Example: <code style="background: #e2e8f0; padding: 0.1rem 0.35rem; border-radius: 0.35rem;">9/ X 81 7/ X X 9- 90 X XX7</code></p>
      </div>
      <button
        type="submit"
        style="
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 0.75rem;
          padding: 0.85rem 1.5rem;
          font: inherit;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
          box-shadow: 0 8px 16px rgba(37, 99, 235, 0.25);
        "
        onmouseover="this.style.background='#1d4ed8'"
        onmouseout="this.style.background='#2563eb'"
      >
        Tell My Fortune
      </button>
    </form>

    <section
      id="form-errors"
      role="alert"
      style="display: none; border-radius: 0.75rem; padding: 1rem; background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca;"
    ></section>

    <section
      id="results"
      style="display: none; border-radius: 0.75rem; padding: 1.25rem; background: #f8fafc; border: 1px solid #cbd5f0;"
    ></section>
  </main>
`;const y=document.querySelector("#bowling-form"),b=document.querySelector("#bowling-scores"),c=document.querySelector("#form-errors"),m=document.querySelector("#results");if(!y||!b||!c||!m)throw new Error("Unable to initialize the bowling score form.");const w=new Set(["X","/","-","0","1","2","3","4","5","6","7","8","9"]);function x(e){const n=[];let r=0;for(;r<e.length;){const o=e[r];if(o===" "||o==="	"||o===","){r+=1;continue}const s=r;for(;r<e.length;){const t=e[r];if(t===" "||t==="	"||t===",")break;r+=1}n.push({value:e.slice(s,r),startColumn:s+1})}return n}function g(e){return e==="-"?0:Number.parseInt(e,10)}function v(e){for(let n=0;n<e.value.length;n+=1){const r=e.value[n];if(!w.has(r))return{message:`Invalid character "${r}".`,column:e.startColumn+n}}}function C(e){if(e.value==="X")return{rolls:[10]};const n=v(e);if(n)return n;if(e.value.length!==2)return{message:'Frames 1 through 9 must use two characters unless they are a strike ("X").',column:e.startColumn};const r=e.value[0],o=e.value[1];if(r==="X"||r==="/")return{message:`Unexpected character "${r}" at the start of the frame.`,column:e.startColumn};if(o==="X")return{message:'Only strikes can use "X" and they must occupy the entire frame.',column:e.startColumn+1};const s=g(r);if(Number.isNaN(s))return{message:`Invalid roll value "${r}".`,column:e.startColumn};if(o==="/")return{rolls:[s,10-s]};const t=g(o);return Number.isNaN(t)?{message:`Invalid roll value "${o}".`,column:e.startColumn+1}:s+t>9?{message:"Open frames cannot knock down more than 9 pins without recording a spare.",column:e.startColumn}:{rolls:[s,t]}}function X(e){const n=v(e);if(n)return n;if(e.value.length<2||e.value.length>3)return{message:"Frame 10 must contain two or three rolls.",column:e.startColumn};const r=e.value.split(""),o=r[0],s=(a,i,d)=>{if(a==="X")return 10;if(a==="/")return i===void 0||i===10?{message:"A spare requires a preceding roll with fewer than 10 pins.",column:e.startColumn+d}:10-i;const f=g(a);return Number.isNaN(f)?{message:`Invalid roll value "${a}".`,column:e.startColumn+d}:f};if(o==="X"){if(e.value.length!==3)return{message:"A strike in the tenth frame requires two additional rolls.",column:e.startColumn};const a=r[1];if(a==="/")return{message:"A spare cannot immediately follow a strike in the tenth frame.",column:e.startColumn+1};const i=s(a,void 0,1);if(typeof i!="number")return i;const d=r[2],f=s(d,i,2);return typeof f!="number"?f:{rolls:[10,i,f]}}if(o==="/"||o==="X")return{message:`Unexpected character "${o}" at the start of the tenth frame.`,column:e.startColumn};const t=g(o);if(Number.isNaN(t))return{message:`Invalid roll value "${o}".`,column:e.startColumn};const l=r[1];if(l==="/"){if(e.value.length!==3)return{message:"A spare in the tenth frame requires a bonus roll.",column:e.startColumn+1};const a=r[2];if(a==="/")return{message:"Only one spare can be recorded in the tenth frame.",column:e.startColumn+2};const i=s(a,void 0,2);return typeof i!="number"?i:{rolls:[t,10-t,i]}}if(l==="X")return{message:'Only strikes consisting of a single "X" are allowed before the tenth frame bonus rolls.',column:e.startColumn+1};const u=g(l);return Number.isNaN(u)?{message:`Invalid roll value "${l}".`,column:e.startColumn+1}:t+u>9?{message:"Open frames in the tenth cannot exceed a total of 9 pins.",column:e.startColumn}:e.value.length===3?{message:"Open frames in the tenth frame only use two rolls.",column:e.startColumn+2}:{rolls:[t,u]}}function N(e){var o,s;const n=x(e);if(n.length===0)return{message:"Each game must include 10 frames.",column:1};if(n.length!==10){const t=n.length>10?((o=n[10])==null?void 0:o.startColumn)??n[n.length-1].startColumn:((s=n[0])==null?void 0:s.startColumn)??1;return{message:`Expected 10 frames but found ${n.length}.`,column:t}}const r=[];for(let t=0;t<n.length;t+=1){const l=n[t],u=t<9?C(l):X(l);if("message"in u)return u;r.push(...u.rolls)}return{rolls:r}}function L(e){let n=0,r=0;for(let s=0;s<9;s+=1){const t=e[r];if(t===10){n+=10+(e[r+1]??0)+(e[r+2]??0),r+=1;continue}const l=e[r+1];if(t+l===10){n+=10+(e[r+2]??0),r+=2;continue}n+=t+l,r+=2}const o=e.slice(r);return n+o.reduce((s,t)=>s+t,0)}function p(e){if(m.style.display="none",m.innerHTML="",e.length===0){c.style.display="none",c.innerHTML="";return}c.style.display="block",c.innerHTML=`
    <strong>We found some issues:</strong>
    <ul style="margin: 0.5rem 0 0 1.25rem; padding: 0; display: flex; flex-direction: column; gap: 0.35rem;">
      ${e.map(n=>`<li>${n}</li>`).join("")}
    </ul>
  `}function $(e){if(c.style.display="none",c.innerHTML="",e.length===0){m.style.display="none",m.innerHTML="";return}m.style.display="block",m.innerHTML=`
    <h2 style="margin-top: 0; font-size: 1.35rem;">Bowling Scores</h2>
    <ol style="margin: 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem;">
      ${e.map(({lineNumber:n,score:r})=>`<li><strong>Line ${n}:</strong> ${r} points</li>`).join("")}
    </ol>
  `}y.addEventListener("submit",e=>{e.preventDefault();const n=b.value.split(/\r?\n/),r=[],o=[];let s=!1;if(n.forEach((t,l)=>{const u=l+1;if(t.trim().length===0)return;s=!0;const i=N(t);if("message"in i){o.push(`Line ${u}, column ${i.column}: ${i.message}`);return}const d=L(i.rolls);r.push({lineNumber:u,score:d})}),!s){p(["Please enter at least one game."]);return}if(o.length>0){p(o);return}$(r)});
