// Tema claro/escuro. A preferência fica no navegador (localStorage) e é aplicada
// como <html data-tema="claro|escuro">, que o globals.css usa para trocar os tokens.

export type Tema = "claro" | "escuro";

export const CHAVE_TEMA = "tema";

/** Telas que são sempre claras, independentemente da preferência (ex.: login). */
export const ROTAS_SEMPRE_CLARAS = ["/login"];

/**
 * Roda no <head>, antes da primeira pintura, para não piscar o tema errado.
 * Padrão: claro. Nas rotas sempre claras, ignora a preferência.
 */
export const SCRIPT_TEMA = `(function(){try{var r=${JSON.stringify(ROTAS_SEMPRE_CLARAS)};for(var i=0;i<r.length;i++)if(location.pathname.indexOf(r[i])===0)return;if(localStorage.getItem("${CHAVE_TEMA}")==="escuro")document.documentElement.setAttribute("data-tema","escuro")}catch(_){}})()`;
