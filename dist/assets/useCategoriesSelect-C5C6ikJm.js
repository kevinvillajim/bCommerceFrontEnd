import{c as n,r as o}from"./index-DmNDOrWy.js";import{u as C}from"./useCategories-B5xz5QTT.js";/**
 * @license lucide-react v0.484.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]],b=n("image",x);/**
 * @license lucide-react v0.484.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=[["path",{d:"M12 22v-9",key:"x3hkom"}],["path",{d:"M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z",key:"2ntwy6"}],["path",{d:"M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13",key:"1pmm1c"}],["path",{d:"M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z",key:"12ttoo"}]],I=n("package-open",M);/**
 * @license lucide-react v0.484.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=[["circle",{cx:"13.5",cy:"6.5",r:".5",fill:"currentColor",key:"1okk4w"}],["circle",{cx:"17.5",cy:"10.5",r:".5",fill:"currentColor",key:"f64h9f"}],["circle",{cx:"8.5",cy:"7.5",r:".5",fill:"currentColor",key:"fotxhn"}],["circle",{cx:"6.5",cy:"12.5",r:".5",fill:"currentColor",key:"qy21gx"}],["path",{d:"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z",key:"12rzf8"}]],S=n("palette",_);/**
 * @license lucide-react v0.484.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["path",{d:"M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z",key:"icamh8"}],["path",{d:"m14.5 12.5 2-2",key:"inckbg"}],["path",{d:"m11.5 9.5 2-2",key:"fmmyf7"}],["path",{d:"m8.5 6.5 2-2",key:"vc6u1g"}],["path",{d:"m17.5 15.5 2-2",key:"wo5hmg"}]],w=n("ruler",v),O=()=>{const{categories:s,mainCategories:c,fetchCategories:u,fetchMainCategories:d}=C(),[f,p]=o.useState(!0),[h,m]=o.useState(null),[r,y]=o.useState(null);o.useEffect(()=>{(async()=>{p(!0);try{await d(!0),await u(!0)}catch(e){m(e instanceof Error?e.message:"Error al cargar categorías")}finally{p(!1)}})()},[u,d]);const i=o.useMemo(()=>{const t=[];return c.forEach(e=>{e.id&&t.push({value:e.id,label:e.name})}),s.forEach(e=>{e.id&&!e.parent_id&&!t.some(a=>a.value===e.id)&&t.push({value:e.id,label:e.name})}),t},[c,s]),l=o.useMemo(()=>{if(!r)return[];const t=[],e=c.find(a=>a.id===r);return e&&e.subcategories&&e.subcategories.forEach(a=>{a.id&&t.push({value:a.id,label:a.name,isSubcategory:!0,parentId:r})}),s.forEach(a=>{a.id&&a.parent_id===r&&!t.some(g=>g.value===a.id)&&t.push({value:a.id,label:a.name,isSubcategory:!0,parentId:r})}),t},[r,c,s]),k=o.useMemo(()=>[...i,...l],[i,l]);return{loading:f,error:h,categoryOptions:k,parentCategoryOptions:i,subcategoryOptions:l,selectedParentId:r,setSelectedParentId:y}};export{b as I,I as P,w as R,S as a,O as u};
//# sourceMappingURL=useCategoriesSelect-C5C6ikJm.js.map
