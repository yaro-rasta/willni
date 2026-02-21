var Pe=Object.defineProperty;var Me=(r,e,t)=>e in r?Pe(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var g=(r,e,t)=>Me(r,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function t(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(i){if(i.ep)return;i.ep=!0;const n=t(i);fetch(i.href,n)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const D=globalThis,ee=D.ShadowRoot&&(D.ShadyCSS===void 0||D.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,te=Symbol(),ne=new WeakMap;let $e=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==te)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(ee&&e===void 0){const s=t!==void 0&&t.length===1;s&&(e=ne.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&ne.set(t,e))}return e}toString(){return this.cssText}};const ke=r=>new $e(typeof r=="string"?r:r+"",void 0,te),I=(r,...e)=>{const t=r.length===1?r[0]:e.reduce((s,i,n)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[n+1],r[0]);return new $e(t,r,te)},Te=(r,e)=>{if(ee)r.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const s=document.createElement("style"),i=D.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=t.cssText,r.appendChild(s)}},oe=ee?r=>r:r=>r instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return ke(t)})(r):r;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Re,defineProperty:Oe,getOwnPropertyDescriptor:Ne,getOwnPropertyNames:He,getOwnPropertySymbols:Ue,getPrototypeOf:Ie}=Object,b=globalThis,ae=b.trustedTypes,ze=ae?ae.emptyScript:"",B=b.reactiveElementPolyfillSupport,R=(r,e)=>r,G={toAttribute(r,e){switch(e){case Boolean:r=r?ze:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,e){let t=r;switch(e){case Boolean:t=r!==null;break;case Number:t=r===null?null:Number(r);break;case Object:case Array:try{t=JSON.parse(r)}catch{t=null}}return t}},_e=(r,e)=>!Re(r,e),le={attribute:!0,type:String,converter:G,reflect:!1,useDefault:!1,hasChanged:_e};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),b.litPropertyMetadata??(b.litPropertyMetadata=new WeakMap);let P=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=le){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(e,s,t);i!==void 0&&Oe(this.prototype,e,i)}}static getPropertyDescriptor(e,t,s){const{get:i,set:n}=Ne(this.prototype,e)??{get(){return this[t]},set(o){this[t]=o}};return{get:i,set(o){const l=i==null?void 0:i.call(this);n==null||n.call(this,o),this.requestUpdate(e,l,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??le}static _$Ei(){if(this.hasOwnProperty(R("elementProperties")))return;const e=Ie(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(R("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(R("properties"))){const t=this.properties,s=[...He(t),...Ue(t)];for(const i of s)this.createProperty(i,t[i])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[s,i]of t)this.elementProperties.set(s,i)}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);i!==void 0&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const i of s)t.unshift(oe(i))}else e!==void 0&&t.push(oe(e));return t}static _$Eu(e,t){const s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var e;this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),(e=this.constructor.l)==null||e.forEach(t=>t(this))}addController(e){var t;(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&((t=e.hostConnected)==null||t.call(e))}removeController(e){var t;(t=this._$EO)==null||t.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Te(e,this.constructor.elementStyles),e}connectedCallback(){var e;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$EO)==null||e.forEach(t=>{var s;return(s=t.hostConnected)==null?void 0:s.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$EO)==null||e.forEach(t=>{var s;return(s=t.hostDisconnected)==null?void 0:s.call(t)})}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){var n;const s=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,s);if(i!==void 0&&s.reflect===!0){const o=(((n=s.converter)==null?void 0:n.toAttribute)!==void 0?s.converter:G).toAttribute(t,s.type);this._$Em=e,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(e,t){var n,o;const s=this.constructor,i=s._$Eh.get(e);if(i!==void 0&&this._$Em!==i){const l=s.getPropertyOptions(i),a=typeof l.converter=="function"?{fromAttribute:l.converter}:((n=l.converter)==null?void 0:n.fromAttribute)!==void 0?l.converter:G;this._$Em=i;const h=a.fromAttribute(t,l.type);this[i]=h??((o=this._$Ej)==null?void 0:o.get(i))??h,this._$Em=null}}requestUpdate(e,t,s,i=!1,n){var o;if(e!==void 0){const l=this.constructor;if(i===!1&&(n=this[e]),s??(s=l.getPropertyOptions(e)),!((s.hasChanged??_e)(n,t)||s.useDefault&&s.reflect&&n===((o=this._$Ej)==null?void 0:o.get(e))&&!this.hasAttribute(l._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:i,wrapped:n},o){s&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,o??t??this[e]),n!==!0||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),i===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var s;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[n,o]of this._$Ep)this[n]=o;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[n,o]of i){const{wrapped:l}=o,a=this[n];l!==!0||this._$AL.has(n)||a===void 0||this.C(n,void 0,o,a)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),(s=this._$EO)==null||s.forEach(i=>{var n;return(n=i.hostUpdate)==null?void 0:n.call(i)}),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){var t;(t=this._$EO)==null||t.forEach(s=>{var i;return(i=s.hostUpdated)==null?void 0:i.call(s)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};P.elementStyles=[],P.shadowRootOptions={mode:"open"},P[R("elementProperties")]=new Map,P[R("finalized")]=new Map,B==null||B({ReactiveElement:P}),(b.reactiveElementVersions??(b.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const O=globalThis,he=r=>r,j=O.trustedTypes,de=j?j.createPolicy("lit-html",{createHTML:r=>r}):void 0,ye="$lit$",y=`lit$${Math.random().toFixed(9).slice(2)}$`,be="?"+y,Le=`<${be}>`,w=document,N=()=>w.createComment(""),H=r=>r===null||typeof r!="object"&&typeof r!="function",ie=Array.isArray,De=r=>ie(r)||typeof(r==null?void 0:r[Symbol.iterator])=="function",W=`[ 	
\f\r]`,k=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ce=/-->/g,pe=/>/g,v=RegExp(`>|${W}(?:([^\\s"'>=/]+)(${W}*=${W}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ue=/'/g,fe=/"/g,ve=/^(?:script|style|textarea|title)$/i,je=r=>(e,...t)=>({_$litType$:r,strings:e,values:t}),c=je(1),E=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),me=new WeakMap,A=w.createTreeWalker(w,129);function Ae(r,e){if(!ie(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return de!==void 0?de.createHTML(e):e}const qe=(r,e)=>{const t=r.length-1,s=[];let i,n=e===2?"<svg>":e===3?"<math>":"",o=k;for(let l=0;l<t;l++){const a=r[l];let h,u,d=-1,f=0;for(;f<a.length&&(o.lastIndex=f,u=o.exec(a),u!==null);)f=o.lastIndex,o===k?u[1]==="!--"?o=ce:u[1]!==void 0?o=pe:u[2]!==void 0?(ve.test(u[2])&&(i=RegExp("</"+u[2],"g")),o=v):u[3]!==void 0&&(o=v):o===v?u[0]===">"?(o=i??k,d=-1):u[1]===void 0?d=-2:(d=o.lastIndex-u[2].length,h=u[1],o=u[3]===void 0?v:u[3]==='"'?fe:ue):o===fe||o===ue?o=v:o===ce||o===pe?o=k:(o=v,i=void 0);const $=o===v&&r[l+1].startsWith("/>")?" ":"";n+=o===k?a+Le:d>=0?(s.push(h),a.slice(0,d)+ye+a.slice(d)+y+$):a+y+(d===-2?l:$)}return[Ae(r,n+(r[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]};class U{constructor({strings:e,_$litType$:t},s){let i;this.parts=[];let n=0,o=0;const l=e.length-1,a=this.parts,[h,u]=qe(e,t);if(this.el=U.createElement(h,s),A.currentNode=this.el.content,t===2||t===3){const d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(i=A.nextNode())!==null&&a.length<l;){if(i.nodeType===1){if(i.hasAttributes())for(const d of i.getAttributeNames())if(d.endsWith(ye)){const f=u[o++],$=i.getAttribute(d).split(y),x=/([.?@])?(.*)/.exec(f);a.push({type:1,index:n,name:x[2],strings:$,ctor:x[1]==="."?We:x[1]==="?"?Fe:x[1]==="@"?Ve:q}),i.removeAttribute(d)}else d.startsWith(y)&&(a.push({type:6,index:n}),i.removeAttribute(d));if(ve.test(i.tagName)){const d=i.textContent.split(y),f=d.length-1;if(f>0){i.textContent=j?j.emptyScript:"";for(let $=0;$<f;$++)i.append(d[$],N()),A.nextNode(),a.push({type:2,index:++n});i.append(d[f],N())}}}else if(i.nodeType===8)if(i.data===be)a.push({type:2,index:n});else{let d=-1;for(;(d=i.data.indexOf(y,d+1))!==-1;)a.push({type:7,index:n}),d+=y.length-1}n++}}static createElement(e,t){const s=w.createElement("template");return s.innerHTML=e,s}}function M(r,e,t=r,s){var o,l;if(e===E)return e;let i=s!==void 0?(o=t._$Co)==null?void 0:o[s]:t._$Cl;const n=H(e)?void 0:e._$litDirective$;return(i==null?void 0:i.constructor)!==n&&((l=i==null?void 0:i._$AO)==null||l.call(i,!1),n===void 0?i=void 0:(i=new n(r),i._$AT(r,t,s)),s!==void 0?(t._$Co??(t._$Co=[]))[s]=i:t._$Cl=i),i!==void 0&&(e=M(r,i._$AS(r,e.values),i,s)),e}class Be{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:s}=this._$AD,i=((e==null?void 0:e.creationScope)??w).importNode(t,!0);A.currentNode=i;let n=A.nextNode(),o=0,l=0,a=s[0];for(;a!==void 0;){if(o===a.index){let h;a.type===2?h=new z(n,n.nextSibling,this,e):a.type===1?h=new a.ctor(n,a.name,a.strings,this,e):a.type===6&&(h=new Ge(n,this,e)),this._$AV.push(h),a=s[++l]}o!==(a==null?void 0:a.index)&&(n=A.nextNode(),o++)}return A.currentNode=w,i}p(e){let t=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}}class z{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,t,s,i){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=i,this._$Cv=(i==null?void 0:i.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=M(this,e,t),H(e)?e===p||e==null||e===""?(this._$AH!==p&&this._$AR(),this._$AH=p):e!==this._$AH&&e!==E&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):De(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==p&&H(this._$AH)?this._$AA.nextSibling.data=e:this.T(w.createTextNode(e)),this._$AH=e}$(e){var n;const{values:t,_$litType$:s}=e,i=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=U.createElement(Ae(s.h,s.h[0]),this.options)),s);if(((n=this._$AH)==null?void 0:n._$AD)===i)this._$AH.p(t);else{const o=new Be(i,this),l=o.u(this.options);o.p(t),this.T(l),this._$AH=o}}_$AC(e){let t=me.get(e.strings);return t===void 0&&me.set(e.strings,t=new U(e)),t}k(e){ie(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let s,i=0;for(const n of e)i===t.length?t.push(s=new z(this.O(N()),this.O(N()),this,this.options)):s=t[i],s._$AI(n),i++;i<t.length&&(this._$AR(s&&s._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){var s;for((s=this._$AP)==null?void 0:s.call(this,!1,!0,t);e!==this._$AB;){const i=he(e).nextSibling;he(e).remove(),e=i}}setConnected(e){var t;this._$AM===void 0&&(this._$Cv=e,(t=this._$AP)==null||t.call(this,e))}}class q{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,i,n){this.type=1,this._$AH=p,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=n,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=p}_$AI(e,t=this,s,i){const n=this.strings;let o=!1;if(n===void 0)e=M(this,e,t,0),o=!H(e)||e!==this._$AH&&e!==E,o&&(this._$AH=e);else{const l=e;let a,h;for(e=n[0],a=0;a<n.length-1;a++)h=M(this,l[s+a],t,a),h===E&&(h=this._$AH[a]),o||(o=!H(h)||h!==this._$AH[a]),h===p?e=p:e!==p&&(e+=(h??"")+n[a+1]),this._$AH[a]=h}o&&!i&&this.j(e)}j(e){e===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class We extends q{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===p?void 0:e}}class Fe extends q{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==p)}}class Ve extends q{constructor(e,t,s,i,n){super(e,t,s,i,n),this.type=5}_$AI(e,t=this){if((e=M(this,e,t,0)??p)===E)return;const s=this._$AH,i=e===p&&s!==p||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,n=e!==p&&(s===p||i);i&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t;typeof this._$AH=="function"?this._$AH.call(((t=this.options)==null?void 0:t.host)??this.element,e):this._$AH.handleEvent(e)}}class Ge{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){M(this,e)}}const F=O.litHtmlPolyfillSupport;F==null||F(U,z),(O.litHtmlVersions??(O.litHtmlVersions=[])).push("3.3.2");const Xe=(r,e,t)=>{const s=(t==null?void 0:t.renderBefore)??e;let i=s._$litPart$;if(i===void 0){const n=(t==null?void 0:t.renderBefore)??null;s._$litPart$=i=new z(e.insertBefore(N(),n),n,void 0,t??{})}return i._$AI(r),i};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const S=globalThis;let _=class extends P{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;const e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Xe(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)==null||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)==null||e.setConnected(!1)}render(){return E}};var ge;_._$litElement$=!0,_.finalized=!0,(ge=S.litElementHydrateSupport)==null||ge.call(S,{LitElement:_});const V=S.litElementPolyfillSupport;V==null||V({LitElement:_});(S.litElementVersions??(S.litElementVersions=[])).push("4.2.2");class X extends _{constructor(){super(),this.route="index"}get _links(){return[{label:"Матриця",path:"superintellect/index"},{label:"Курс",path:"superintellect/course"},{label:"Реєстрація",path:"superintellect/registration"},{label:"Платформи",path:"PLATFORMS"}]}_onNavigate(e,t){e.preventDefault(),this.dispatchEvent(new CustomEvent("navigate",{detail:{path:t},bubbles:!0,composed:!0}))}render(){return c`
      <nav>
        <a class="logo" @click=${e=>this._onNavigate(e,"index")}>
          <img src="/willni/logo.svg" alt="ВОЛЯ" />
        </a>
        <div class="menu">
          ${this._links.map(e=>c`
              <a
                ?active=${this.route===e.path}
                @click=${t=>this._onNavigate(t,e.path)}
                >${e.label}</a
              >
            `)}
        </div>
      </nav>
    `}}g(X,"properties",{route:{type:String}}),g(X,"styles",I`
    :host {
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      font-family:
        "Inter",
        -apple-system,
        sans-serif;
    }

    nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      text-decoration: none;
    }

    .logo img {
      height: 40px;
    }

    .menu {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(15px);
      border-radius: 30px;
      padding: 4px 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .menu a {
      color: rgba(255, 255, 255, 0.85);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 8px 16px;
      border-radius: 20px;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .menu a:hover {
      color: #fdf200;
      text-shadow: 0 0 15px rgba(253, 242, 0, 0.5);
    }

    .menu a[active] {
      color: #fdf200;
      background: rgba(253, 242, 0, 0.1);
    }

    @media (max-width: 768px) {
      .menu {
        display: none;
      }
    }
  `);customElements.define("ui-nav",X);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ye={CHILD:2},Ke=r=>(...e)=>({_$litDirective$:r,values:e});class Ze{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,s){this._$Ct=e,this._$AM=t,this._$Ci=s}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class Y extends Ze{constructor(e){if(super(e),this.it=p,e.type!==Ye.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===p||e==null)return this._t=void 0,this.it=e;if(e===E)return e;if(typeof e!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}}Y.directiveName="unsafeHTML",Y.resultType=1;const T=Ke(Y);class K extends _{constructor(){super(),this.content=[]}_parseInline(e){return e?e.replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/\*([^*]+)\*/g,"<em>$1</em>").replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank">$1</a>'):""}_renderBlock(e){switch(e.type){case"heading":{const t=`h${e.level||1}`;return c`${T(`<${t}>${this._parseInline(e.text)}</${t}>`)}`}case"paragraph":return c`<p>${T(this._parseInline(e.text))}</p>`;case"list":return e.ordered?c`<ol>
            ${e.items.map(t=>c`<li>${T(this._parseInline(t))}</li>`)}
          </ol>`:c`<ul>
          ${e.items.map(t=>c`<li>${T(this._parseInline(t))}</li>`)}
        </ul>`;case"code":return c`<pre><code>${e.text}</code></pre>`;case"blockquote":return c`<blockquote>
          ${T(this._parseInline(e.text))}
        </blockquote>`;case"hr":return c`<hr />`;default:return c`<p>${e.text||""}</p>`}}render(){return!this.content||this.content.length===0?c``:c`${this.content.map(e=>this._renderBlock(e))}`}}g(K,"properties",{content:{type:Array}}),g(K,"styles",I`
    :host {
      display: block;
      line-height: 1.7;
      color: #e0e0e0;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: #fff;
      margin: 2rem 0 1rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    h1 {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 900;
      background: linear-gradient(135deg, #fff 30%, #888);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    h2 {
      font-size: 1.8rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 0.5rem;
    }

    h3 {
      font-size: 1.4rem;
    }
    h4 {
      font-size: 1.15rem;
    }

    p {
      margin: 1rem 0;
      color: rgba(255, 255, 255, 0.8);
    }

    ul,
    ol {
      padding-left: 1.5rem;
      margin: 1rem 0;
    }

    li {
      margin: 0.4rem 0;
      color: rgba(255, 255, 255, 0.8);
    }

    li::marker {
      color: #fdf200;
    }

    pre {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 20px 24px;
      overflow-x: auto;
      margin: 1.5rem 0;
      font-family: "SF Mono", "Fira Code", monospace;
      font-size: 14px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.85);
    }

    blockquote {
      border-left: 4px solid #fdf200;
      padding: 1rem 1.5rem;
      margin: 1.5rem 0;
      background: rgba(253, 242, 0, 0.03);
      border-radius: 0 8px 8px 0;
      font-style: italic;
      color: rgba(255, 255, 255, 0.75);
    }

    hr {
      border: none;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        transparent
      );
      margin: 3rem 0;
    }

    /* Inline formatting */
    strong,
    b {
      color: #fff;
    }
    em,
    i {
      color: rgba(255, 255, 255, 0.9);
    }

    a {
      color: #fdf200;
      text-decoration: none;
      border-bottom: 1px solid rgba(253, 242, 0, 0.3);
      transition: border-color 0.3s;
    }

    a:hover {
      border-bottom-color: #fdf200;
    }

    code {
      background: rgba(255, 255, 255, 0.06);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: "SF Mono", monospace;
      font-size: 0.9em;
    }
  `);customElements.define("ui-markdown",K);class Z extends _{constructor(){super(),this.document=null,this.loading=!0,this.error=""}render(){if(this.loading)return c`<div class="loading">Завантаження</div>`;if(this.error)return c`
        <div class="error">
          <div class="error-code">404</div>
          <div class="error-text">${this.error}</div>
        </div>
      `;if(!this.document)return c``;const{title:e,description:t,layout:s,$content:i=[]}=this.document;return c`
      <div class="content">
        ${e?c`<h1 class="title">${e}</h1>`:""}
        ${t?c`<p class="meta">${t}</p>`:""}
        <ui-markdown .content=${i}></ui-markdown>
      </div>
    `}}g(Z,"properties",{document:{type:Object},loading:{type:Boolean},error:{type:String}}),g(Z,"styles",I`
    :host {
      display: block;
      min-height: 100vh;
      position: relative;
      z-index: 1;
    }

    .content {
      max-width: 800px;
      margin: 0 auto;
      padding: 120px 32px 96px;
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .title {
      font-size: clamp(2.5rem, 7vw, 4rem);
      font-weight: 900;
      letter-spacing: -0.04em;
      line-height: 0.95;
      margin: 0 0 2rem;
      background: linear-gradient(135deg, #fff 30%, #666);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .meta {
      color: rgba(255, 255, 255, 0.4);
      font-size: 14px;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      color: rgba(255, 255, 255, 0.3);
      font-size: 1.2rem;
    }

    .loading::after {
      content: "";
      width: 24px;
      height: 24px;
      margin-left: 12px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-top-color: #fdf200;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
    }

    .error-code {
      font-size: 6rem;
      font-weight: 900;
      color: rgba(255, 255, 255, 0.06);
      line-height: 1;
    }

    .error-text {
      color: rgba(255, 255, 255, 0.4);
      font-size: 1.1rem;
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .content {
        padding: 100px 20px 64px;
      }
    }
  `);customElements.define("ui-page",Z);class J extends _{constructor(){super(),this._blurAmount=16,this._animId=null,this._time=0,this._shipX=-120,this._speedIndex=0,this._speeds=[.4,.8,1.6,3.2,6],this._waves=[],this._stars=Array.from({length:150},()=>({x:Math.random(),y:Math.random(),size:Math.random()*1.5,blink:Math.random()}))}connectedCallback(){super.connectedCallback(),this._initWaves(),this.updateComplete.then(()=>{this._animId=requestAnimationFrame(()=>this._animate())})}disconnectedCallback(){super.disconnectedCallback(),this._animId&&cancelAnimationFrame(this._animId)}_initWaves(){this._waves=[];for(let t=0;t<6;t++)this._waves.push({amplitude:12/(t+1),frequency:.005+t*.002,speed:.004+t*.004,phase:Math.random()*Math.PI*2})}_getSkyColors(){return{top:"#02050a",mid:"#050a14",horizon:"#0a1a35"}}_animate(){var o;const e=(o=this.renderRoot)==null?void 0:o.querySelector("canvas");if(!e)return;const t=e.getContext("2d"),s=window.devicePixelRatio||1,i=window.innerWidth,n=window.innerHeight;e.width=i*s,e.height=n*s,e.style.width=i+"px",e.style.height=n+"px",t.scale(s,s),this._draw(t,i,n),this._animId=requestAnimationFrame(()=>this._animate())}_draw(e,t,s){this._time+=1;const i=s*.42,n=this._getSkyColors();e.fillStyle=n.top,e.fillRect(0,0,t,s);const o=e.createLinearGradient(0,0,0,i);o.addColorStop(0,n.top),o.addColorStop(.6,n.mid),o.addColorStop(1,n.horizon),e.fillStyle=o,e.fillRect(0,0,t,i),e.fillStyle="rgba(255, 255, 255, 0.8)",this._stars.forEach(m=>{e.globalAlpha=Math.max(0,.3+Math.sin(this._time*.04+m.blink*10)*.5),e.beginPath(),e.arc(m.x*t,m.y*i*.9,m.size,0,Math.PI*2),e.fill()}),e.globalAlpha=1;const l=(.5-.25)*Math.PI*2,a=t/2+Math.cos(l)*(t*.45),h=i-Math.sin(l)*(i*.85);if(h<i+80){e.save();const C=e.createRadialGradient(a,h,0,a,h,60);C.addColorStop(0,"rgba(200, 220, 255, 0.3)"),C.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=C,e.beginPath(),e.arc(a,h,60,0,Math.PI*2),e.fill(),e.fillStyle="#e0e0e0",e.beginPath(),e.arc(a,h,30,0,Math.PI*2),e.fill(),e.fillStyle=n.top,e.beginPath(),e.arc(a+30*.5,h-30*.2,30*.9,0,Math.PI*2),e.fill(),e.restore()}const u="#000206",d="#000000",f=e.createLinearGradient(0,i,0,s);f.addColorStop(0,u),f.addColorStop(1,d),e.fillStyle=f,e.fillRect(0,i,t,s-i);const $=this._waves.length;this._waves.forEach((m,C)=>{m.phase+=m.speed;const re=(C+1)/$;e.beginPath(),e.moveTo(0,i);for(let L=0;L<=t;L+=15){const Ce=i+C*25+Math.sin(L*m.frequency+m.phase)*m.amplitude*re;e.lineTo(L,Ce)}e.lineTo(t,s),e.lineTo(0,s),e.closePath();const xe=(.02+re*.08)*.25;e.fillStyle=`rgba(255,255,255,${xe})`,e.fill()});const x=this._speeds[this._speedIndex];this._shipX+=x,this._shipX>t+200&&(this._shipX=-150);const Se=1-this._speedIndex/(this._speeds.length-1),we=Math.sin(this._time*.04)*(1+Se*12),Ee=i+30+Math.sin(this._time*.05)*3,se=.3;e.save(),e.translate(this._shipX+30,Ee+30),e.rotate(we*Math.PI/180),e.translate(-30,-30),e.fillStyle=`rgba(255, 255, 255, ${se})`,e.beginPath(),e.moveTo(5,40),e.lineTo(55,40),e.lineTo(45,55),e.lineTo(15,55),e.closePath(),e.fill(),e.fillStyle=`rgba(255, 255, 255, ${se*.7})`,e.beginPath(),e.moveTo(30,5),e.lineTo(30,40),e.lineTo(10,35),e.closePath(),e.fill(),e.beginPath(),e.moveTo(32,8),e.lineTo(32,40),e.lineTo(50,35),e.closePath(),e.fill(),e.restore()}render(){return c`<canvas
      style="filter: blur(${this._blurAmount}px); transition: filter 0.5s ease-out"
    ></canvas>`}}g(J,"properties",{_blurAmount:{type:Number,state:!0}}),g(J,"styles",I`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 0;
      pointer-events: none;
    }

    canvas {
      width: 100%;
      height: 100%;
    }
  `);customElements.define("ui-sea",J);class Q extends _{constructor(){super(),this.route=this._getRoute(),this.document=null,this.loading=!0,this.error=""}connectedCallback(){super.connectedCallback(),window.addEventListener("popstate",()=>{this.route=this._getRoute(),this._loadContent()}),this._loadContent()}_getRoute(){return location.pathname.replace(/^\/willni\/?/,"").replace(/\/$/,"")||"index"}async _loadContent(){this.loading=!0,this.error="";try{let e=this.route.replace(/^\/+/,"");e||(e="index");const t=await fetch(`/willni/data/content/${e}.json`);if(!t.ok)throw new Error(`${t.status}`);this.document=await t.json()}catch{this.error=`Сторінку "${this.route}" не знайдено`,this.document=null}this.loading=!1}navigate(e){const t=e.replace(/^\//,"").replace(/\/$/,"")||"index";history.pushState(null,"",`/willni/${t}`),this.route=t,this._loadContent()}render(){return c`
      <ui-sea></ui-sea>
      <ui-nav
        .route=${this.route}
        @navigate=${e=>this.navigate(e.detail.path)}
      ></ui-nav>
      <ui-page
        .document=${this.document}
        .loading=${this.loading}
        .error=${this.error}
      ></ui-page>
    `}}g(Q,"properties",{route:{type:String,state:!0},document:{type:Object,state:!0},loading:{type:Boolean,state:!0},error:{type:String,state:!0}}),g(Q,"styles",I`
    :host {
      display: block;
      min-height: 100vh;
      font-family:
        "Inter",
        -apple-system,
        sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #e0e0e0;
      background: #000206;
    }
  `);customElements.define("ui-app",Q);
