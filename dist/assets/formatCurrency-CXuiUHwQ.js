function t(r){if(typeof r!="number"||isNaN(r))return"$0.00";const n=Math.round(r*100)/100;return new Intl.NumberFormat("es-EC",{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2}).format(n)}export{t as f};
//# sourceMappingURL=formatCurrency-CXuiUHwQ.js.map
