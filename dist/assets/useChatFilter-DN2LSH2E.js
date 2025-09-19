import{g as a,N as r}from"./admin-chunk-bhOJ3jtA.js";import"./ui-vendor-DEBjJ4HS.js";import"./react-vendor-Cy458wKG.js";const c=()=>{const{showToast:i}=a();return{showUserWarning:(e,s)=>{let o=e;s&&(o+=`

Mensaje filtrado: "${s}"`),i(r.WARNING,o,{duration:8e3,position:"top-right"})},showSellerStrike:(e,s,o)=>{let t=e;o&&(t+=`

Mensaje filtrado: "${o}"`),t+=`

Strikes: ${s}/3`,s>=3&&(t+=`
Tu cuenta ha sido bloqueada por acumular 3 strikes.`),i(r.ERROR,t,{duration:1e4,position:"top-right",persistent:s>=3})},showSellerBlocked:e=>{i(r.ERROR,e,{persistent:!0,position:"top-right"})}}};export{c as u};
//# sourceMappingURL=useChatFilter-DN2LSH2E.js.map
